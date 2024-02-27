import express from 'express';
import { isLoggedIn, isWorldCupHelper } from '../helpers/middlewares';
import { BeatmapModel } from '../models/beatmap/beatmap';
import { BeatmapStatus } from '../../interfaces/beatmap/beatmap';
import { NoteModel } from '../models/note';

const worldCupRouter = express.Router();

worldCupRouter.use(isLoggedIn);
worldCupRouter.use(isWorldCupHelper);

/* GET users listing. */
worldCupRouter.get('/query', async (req, res) => {
    const [beatmaps, notes] = await Promise.all([
        BeatmapModel
            .find({
                isWorldCup: true,
                status: { $ne: BeatmapStatus.Ranked },
            })
            .defaultPopulate(),
        NoteModel.find({}),
    ]);

    res.json({ beatmaps, notes });
});

/* POST update note */
worldCupRouter.post('/updateNote/:mode', async (req, res) => {
    let note = await NoteModel.findOne({ name: req.params.mode });

    if (!note) {
        note = new NoteModel;
        note.name = req.params.mode;
        note.content = req.body.note;
        await note.save();
    } else {
        note.content = req.body.note;
        await note.save();
    }

    res.json(note);
});

export default worldCupRouter;
