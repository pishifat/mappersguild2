"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBeatmapHost = exports.isValidBeatmap = void 0;
const beatmap_1 = require("../../models/beatmap/beatmap");
const beatmap_2 = require("../../../interfaces/beatmap/beatmap");
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
    if (req.session?.mongoId != res.locals.beatmap.host.id && res.locals.userRequest.osuId !== 3178418) {
        return res.json({ error: 'You are not mapset host!' });
    }
    next();
}
exports.isBeatmapHost = isBeatmapHost;
