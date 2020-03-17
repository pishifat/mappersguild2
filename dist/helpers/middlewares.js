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
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../models/user");
const user_2 = require("../interfaces/user");
const osuApi_1 = require("./osuApi");
function isLoggedIn(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.session.mongoId) {
            const u = yield user_1.UserService.queryById(req.session.mongoId);
            if (new Date() > new Date(req.session.expireDate - (10 * 3600 * 1000))) {
                const response = yield osuApi_1.refreshToken(req.session.refreshToken);
                if (!response || osuApi_1.isOsuResponseError(response)) {
                    req.session.destroy();
                    return res.redirect('/');
                }
                req.session.cookie.maxAge = response.expires_in * 2 * 1000;
                req.session.expireDate = Date.now() + (response.expires_in * 1000);
                req.session.accessToken = response.access_token;
                req.session.refreshToken = response.refresh_token;
            }
            res.locals.userRequest = u;
            next();
        }
        else {
            res.redirect('/');
        }
    });
}
exports.isLoggedIn = isLoggedIn;
function isAdmin(req, res, next) {
    if (res.locals.userRequest.group == user_2.UserGroup.Admin) {
        next();
    }
    else {
        res.redirect('/');
    }
}
exports.isAdmin = isAdmin;
function isSuperAdmin(req, res, next) {
    if (res.locals.userRequest.osuId == 3178418 || res.locals.userRequest.osuId == 1052994) {
        next();
    }
    else {
        res.redirect('/');
    }
}
exports.isSuperAdmin = isSuperAdmin;
function isUser(req, res, next) {
    if (res.locals.userRequest.group == user_2.UserGroup.Admin || res.locals.userRequest.group == user_2.UserGroup.User) {
        next();
    }
    else {
        res.redirect('/');
    }
}
exports.isUser = isUser;
function isNotSpectator(req, res, next) {
    if (res.locals.userRequest.group != user_2.UserGroup.Spectator) {
        next();
    }
    else {
        return res.json({ error: 'Spectators cannot perform this action!' });
    }
}
exports.isNotSpectator = isNotSpectator;
function isBn(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        if (accessToken) {
            const res = yield osuApi_1.getUserInfo(accessToken);
            if (!osuApi_1.isOsuResponseError(res) && (res.is_nat || res.is_bng)) {
                return true;
            }
        }
        return false;
    });
}
exports.isBn = isBn;
