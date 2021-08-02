"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_json_1 = __importDefault(require("../config.json"));
const crypto_1 = __importDefault(require("crypto"));
const user_1 = require("../models/user");
const log_1 = require("../models/log");
const log_2 = require("../interfaces/log");
const middlewares_1 = require("../helpers/middlewares");
const osuApi_1 = require("../helpers/osuApi");
const user_2 = require("../interfaces/user");
const discordApi_1 = require("../helpers/discordApi");
const featuredArtist_1 = require("../models/featuredArtist");
const featuredArtist_2 = require("../interfaces/featuredArtist");
const helpers_1 = require("../helpers/helpers");
const indexRouter = express_1.default.Router();
indexRouter.get('/me', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield user_1.UserModel.findById((_a = req.session) === null || _a === void 0 ? void 0 : _a.mongoId);
    res.json(user);
}));
indexRouter.get('/home/:limit', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let limit = parseInt(req.params.limit);
    if (isNaN(limit)) {
        limit = 6;
    }
    const artists = yield featuredArtist_1.FeaturedArtistModel
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
}));
indexRouter.get('/login', (req, res) => {
    const state = crypto_1.default.randomBytes(48).toString('hex');
    res.cookie('_state', state, { httpOnly: true });
    const hashedState = Buffer.from(state).toString('base64');
    if (!req.session.lastPage) {
        req.session.lastPage = req.get('referer');
    }
    res.redirect(`https://osu.ppy.sh/oauth/authorize?response_type=code&client_id=${config_json_1.default.oauth.id}&redirect_uri=${encodeURIComponent(config_json_1.default.oauth.redirect)}&state=${hashedState}&scope=identify`);
});
indexRouter.get('/logout', middlewares_1.isLoggedIn, (req, res) => {
    req.session.destroy((error) => {
        console.log(error);
        return res.redirect('/');
    });
});
indexRouter.get('/callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.query.code || req.query.error || !req.query.state) {
        return res.status(500).render('error', { message: req.query.error || 'Something went wrong' });
    }
    const decodedState = Buffer.from(req.query.state.toString(), 'base64').toString('ascii');
    const savedState = req.cookies._state;
    res.clearCookie('_state');
    if (decodedState !== savedState) {
        return res.status(403).render('error', { message: 'unauthorized' });
    }
    let response = yield osuApi_1.getToken(req.query.code.toString());
    if (osuApi_1.isOsuResponseError(response)) {
        res.status(500).render('error', { message: response.error });
    }
    else {
        helpers_1.setSession(req.session, response);
        response = yield osuApi_1.getUserInfo(req.session.accessToken);
        if (osuApi_1.isOsuResponseError(response)) {
            req.session.destroy(() => {
                res.status(500).render('error');
            });
        }
        else {
            const osuId = response.id;
            const username = response.username;
            const group = response.ranked_and_approved_beatmapset_count >= 3 ? user_2.UserGroup.User : user_2.UserGroup.Spectator;
            let user = yield user_1.UserModel.findOne({ osuId });
            if (!user) {
                user = new user_1.UserModel();
                user.osuId = osuId;
                user.username = username;
                user.group = group;
                yield user.save();
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
                    yield user.save();
                }
                if (user.group === user_2.UserGroup.Spectator && group === user_2.UserGroup.User && !user.bypassLogin) {
                    user.group = group;
                    yield user.save();
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
        }
    }
}));
indexRouter.post('/toggleIsShowcaseMapper', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const user = yield user_1.UserModel.findByIdAndUpdate((_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId, { isShowcaseMapper: req.body.value });
    res.json(user);
}));
exports.default = indexRouter;
