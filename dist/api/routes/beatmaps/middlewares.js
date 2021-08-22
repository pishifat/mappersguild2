"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidUser = exports.isBeatmapHost = exports.isValidBeatmap = void 0;
const beatmap_1 = require("../../models/beatmap/beatmap");
const beatmap_2 = require("../../../interfaces/beatmap/beatmap");
const user_1 = require("../../models/user");
const inviteError = 'Invite not sent: ';
async function isValidBeatmap(req, res, next) {
    const id = req.params.id || req.params.mapId;
    const beatmap = await beatmap_1.BeatmapModel
        .findById(id)
        .where('status')
        .ne(beatmap_2.BeatmapStatus.Ranked)
        .defaultPopulate()
        .orFail();
    res.locals.beatmap = beatmap;
    next();
}
exports.isValidBeatmap = isValidBeatmap;
function isBeatmapHost(req, res, next) {
    if (req.session?.mongoId != res.locals.beatmap.host.id) {
        return res.json({ error: 'You are not mapset host!' });
    }
    next();
}
exports.isBeatmapHost = isBeatmapHost;
async function isValidUser(req, res, next) {
    const u = await user_1.UserModel
        .findOne()
        .byUsernameOrOsuId(req.body.user);
    if (!u) {
        return res.json({ error: inviteError + 'Cannot find user!' });
    }
    // pishi's so pro that can choose himself
    if (u.osuId == req.session?.osuId && req.session?.osuId != 3178418) {
        return res.json({ error: inviteError + 'Choose someone other than yourself!' });
    }
    res.locals.user = u;
    next();
}
exports.isValidUser = isValidUser;
