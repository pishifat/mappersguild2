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
const beatmap_1 = require("../models/beatmap/beatmap");
const beatmap_2 = require("../interfaces/beatmap/beatmap");
const middlewares_1 = require("../helpers/middlewares");
const beatmapsRouter = express_1.default.Router();
beatmapsRouter.use(middlewares_1.isLoggedIn);
beatmapsRouter.use(middlewares_1.isSecret);
beatmapsRouter.get('/relevantInfo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const beatmaps = yield beatmap_1.BeatmapModel
        .find({ status: beatmap_2.BeatmapStatus.Secret })
        .defaultPopulate()
        .sortByLastest();
    res.json({
        beatmaps,
    });
}));
beatmapsRouter.get('/searchOnLoad/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const urlBeatmap = yield beatmap_1.BeatmapModel.findOne({ _id: req.params.id, status: beatmap_2.BeatmapStatus.Secret }).defaultPopulate();
    if (!urlBeatmap) {
        return res.json({ error: 'Beatmap ID does not exist!' });
    }
    res.json(urlBeatmap);
}));
exports.default = beatmapsRouter;
