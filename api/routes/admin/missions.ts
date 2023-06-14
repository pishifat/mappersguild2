import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';
import { MissionModel } from '../../models/mission';

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
    const { deadline, name, tier, artists, objective, winCondition, userMaximumRankedBeatmapsCount, userMaximumGlobalRank } = req.body;
    console.log(name);
    const mission = new MissionModel;
    mission.deadline = deadline;
    mission.tier = tier;
    mission.name = name;
    mission.artists = artists.map(a => a._id);
    mission.objective = objective;
    mission.status = 'hidden';
    mission.winCondition = winCondition;
    mission.openingAnnounced = false;
    mission.closingAnnounced = false;
    mission.userMaximumRankedBeatmapsCount = userMaximumRankedBeatmapsCount;
    mission.userMaximumGlobalRank = userMaximumGlobalRank;

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

/* POST update mission status */
adminMissionsRouter.post('/:id/updateStatus', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { status: req.body.status }).orFail();

    res.json(req.body.status);
});

/* POST update mission win condition */
adminMissionsRouter.post('/:id/updateWinCondition', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { winCondition: req.body.winCondition }).orFail();

    res.json(req.body.winCondition);
});

/* POST update mission maximum ranked maps count */
adminMissionsRouter.post('/:id/updateUserMaximumRankedBeatmapsCount', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { userMaximumRankedBeatmapsCount: req.body.userMaximumRankedBeatmapsCount }).orFail();

    res.json(req.body.userMaximumRankedBeatmapsCount);
});

/* POST update mission maximum global rank */
adminMissionsRouter.post('/:id/updateUserMaximumGlobalRank', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { userMaximumGlobalRank: req.body.userMaximumGlobalRank }).orFail();

    res.json(req.body.userMaximumGlobalRank);
});

export default adminMissionsRouter;
