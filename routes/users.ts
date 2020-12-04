import express from 'express';
import { isLoggedIn } from '../helpers/middlewares';
import { UserModel } from '../models/user';
import { BeatmapModel } from '../models/beatmap/beatmap';
import { QuestModel } from '../models/quest';
import { SpentPointsModel } from '../models/spentPoints';
import { TaskModel } from '../models/beatmap/task';
import { QuestStatus } from '../interfaces/quest';
import { User } from '../interfaces/user';
import { UserGroup } from '../interfaces/user';
import { BeatmapStatus } from '../interfaces/beatmap/beatmap';

const usersRouter = express.Router();

usersRouter.use(isLoggedIn);

const questPopulate = { path: 'currentParty', populate: { path: 'members leader' } };
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
usersRouter.get('/findCurrentQuests/:id', async (req, res) => {
    const wipQuests = await QuestModel
        .find({ status: QuestStatus.WIP })
        .populate(questPopulate)
        .sort({ accepted: -1 });

    const currentQuests = wipQuests.filter(quest =>
        quest.currentParty.members.some(member =>
            member.id == req.params.id
        )
    );

    res.json(currentQuests);
});

/* GET user's created quests */
usersRouter.get('/findCreatedQuests/:id', async (req, res) => {
    const createdQuests = await QuestModel
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
    const ownTasks = await TaskModel
        .find({ mappers: req.params.id })
        .select('_id');

    const userBeatmaps = await BeatmapModel
        .find({
            status: { $ne: BeatmapStatus.Secret },
            $or: [
                {
                    tasks: {
                        $in: ownTasks,
                    },
                },
                {
                    host: req.params.id,
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
