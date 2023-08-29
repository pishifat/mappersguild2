import express from 'express';
import config from '../../config.json';
import crypto from 'crypto';
import { UserModel } from '../models/user';
import { MissionModel } from '../models/mission';
import { QuestModel } from '../models/quest';
import { isLoggedIn } from '../helpers/middlewares';
import { getToken, getUserInfo, isOsuResponseError } from '../helpers/osuApi';
import { UserGroup } from '../../interfaces/user';
import { FeaturedArtistModel } from '../models/featuredArtist';
import { FeaturedArtistStatus } from '../../interfaces/featuredArtist';
import { setSession } from '../helpers/helpers';
import { MissionStatus } from '../../interfaces/mission';

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
        limit = 12;
    }

    const artists = await FeaturedArtistModel
        .aggregate()
        .match({ $or: [ { status: FeaturedArtistStatus.Public }, { status: FeaturedArtistStatus.Playlist } ] })
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
    const rankedBeatmapsCount = response.ranked_and_approved_beatmapset_count;

    let globalRank = 0;
    let pp = 0;
    let ppOsu = 0;
    let ppTaiko = 0;
    let ppCatch = 0;
    let ppMania = 0;

    const modesStats: any = Object.entries(response.statistics_rulesets);

    for (let i = 0; i < modesStats.length; i++) {
        const modeInfo = modesStats[i][1];

        switch (i) {
            case 0:
                ppOsu = modeInfo.pp;
                break;
            case 1:
                ppTaiko = modeInfo.pp;
                break;
            case 2:
                ppCatch = modeInfo.pp;
                break;
            case 3:
                ppMania = modeInfo.pp;
                break;
        }

        if (modeInfo.pp > pp) {
            pp = modeInfo.pp;
        }

        if (modeInfo.global_rank > globalRank) {
            globalRank = modeInfo.global_rank;
        }
    }

    let user = await UserModel.findOne({ osuId });

    if (!user) {
        user = new UserModel();
        user.osuId = osuId;
        user.username = username;
        user.group = group;
        user.rankedBeatmapsCount = rankedBeatmapsCount;
        user.globalRank = globalRank;
        user.pp = pp;
        user.ppOsu = ppOsu;
        user.ppTaiko = ppTaiko;
        user.ppCatch = ppCatch;
        user.ppMania = ppMania;
        await user.save();

        req.session.mongoId = user._id;

        // LogModel.generate(req.session.mongoId, `joined the Mappers' Guild`, LogCategory.User);
    } else {
        let saveTrigger = false;

        if (user.username != username) {
            user.username = username;
            saveTrigger = true;
        }

        if (user.rankedBeatmapsCount != rankedBeatmapsCount) {
            user.rankedBeatmapsCount = rankedBeatmapsCount;
            saveTrigger = true;
        }

        if (user.globalRank != globalRank) {
            user.globalRank = globalRank;
            saveTrigger = true;
        }

        if (user.pp != pp) {
            user.pp = pp;
            saveTrigger = true;
        }

        if (user.ppOsu != ppOsu) {
            user.ppOsu = ppOsu;
            saveTrigger = true;
        }

        if (user.ppTaiko != ppTaiko) {
            user.ppTaiko = ppTaiko;
            saveTrigger = true;
        }

        if (user.ppCatch != ppCatch) {
            user.ppCatch = ppCatch;
            saveTrigger = true;
        }

        if (user.ppMania != ppMania) {
            user.ppMania = ppMania;
            saveTrigger = true;
        }

        if (saveTrigger) {
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

/* GET example mission */
indexRouter.get('/exampleMission', async (req, res) => {
    res.json(
        await MissionModel
            .findOne({
                artists: { $size: 1 },
                openingAnnounced: true,
                status: MissionStatus.Hidden,
            })
            .defaultPopulate()
            .orFail()
    );
});

/* GET example quest */
indexRouter.get('/exampleQuest', async (req, res) => {
    res.json(await QuestModel.findById('62d0799b1cfaf430df14eae3').defaultPopulate());
});

export default indexRouter;
