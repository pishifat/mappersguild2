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
const indexRouter = express_1.default.Router();
indexRouter.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if ((_a = req.session) === null || _a === void 0 ? void 0 : _a.osuId) {
        const u = yield user_1.UserModel.findById(req.session.mongoId);
        if (u) {
            return next();
        }
    }
    res.render('index', { title: `Mappers' Guild`, isIndex: true });
}), middlewares_1.isLoggedIn, (req, res) => {
    var _a, _b;
    res.render('index', {
        title: `Mappers' Guild`,
        isIndex: true,
        loggedInAs: (_a = req.session) === null || _a === void 0 ? void 0 : _a.osuId,
        isNotSpectator: res.locals.userRequest.group != user_2.UserGroup.Spectator,
        userMongoId: (_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId,
        pointsInfo: res.locals.userRequest.pointsInfo,
    });
});
indexRouter.get('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    if (((_b = req.session) === null || _b === void 0 ? void 0 : _b.osuId) && ((_c = req.session) === null || _c === void 0 ? void 0 : _c.username)) {
        const u = yield user_1.UserModel.findOne({ osuId: req.session.osuId });
        if (!u) {
            const newUser = new user_1.UserModel();
            newUser.osuId = req.session.osuId;
            newUser.username = req.session.username;
            newUser.group = req.session.group;
            yield newUser.save();
            if (newUser) {
                req.session.mongoId = newUser._id;
                if (newUser.group == user_2.UserGroup.User) {
                    discordApi_1.webhookPost([{
                            author: {
                                name: newUser.username,
                                icon_url: `https://a.ppy.sh/${newUser.osuId}`,
                                url: `https://osu.ppy.sh/u/${newUser.osuId}`,
                            },
                            color: discordApi_1.webhookColors.lightRed,
                            description: `Joined the Mappers' Guild!`,
                        }]);
                    log_1.LogModel.generate(req.session.mongoId, `joined the Mappers' Guild`, log_2.LogCategory.User);
                }
                else {
                    log_1.LogModel.generate(req.session.mongoId, `verified their account for the first time`, log_2.LogCategory.User);
                }
                return next();
            }
            else {
                return res.status(500).render('error', { message: 'Something went wrong!' });
            }
        }
        else {
            if (u.username != req.session.username) {
                u.username = req.session.username;
                yield u.save();
            }
            if (u.group != req.session.group && u.group != 'admin') {
                u.group = req.session.group;
                yield u.save();
                if (req.session.group == 'user') {
                    discordApi_1.webhookPost([{
                            author: {
                                name: u.username,
                                icon_url: `https://a.ppy.sh/${u.osuId}`,
                                url: `https://osu.ppy.sh/u/${u.osuId}`,
                            },
                            color: discordApi_1.webhookColors.lightRed,
                            description: `Joined the Mappers' Guild!`,
                        }]);
                    log_1.LogModel.generate(u._id, `joined the Mappers' Guild`, log_2.LogCategory.User);
                }
            }
            req.session.mongoId = u._id;
            return next();
        }
    }
    if (!req.cookies._state) {
        crypto_1.default.randomBytes(48, function (err, buffer) {
            res.cookie('_state', buffer.toString('hex'));
            res.redirect('/login');
        });
    }
    else {
        const hashedState = Buffer.from(req.cookies._state).toString('base64');
        res.redirect(`https://osu.ppy.sh/oauth/authorize?response_type=code&client_id=${config_json_1.default.id}&redirect_uri=${encodeURIComponent(config_json_1.default.redirect)}&state=${hashedState}&scope=identify`);
    }
}), middlewares_1.isLoggedIn, (req, res) => {
    var _a;
    if ((_a = req === null || req === void 0 ? void 0 : req.session) === null || _a === void 0 ? void 0 : _a.lastPage) {
        res.redirect(req.session.lastPage);
    }
    else if (res.locals.userRequest.group == 'admin') {
        res.redirect('/artists');
    }
    else {
        res.redirect('/faq');
    }
});
indexRouter.get('/logout', middlewares_1.isLoggedIn, (req, res) => {
    var _a;
    (_a = req.session) === null || _a === void 0 ? void 0 : _a.destroy((error) => {
        console.log(error);
        return res.redirect('/');
    });
});
indexRouter.get('/callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.query.code || req.query.error || !req.query.state) {
        return res.redirect('/');
    }
    const decodedState = Buffer.from(req.query.state.toString(), 'base64').toString('ascii');
    if (decodedState !== req.cookies._state) {
        res.clearCookie('_state');
        return res.status(403).render('error', { message: 'unauthorized' });
    }
    let response = yield osuApi_1.getToken(req.query.code.toString());
    if (osuApi_1.isOsuResponseError(response)) {
        res.status(500).render('error', { message: response.error });
    }
    else {
        req.session.cookie.maxAge = response.expires_in * 1000;
        req.session.accessToken = response.access_token;
        req.session.refreshToken = response.refresh_token;
        response = yield osuApi_1.getUserInfo(req.session.accessToken);
        if (osuApi_1.isOsuResponseError(response)) {
            res.status(500).render('error');
        }
        else {
            req.session.group = response.ranked_and_approved_beatmapset_count >= 3 ? 'user' : 'spectator';
            req.session.username = response.username;
            req.session.osuId = response.id;
            res.redirect('/login');
        }
    }
}));
exports.default = indexRouter;
