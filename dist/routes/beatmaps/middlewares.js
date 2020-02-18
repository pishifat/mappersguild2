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
const beatmap_1 = require("../../models/beatmap/beatmap");
const beatmap_2 = require("../../interfaces/beatmap/beatmap");
const helpers_1 = require("../../helpers/helpers");
const user_1 = require("../../models/user");
const inviteError = 'Invite not sent: ';
function isValidBeatmap(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = req.params.id || req.params.mapId;
        const b = yield beatmap_1.BeatmapService.queryById(id, { defaultPopulate: true });
        if (!b || beatmap_1.BeatmapService.isError(b)) {
            return res.json(helpers_1.defaultErrorMessage);
        }
        if (b.status == beatmap_2.BeatmapStatus.Ranked) {
            return res.json({ error: 'Mapset ranked' });
        }
        res.locals.beatmap = b;
        next();
    });
}
exports.isValidBeatmap = isValidBeatmap;
function isBeatmapHost(req, res, next) {
    var _a;
    if (((_a = req.session) === null || _a === void 0 ? void 0 : _a.mongoId) != res.locals.beatmap.host.id) {
        return res.json({ error: 'You are not mapset host!' });
    }
    next();
}
exports.isBeatmapHost = isBeatmapHost;
function isValidUser(req, res, next) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        let rexExp;
        if (req.body.user.indexOf('[') >= 0 || req.body.user.indexOf(']') >= 0) {
            rexExp = new RegExp('^\\' + req.body.user + '$', 'i');
        }
        else {
            rexExp = new RegExp('^' + req.body.user + '$', 'i');
        }
        const u = yield user_1.UserService.queryOne({ query: { username: rexExp } });
        if (!u || user_1.UserService.isError(u)) {
            return res.json({ error: inviteError + 'Cannot find user!' });
        }
        if (u.osuId == ((_a = req.session) === null || _a === void 0 ? void 0 : _a.osuId) && ((_b = req.session) === null || _b === void 0 ? void 0 : _b.osuId) != 3178418) {
            return res.json({ error: inviteError + 'Choose someone other than yourself!' });
        }
        res.locals.user = u;
        next();
    });
}
exports.isValidUser = isValidUser;
