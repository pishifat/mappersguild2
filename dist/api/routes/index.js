"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_json_1 = __importDefault(require("../../config.json"));
const crypto_1 = __importDefault(require("crypto"));
const user_1 = require("../models/user");
const log_1 = require("../models/log");
const log_2 = require("../../interfaces/log");
const middlewares_1 = require("../helpers/middlewares");
const osuApi_1 = require("../helpers/osuApi");
const user_2 = require("../../interfaces/user");
const discordApi_1 = require("../helpers/discordApi");
const featuredArtist_1 = require("../models/featuredArtist");
const featuredArtist_2 = require("../../interfaces/featuredArtist");
const helpers_1 = require("../helpers/helpers");
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
        limit = 6;
    }
    const artists = await featuredArtist_1.FeaturedArtistModel
        .aggregate()
        .match({ status: featuredArtist_2.FeaturedArtistStatus.Public })
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
        .limit(limit);
    res.json({
        artists,
    });
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
    const group = response.ranked_and_approved_beatmapset_count >= 3 ? user_2.UserGroup.User : user_2.UserGroup.Spectator;
    let user = await user_1.UserModel.findOne({ osuId });
    if (!user) {
        user = new user_1.UserModel();
        user.osuId = osuId;
        user.username = username;
        user.group = group;
        await user.save();
        req.session.mongoId = user._id;
        if (user.group == user_2.UserGroup.User) {
            discordApi_1.webhookPost([{
                    author: {
                        name: user.username,
                        icon_url: `https://a.ppy.sh/${user.osuId}`,
                        url: `https://osu.ppy.sh/u/${user.osuId}`,
                    },
                    color: discordApi_1.webhookColors.lightRed,
                    description: `Joined the Mappers' Guild!`,
                }]);
            log_1.LogModel.generate(req.session.mongoId, `joined the Mappers' Guild`, log_2.LogCategory.User);
        }
        else {
            log_1.LogModel.generate(req.session.mongoId, `verified their account for the first time`, log_2.LogCategory.User);
        }
    }
    else {
        if (user.username != username) {
            user.username = username;
            await user.save();
        }
        // User got 3 ranked maps from his last login
        if (user.group === user_2.UserGroup.Spectator && group === user_2.UserGroup.User && !user.bypassLogin) {
            user.group = group;
            await user.save();
            discordApi_1.webhookPost([{
                    author: {
                        name: user.username,
                        icon_url: `https://a.ppy.sh/${user.osuId}`,
                        url: `https://osu.ppy.sh/u/${user.osuId}`,
                    },
                    color: discordApi_1.webhookColors.lightRed,
                    description: `Joined the Mappers' Guild!`,
                }]);
            log_1.LogModel.generate(user._id, `joined the Mappers' Guild`, log_2.LogCategory.User);
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
exports.default = indexRouter;
