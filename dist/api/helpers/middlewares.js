"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidUrl = exports.isBn = exports.isSuperAdmin = exports.hasMerchAccess = exports.isLocusAdmin = exports.isWorldCupHelper = exports.isMentorshipAdmin = exports.isShowcase = exports.isAdmin = exports.isValidUser = exports.isLoggedIn = exports.unauthorize = void 0;
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
            req.session.destroy((error) => {
                console.log(error);
            });
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
async function isValidUser(req, res, next) {
    if (!req.body.user) {
        next();
    }
    else {
        const u = await user_1.UserModel
            .findOne()
            .byUsernameOrOsuId(req.body.user);
        if (!u) {
            return res.json({ error: 'Cannot find user!' });
        }
        res.locals.user = u;
        next();
    }
}
exports.isValidUser = isValidUser;
function isAdmin(req, res, next) {
    if (res.locals.userRequest.group == user_2.UserGroup.Admin) {
        next();
    }
    else {
        unauthorize(req, res);
    }
}
exports.isAdmin = isAdmin;
function isShowcase(req, res, next) {
    if (res.locals.userRequest.group == user_2.UserGroup.Admin || res.locals.userRequest.group == user_2.UserGroup.Secret) {
        next();
    }
    else {
        unauthorize(req, res);
    }
}
exports.isShowcase = isShowcase;
function isMentorshipAdmin(req, res, next) {
    if (res.locals.userRequest.isMentorshipAdmin || res.locals.userRequest.group == user_2.UserGroup.Admin) {
        next();
    }
    else {
        unauthorize(req, res);
    }
}
exports.isMentorshipAdmin = isMentorshipAdmin;
function isWorldCupHelper(req, res, next) {
    if (res.locals.userRequest.isWorldCupHelper || res.locals.userRequest.group == user_2.UserGroup.Admin) {
        next();
    }
    else {
        unauthorize(req, res);
    }
}
exports.isWorldCupHelper = isWorldCupHelper;
function isLocusAdmin(req, res, next) {
    const osuIds = [1893718, 18983, 7671790, 5052899]; // mangomizer, Doomsday, Komm, Matrix
    if (osuIds.includes(res.locals.userRequest.osuId) || res.locals.userRequest.group == user_2.UserGroup.Admin) {
        next();
    }
    else {
        unauthorize(req, res);
    }
}
exports.isLocusAdmin = isLocusAdmin;
function hasMerchAccess(req, res, next) {
    if (res.locals.userRequest.hasMerchAccess) {
        next();
    }
    else {
        unauthorize(req, res);
    }
}
exports.hasMerchAccess = hasMerchAccess;
function isSuperAdmin(req, res, next) {
    const osuIds = [3178418, 1052994, 2, 1893718];
    if (osuIds.includes(res.locals.userRequest.osuId)) {
        next();
    }
    else {
        unauthorize(req, res);
    }
}
exports.isSuperAdmin = isSuperAdmin;
async function isBn(accessToken) {
    if (accessToken) {
        const res = await osuApi_1.getUserInfo(accessToken);
        if (!osuApi_1.isOsuResponseError(res) && (res.groups.some(g => g.id == 7 || g.id == 28 || g.id == 32))) {
            return true;
        }
    }
    return false;
}
exports.isBn = isBn;
function isValidUrl(req, res, next) {
    if (!req.body.url?.length) {
        req.body.url = null;
    }
    const regexp = /^(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
    if (!regexp.test(req.body.url) && req.body.url) {
        return res.json({ error: 'Not a valid URL' });
    }
    next();
}
exports.isValidUrl = isValidUrl;
