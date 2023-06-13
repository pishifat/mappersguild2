import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';
import { MissionModel } from '../../models/mission';
import { Mission } from '../../../interfaces/mission';

const adminMissionsRouter = express.Router();

adminMissionsRouter.use(isLoggedIn);
adminMissionsRouter.use(isAdmin);
adminMissionsRouter.use(isSuperAdmin);

/* GET quests */
adminMissionsRouter.get('/load', async (req, res) => {
    const m = await MissionModel
        .find({})
        .defaultPopulate()
        .sort({ status: -1, name: 1 });

    res.json(m);
});

/* POST add quest */
adminMissionsRouter.post('/create', async (req, res) => {
    const { deadline, name, tier, artists, objective } = req.body;
    const mission = new MissionModel;
    mission.deadline = deadline;
    mission.tier = tier;
    mission.name = name;
    mission.artists = artists.map(a => a._id);
    mission.objective = objective;
    mission.status = 'open';
    await mission.save();

    res.json(mission);
});

/* POST rename mission */
adminMissionsRouter.post('/:id/rename', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { name: req.body.name }).orFail();

    res.json(req.body.name);
});

/* POST update mission tier */
adminMissionsRouter.post('/:id/updateTier', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { tier: req.body.tier }).orFail();

    res.json(req.body.tier);
});

/* POST update mission objective */
adminMissionsRouter.post('/:id/updateObjective', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { objective: req.body.objective }).orFail();

    res.json(req.body.objective);
});

export default adminMissionsRouter;
