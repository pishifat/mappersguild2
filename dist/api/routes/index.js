"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_json_1 = __importDefault(require("../../config.json"));
const crypto_1 = __importDefault(require("crypto"));
const user_1 = require("../models/user");
const mission_1 = require("../models/mission");
const quest_1 = require("../models/quest");
const middlewares_1 = require("../helpers/middlewares");
const osuApi_1 = require("../helpers/osuApi");
const user_2 = require("../../interfaces/user");
const featuredArtist_1 = require("../models/featuredArtist");
const featuredArtist_2 = require("../../interfaces/featuredArtist");
const helpers_1 = require("../helpers/helpers");
const mission_2 = require("../../interfaces/mission");
const indexRouter = express_1.default.Router();
/* GET loggedInUser */
indexRouter.get('/me', async (req, res) => {
    const user = await user_1.UserModel.findById(req.session?.mongoId);
    res.json(user);
});
/* GET home artists */
indexRouter.get('/home/:limit', async (req, res) => {
    let limit = parseInt(req.params.limit);
    if (isNaN(limit)) {
        limit = 12;
    }
    const artists = await featuredArtist_1.FeaturedArtistModel
        .aggregate()
        .match({ $or: [{ status: featuredArtist_2.FeaturedArtistStatus.Public }, { status: featuredArtist_2.FeaturedArtistStatus.Playlist }] })
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
    const state = crypto_1.default.randomBytes(48).toString('hex');
    res.cookie('_state', state, { httpOnly: true });
    const hashedState = Buffer.from(state).toString('base64');
    if (!req.session.lastPage) {
        req.session.lastPage = req.get('referer');
    }
    res.redirect(`https://osu.ppy.sh/oauth/authorize?response_type=code&client_id=${config_json_1.default.id}&redirect_uri=${encodeURIComponent(config_json_1.default.redirect)}&state=${hashedState}&scope=identify`);
});
/* GET logout, by deleting session */
indexRouter.get('/logout', middlewares_1.isLoggedIn, (req, res) => {
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
    let response = await osuApi_1.getToken(req.query.code.toString());
    if (osuApi_1.isOsuResponseError(response)) {
        return res.status(500).redirect('/error');
    }
    helpers_1.setSession(req.session, response);
    response = await osuApi_1.getUserInfo(req.session.accessToken);
    if (osuApi_1.isOsuResponseError(response)) {
        return req.session.destroy(() => {
            res.status(500).redirect('/error');
        });
    }
    const osuId = response.id;
    const username = response.username;
    const group = user_2.UserGroup.User;
    const rankedBeatmapsCount = response.ranked_and_approved_beatmapset_count;
    let globalRank = 0;
    let pp = 0;
    const modesStats = Object.entries(response.statistics_rulesets);
    for (let i = 0; i < modesStats.length; i++) {
        const modeInfo = modesStats[i][1];
        if (modeInfo.pp > pp) {
            pp = modeInfo.pp;
        }
        if (modeInfo.global_rank > globalRank) {
            globalRank = modeInfo.global_rank;
        }
    }
    let user = await user_1.UserModel.findOne({ osuId });
    if (!user) {
        user = new user_1.UserModel();
        user.osuId = osuId;
        user.username = username;
        user.group = group;
        user.rankedBeatmapsCount = rankedBeatmapsCount;
        user.globalRank = globalRank;
        user.pp = pp;
        await user.save();
        req.session.mongoId = user._id;
        // LogModel.generate(req.session.mongoId, `joined the Mappers' Guild`, LogCategory.User);
    }
    else {
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
        if (saveTrigger) {
            await user.save();
        }
        req.session.mongoId = user._id;
    }
    req.session.osuId = osuId;
    let lastPage = req.session.lastPage;
    req.session.lastPage = undefined;
    if (!lastPage) {
        if (user.group === user_2.UserGroup.Admin) {
            lastPage = '/artists';
        }
        else {
            lastPage = '/faq';
        }
    }
    res.redirect(lastPage);
});
/* POST toggle isShowcaseMapper */
indexRouter.post('/toggleIsShowcaseMapper', async (req, res) => {
    const user = await user_1.UserModel.findByIdAndUpdate(req.session?.mongoId, { isShowcaseMapper: req.body.value });
    res.json(user);
});
/* POST toggle isContestHelper */
indexRouter.post('/toggleIsContestHelper', async (req, res) => {
    const user = await user_1.UserModel.findByIdAndUpdate(req.session?.mongoId, { isContestHelper: req.body.value });
    res.json(user);
});
/* GET example mission */
indexRouter.get('/exampleMission', async (req, res) => {
    res.json(await mission_1.MissionModel
        .findOne({
        artists: { $size: 1 },
        openingAnnounced: true,
        status: mission_2.MissionStatus.Hidden,
    })
        .defaultPopulate()
        .orFail());
});
/* GET example quest */
indexRouter.get('/exampleQuest', async (req, res) => {
    res.json(await quest_1.QuestModel.findById('62d0799b1cfaf430df14eae3').defaultPopulate());
});
exports.default = indexRouter;
