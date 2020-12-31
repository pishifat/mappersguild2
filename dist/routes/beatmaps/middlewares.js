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
exports.isValidUser = exports.isBeatmapHost = exports.isValidBeatmap = void 0;
const beatmap_1 = require("../../models/beatmap/beatmap");
const beatmap_2 = require("../../interfaces/beatmap/beatmap");
const user_1 = require("../../models/user");
const inviteError = 'Invite not sent: ';
function isValidBeatmap(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = req.params.id || req.params.mapId;
        const beatmap = yield beatmap_1.BeatmapModel
            .findById(id)
            .where('status')
            .ne(beatmap_2.BeatmapStatus.Ranked)
            .defaultPopulate()
            .orFail();
        res.locals.beatmap = beatmap;
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
        const u = yield user_1.UserModel
            .findOne()
            .byUsernameOrOsuId(req.body.user);
        if (!u) {
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
