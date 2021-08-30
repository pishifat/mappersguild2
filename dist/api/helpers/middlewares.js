"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBn = exports.isNotSpectator = exports.isSuperAdmin = exports.isSecret = exports.isAdmin = exports.isLoggedIn = exports.unauthorize = void 0;
const user_1 = require("../models/user");
const user_2 = require("../../interfaces/user");
const osuApi_1 = require("./osuApi");
function unauthorize(req, res) {
    if (req.accepts(['html', 'json']) === 'json') {
        res.json({ error: 'Unauthorized - May need to login first' });
    }
    else {
        res.redirect('/');
    }
}
exports.unauthorize = unauthorize;
async function isLoggedIn(req, res, next) {
    if (!req.session.mongoId) {
        if (req.accepts(['html', 'json']) !== 'json') {
            req.session.lastPage = req.originalUrl;
        }
        return unauthorize(req, res);
    }
    const u = await user_1.UserModel.findById(req.session.mongoId);
    if (!u)
        return unauthorize(req, res);
    // Refresh if less than 10 hours left
    if (new Date() > new Date(req.session.expireDate - (10 * 3600 * 1000))) {
        const response = await osuApi_1.refreshToken(req.session.refreshToken);
        if (!response || osuApi_1.isOsuResponseError(response)) {
            req.session.destroy();
            return res.redirect('/');
        }
        // *1000 because maxAge is miliseconds, oauth is seconds
        req.session.cookie.maxAge = response.expires_in * 2 * 1000;
        req.session.expireDate = Date.now() + (response.expires_in * 1000);
        req.session.accessToken = response.access_token;
        req.session.refreshToken = response.refresh_token;
    }
    res.locals.userRequest = u;
    next();
}
exports.isLoggedIn = isLoggedIn;
function isAdmin(req, res, next) {
    if (res.locals.userRequest.group == user_2.UserGroup.Admin) {
        next();
    }
    else {
        unauthorize(req, res);
    }
}
exports.isAdmin = isAdmin;
function isSecret(req, res, next) {
    if (res.locals.userRequest.group == user_2.UserGroup.Secret || res.locals.userRequest.group == user_2.UserGroup.Admin) {
        next();
    }
    else {
        unauthorize(req, res);
    }
}
exports.isSecret = isSecret;
function isSuperAdmin(req, res, next) {
    if (res.locals.userRequest.osuId == 3178418 || res.locals.userRequest.osuId == 1052994) {
        next();
    }
    else {
        unauthorize(req, res);
    }
}
exports.isSuperAdmin = isSuperAdmin;
function isNotSpectator(req, res, next) {
    if (res.locals.userRequest.group != user_2.UserGroup.Spectator) {
        next();
    }
    else {
        return res.json({ error: 'You need 3+ ranked maps to do this! You can only join parties/beatmaps through invites.' });
    }
}
exports.isNotSpectator = isNotSpectator;
async function isBn(accessToken) {
    if (accessToken) {
        const res = await osuApi_1.getUserInfo(accessToken);
        if (!osuApi_1.isOsuResponseError(res) && (res.is_nat || res.is_bng)) {
            return true;
        }
    }
    return false;
}
exports.isBn = isBn;