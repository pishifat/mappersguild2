import express from 'express';
import { isLoggedIn, isAdmin } from '../../helpers/middlewares';
import { QuestModel } from '../../models/quest';
import { QuestStatus } from '../../../interfaces/quest';
import { UserModel } from '../../models/user';
import { BeatmapModel } from '../../models/beatmap/beatmap';
import { BeatmapStatus } from '../../../interfaces/beatmap/beatmap';

const adminRouter = express.Router();

adminRouter.use(isLoggedIn);
adminRouter.use(isAdmin);

/* GET beatmaps in need of action */
adminRouter.get('/loadActionBeatmaps/', async (req, res) => {
    const actionBeatmaps = await BeatmapModel
        .find({
            status: BeatmapStatus.Qualified,
            queuedForRank: { $ne: true },
        })
        .defaultPopulate()
        .sort({ updatedAt: 1 });

    res.json(actionBeatmaps);
});

/* GET quests in need of action */
adminRouter.get('/loadActionQuests/', async (req, res) => {
    let quests = await QuestModel
        .find({ status: QuestStatus.WIP })
        .defaultPopulate();

    quests = quests.filter(q =>
        q.associatedMaps.length >= q.requiredMapsets &&
        q.associatedMaps.every(b => b.status === BeatmapStatus.Ranked)
    );

    const pendingQuests = await QuestModel
        .find({ status: QuestStatus.Pending })
        .defaultPopulate();

    quests = quests.concat(pendingQuests);

    res.json(quests);
});

/* GET users in need of action */
adminRouter.get('/loadActionUsers/', async (req, res) => {
    const allUsers = await UserModel.find({});
    const actionUsers = allUsers.filter(u => u.badge !== u.rank);

    res.json(actionUsers);
});

export default adminRouter;
