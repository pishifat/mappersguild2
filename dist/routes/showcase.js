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
beatmapsRouter.get('/', (req, res) => {
    var _a, _b;
    res.render('showcase', {
        title: 'FA Showcase Beatmaps',
        script: 'showcase.js',
        loggedInAs: (_a = req.session) === null || _a === void 0 ? void 0 : _a.osuId,
        userMongoId: (_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId,
        pointsInfo: res.locals.userRequest.pointsInfo,
    });
});
beatmapsRouter.get('/relevantInfo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const beatmaps = yield beatmap_1.BeatmapModel
        .find({ status: beatmap_2.BeatmapStatus.Secret })
        .defaultPopulate()
        .sortByLastest();
    res.json({
        beatmaps,
        userOsuId: (_a = req.session) === null || _a === void 0 ? void 0 : _a.osuId,
        userMongoId: (_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId,
        username: (_c = req.session) === null || _c === void 0 ? void 0 : _c.username,
        group: res.locals.userRequest.group,
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
