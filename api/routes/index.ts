import express from 'express';
import config from '../../config.json';
import crypto from 'crypto';
import { UserModel } from '../models/user';
import { LogModel } from '../models/log';
import { LogCategory } from '../../interfaces/log';
import { isLoggedIn } from '../helpers/middlewares';
import { getToken, getUserInfo, isOsuResponseError } from '../helpers/osuApi';
import { UserGroup } from '../../interfaces/user';
import { webhookPost, webhookColors } from '../helpers/discordApi';
import { FeaturedArtistModel } from '../models/featuredArtist';
import { FeaturedArtistStatus } from '../../interfaces/featuredArtist';
import { setSession } from '../helpers/helpers';
import { QuestModel } from '../models/quest';

const indexRouter = express.Router();

/* GET loggedInUser */
indexRouter.get('/me', async (req, res) => {
    const user = await UserModel.findById(req.session?.mongoId);

    res.json(user);
});

/* GET home artists */
indexRouter.get('/home/:limit', async (req, res) => {
    let limit = parseInt(req.params.limit);

    if (isNaN(limit)) {
        limit = 6;
    }

    const artists = await FeaturedArtistModel
        .aggregate()
        .match({ status: FeaturedArtistStatus.Public })
        .match({ isUpToDate: true })
        .match({ osuId: { $ne: 727 } })
        .sort({ osuId: -1 })
        .lookup({
            from: 'featuredsongs',
            let: { songs: '$songs' },
            pipeline: [
                { $match: { $expr: { $in: ['$_id', '$$songs'] } } },
                {
                    $lookup: {
                        from: 'beatmaps',
                        let: { id: '$_id' },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$song', '$$id'] } } },
                            {
                                $lookup: {
                                    from: 'users',
                                    let: { host: '$host' },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$_id', '$$host'] } } },
                                        { $project: { username: 1 } },
                                    ],
                                    as: 'host',
                                },
                            },
                            { $project: { url: 1, host: 1 } },
                            { $unwind: '$host' },
                        ],
                        as: 'beatmaps',
                    },
                },
                { $project: { beatmaps: 1, title: 1, beatmaps_count: { $size: '$beatmaps' } } },
            ],
            as: 'songs',
        })
        .match({
            'songs.beatmaps_count': { $gt: 0 },
        })
        .limit(limit);

    res.json(artists);
});

/* GET user's code to login */
indexRouter.get('/login', (req, res) => {
    const state = crypto.randomBytes(48).toString('hex');
    res.cookie('_state', state, { httpOnly: true });
    const hashedState = Buffer.from(state).toString('base64');

    if (!req.session.lastPage) {
        req.session.lastPage = req.get('referer');
    }

    res.redirect(
        `https://osu.ppy.sh/oauth/authorize?response_type=code&client_id=${config.id}&redirect_uri=${encodeURIComponent(config.redirect)}&state=${hashedState}&scope=identify`
    );
});

/* GET logout, by deleting session */
indexRouter.get('/logout', isLoggedIn, (req, res) => {
    req.session.destroy((error) => {
        console.log(error);

        return res.redirect('/');
    });
});

/* GET user's token and user's info to login */
indexRouter.get('/callback', async (req, res) => {
    if (!req.query.code || req.query.error || !req.query.state) {
        return res.status(500).redirect('/error');
    }

    const decodedState = Buffer.from(req.query.state.toString(), 'base64').toString('ascii');
    const savedState = req.cookies._state;
    res.clearCookie('_state');

    if (decodedState !== savedState) {
        return res.status(403).redirect('/error');
    }

    let response = await getToken(req.query.code.toString());

    if (isOsuResponseError(response)) {
        return res.status(500).redirect('/error');
    }

    setSession(req.session, response);
    response = await getUserInfo(req.session.accessToken!);

    if (isOsuResponseError(response)) {
        return req.session.destroy(() => {
            res.status(500).redirect('/error');
        });
    }

    const osuId = response.id;
    const username = response.username;
    const group = UserGroup.User;
    let user = await UserModel.findOne({ osuId });

    if (!user) {
        user = new UserModel();
        user.osuId = osuId;
        user.username = username;
        user.group = group;
        await user.save();

        req.session.mongoId = user._id;

        LogModel.generate(req.session.mongoId, `joined the Mappers' Guild`, LogCategory.User);
    } else {
        if (user.username != username) {
            user.username = username;
            await user.save();
        }

        req.session.mongoId = user._id;
    }

    req.session.osuId = osuId;

    let lastPage = req.session.lastPage;
    req.session.lastPage = undefined;

    if (!lastPage) {
        if (user.group === UserGroup.Admin) {
            lastPage = '/artists';
        } else {
            lastPage = '/faq';
        }
    }

    res.redirect(lastPage);
});

/* POST toggle isShowcaseMapper */
indexRouter.post('/toggleIsShowcaseMapper', async (req, res) => {
    const user = await UserModel.findByIdAndUpdate(req.session?.mongoId, { isShowcaseMapper: req.body.value } );

    res.json(user);
});

/* POST toggle isContestHelper */
indexRouter.post('/toggleIsContestHelper', async (req, res) => {
    const user = await UserModel.findByIdAndUpdate(req.session?.mongoId, { isContestHelper: req.body.value } );

    res.json(user);
});

export default indexRouter;
