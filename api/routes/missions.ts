import express from 'express';
import { isLoggedIn } from '../helpers/middlewares';
import { MissionModel } from '../models/mission';
import { MissionStatus } from '../../interfaces/mission';

const missionsRouter = express.Router();

missionsRouter.use(isLoggedIn);

/* GET missions */
missionsRouter.get('/relevantInfo', async (req, res) => {
    const missions = await MissionModel
        .find({})
        .defaultPopulate()
        .sortByLatest();

    res.json(missions);
});

/* GET open missions */
missionsRouter.get('/open', async (req, res) => {
    const missions = await MissionModel
        .find({ status: MissionStatus.Open })
        .defaultPopulate()
        .sortByLatest();

    res.json(missions);
});

export default missionsRouter;
