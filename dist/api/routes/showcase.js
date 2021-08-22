"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const beatmap_1 = require("../models/beatmap/beatmap");
const beatmap_2 = require("../../interfaces/beatmap/beatmap");
const middlewares_1 = require("../helpers/middlewares");
const beatmapsRouter = express_1.default.Router();
beatmapsRouter.use(middlewares_1.isLoggedIn);
beatmapsRouter.use(middlewares_1.isSecret);
/* GET info for page load */
beatmapsRouter.get('/relevantInfo', async (req, res) => {
    const beatmaps = await beatmap_1.BeatmapModel
        .find({ status: beatmap_2.BeatmapStatus.Secret })
        .defaultPopulate()
        .sortByLastest();
    res.json({
        beatmaps,
    });
});
/* GET map load from URL */
beatmapsRouter.get('/searchOnLoad/:id', async (req, res) => {
    const urlBeatmap = await beatmap_1.BeatmapModel.findOne({ _id: req.params.id, status: beatmap_2.BeatmapStatus.Secret }).defaultPopulate();
    if (!urlBeatmap) {
        return res.json({ error: 'Beatmap ID does not exist!' });
    }
    res.json(urlBeatmap);
});
exports.default = beatmapsRouter;
