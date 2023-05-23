import express from 'express';
import { isLoggedIn } from '../helpers/middlewares';
import { UserModel } from '../models/user';
import { BeatmapModel } from '../models/beatmap/beatmap';
import { QuestModel } from '../models/quest';
import { SpentPointsModel } from '../models/spentPoints';
import { TaskModel } from '../models/beatmap/task';
import { Quest, QuestStatus } from '../../interfaces/quest';
import { User } from '../../interfaces/user';
import { UserGroup } from '../../interfaces/user';
import { PartyModel } from '../models/party';

const usersRouter = express.Router();

usersRouter.use(isLoggedIn);

const questPopulate = { path: 'parties', populate: { path: 'members pendingMembers leader' } };
const userPopulate = { path: 'completedQuests', select: 'name completed' };

/* GET users listing. */
usersRouter.get('/query', async (req, res) => {
    const users = await UserModel
        .find({
            group: { $ne: UserGroup.Spectator },
        })
        .populate(userPopulate);

    res.json({
        users,
    });
});

/* GET user's current quests */
usersRouter.get('/:id/quests', async (req, res) => {
    const parties = await PartyModel
        .find()
        .where('members', req.params.id)
        .populate({
            path: 'quest',
            match: { status: QuestStatus.WIP },
        })
        .sort({ accepted: -1 });

    const quests = parties.filter(p => p.quest).map(p => p.quest);

    res.json(quests);
});

/* GET user's created quests */
usersRouter.get('/findCreatedQuests/:id', async (req, res) => {
    const createdQuests: Quest['name'][] = await QuestModel
        .find({
            $or: [
                { status: { $ne: QuestStatus.Hidden } },
                { status: { $ne: QuestStatus.Rejected } },
            ],
            creator: req.params.id as User['_id'],
        })
        .distinct('name')
        .populate(questPopulate);

    res.json(createdQuests);
});

/* GET user's spent points */
usersRouter.get('/findSpentPoints/:id', async (req, res) => {
    const spentPoints = await SpentPointsModel
        .find({ user: req.params.id })
        .populate({ path: 'quest', select: 'price art requiredMapsets name' })
        .sort({ createdAt: -1 });

    res.json(spentPoints);
});

/* GET user's beatmaps */
usersRouter.get('/findUserBeatmaps/:id', async (req, res) => {
    const userId = req.params.id as User['_id'];
    const ownTasks = await TaskModel
        .find({ mappers: userId })
        .select('_id');

    const userBeatmaps = await BeatmapModel
        .find({
            $or: [
                {
                    tasks: {
                        $in: ownTasks,
                    },
                },
                {
                    host: userId,
                },
            ],
        })
        .defaultPopulate()
        .sortByLastest();

    res.json(userBeatmaps);
});

/* GET users with sorting. */
usersRouter.get('/:sort', async (req, res) => {
    res.json(
        await UserModel
            .find({ group: { $ne: UserGroup.Spectator } })
            .populate(userPopulate)
            .sort(req.params.sort)
    );
});

export default usersRouter;
