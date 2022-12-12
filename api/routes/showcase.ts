import express from 'express';
import { BeatmapModel } from '../models/beatmap/beatmap';
import { BeatmapStatus } from '../../interfaces/beatmap/beatmap';
import { isLoggedIn, isSecret } from '../helpers/middlewares';

const beatmapsRouter = express.Router();

beatmapsRouter.use(isLoggedIn);
beatmapsRouter.use(isSecret);

/* GET info for page load */
beatmapsRouter.get('/relevantInfo', async (req, res) => {
    /*const beatmaps = await BeatmapModel
        .find({ status: BeatmapStatus.Secret })
        .defaultPopulate()
        .sortByLastest();

    res.json({
        beatmaps,
    });*/
});

export default beatmapsRouter;
