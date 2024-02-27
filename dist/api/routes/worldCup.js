"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../helpers/middlewares");
const beatmap_1 = require("../models/beatmap/beatmap");
const beatmap_2 = require("../../interfaces/beatmap/beatmap");
const note_1 = require("../models/note");
const worldCupRouter = express_1.default.Router();
worldCupRouter.use(middlewares_1.isLoggedIn);
worldCupRouter.use(middlewares_1.isWorldCupHelper);
/* GET users listing. */
worldCupRouter.get('/query', async (req, res) => {
    const [beatmaps, notes] = await Promise.all([
        beatmap_1.BeatmapModel
            .find({
            isWorldCup: true,
            status: { $ne: beatmap_2.BeatmapStatus.Ranked },
        })
            .defaultPopulate(),
        note_1.NoteModel.find({}),
    ]);
    res.json({ beatmaps, notes });
});
/* POST update note */
worldCupRouter.post('/updateNote/:mode', async (req, res) => {
    let note = await note_1.NoteModel.findOne({ name: req.params.mode });
    if (!note) {
        note = new note_1.NoteModel;
        note.name = req.params.mode;
        note.content = req.body.note;
        await note.save();
    }
    else {
        note.content = req.body.note;
        await note.save();
    }
    res.json(note);
});
exports.default = worldCupRouter;
