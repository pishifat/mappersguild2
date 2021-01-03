import express from 'express';
import config from '../config.json';
import crypto from 'crypto';
import { UserModel } from '../models/user';
import { LogModel } from '../models/log';
import { LogCategory } from '../interfaces/log';
import { isLoggedIn } from '../helpers/middlewares';
import { getToken, getUserInfo, isOsuResponseError } from '../helpers/osuApi';
import { UserGroup } from '../interfaces/user';
import { webhookPost, webhookColors } from '../helpers/discordApi';
import { FeaturedArtistModel } from '../models/featuredArtist';
import { FeaturedArtistStatus } from '../interfaces/featuredArtist';
import { setSession } from '../helpers/helpers';

const indexRouter = express.Router();

indexRouter.get('/me', async (req, res) => {
    const user = await UserModel.findById(req.session?.mongoId);

    res.json(user);
});

/* GET landing page. */
indexRouter.get('/home', async (req, res) => {
    const artists = await FeaturedArtistModel
        .aggregate()
        .match({ status: FeaturedArtistStatus.Public })
        .match({ isUpToDate: true })
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
        .limit(6);

    res.json({
        artists,
    });
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
        return res.status(500).render('error', { message: req.query.error || 'Something went wrong' });
    }

    const decodedState = Buffer.from(req.query.state.toString(), 'base64').toString('ascii');
    const savedState = req.cookies._state;
    res.clearCookie('_state');

    if (decodedState !== savedState) {
        return res.status(403).render('error', { message: 'unauthorized' });
    }

    let response = await getToken(req.query.code.toString());

    if (isOsuResponseError(response)) {
        res.status(500).render('error', { message: response.error });
    } else {
        setSession(req.session, response);
        response = await getUserInfo(req.session.accessToken!);

        if (isOsuResponseError(response)) {
            req.session.destroy(() => {
                res.status(500).render('error');
            });
        } else {
            const osuId = response.id;
            const username = response.username;
            const group = response.ranked_and_approved_beatmapset_count >= 3 ? UserGroup.User : UserGroup.Spectator;
            let user = await UserModel.findOne({ osuId });

            if (!user) {
                user = new UserModel();
                user.osuId = osuId;
                user.username = username;
                user.group = group;
                await user.save();

                req.session.mongoId = user._id;

                if (user.group == UserGroup.User) {
                    webhookPost([{
                        author: {
                            name: user.username,
                            icon_url: `https://a.ppy.sh/${user.osuId}`,
                            url: `https://osu.ppy.sh/u/${user.osuId}`,
                        },
                        color: webhookColors.lightRed,
                        description: `Joined the Mappers' Guild!`,
                    }]);
                    LogModel.generate(req.session.mongoId, `joined the Mappers' Guild`, LogCategory.User);
                } else {
                    LogModel.generate(req.session.mongoId, `verified their account for the first time`, LogCategory.User);
                }
            } else {
                if (user.username != username) {
                    user.username = username;
                    await user.save();
                }

                // User got 3 ranked maps from his last login
                if (user.group === UserGroup.Spectator && group === UserGroup.User && !user.bypassLogin) {
                    user.group = group;
                    await user.save();

                    webhookPost([{
                        author: {
                            name: user.username,
                            icon_url: `https://a.ppy.sh/${user.osuId}`,
                            url: `https://osu.ppy.sh/u/${user.osuId}`,
                        },
                        color: webhookColors.lightRed,
                        description: `Joined the Mappers' Guild!`,
                    }]);
                    LogModel.generate(user._id, `joined the Mappers' Guild`, LogCategory.User);
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
        }
    }
});

export default indexRouter;
