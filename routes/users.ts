import express from 'express';
import { isLoggedIn } from '../helpers/middlewares';
import { UserModel } from '../models/user';
import { BeatmapModel } from '../models/beatmap/beatmap';
import { QuestModel } from '../models/quest';
import { SpentPointsModel } from '../models/spentPoints';
import { TaskModel } from '../models/beatmap/task';
import { QuestStatus } from '../interfaces/quest';
import { UserGroup } from '../interfaces/user';

const usersRouter = express.Router();

usersRouter.use(isLoggedIn);

const beatmapPopulate = [
    { path: 'song', select: 'artist title' },
    { path: 'host', select: 'username osuId' },
    { path: 'tasks', populate: { path: 'mappers' } },
];
const questPopulate = { path: 'currentParty', populate: { path: 'members leader' } };
const userPopulate = { path: 'completedQuests', select: 'name completed' };

/* GET page render. */
usersRouter.get('/', (req, res) => {
    res.render('users', {
        title: 'Users',
        script: 'users.js',
        isUsers: true,
        loggedInAs: req.session?.osuId,
        userMongoId: req.session?.mongoId,
        pointsInfo: res.locals.userRequest.pointsInfo,
    });
});

/* GET users listing. */
usersRouter.get('/relevantInfo', async (req, res) => {
    const users = await UserModel
        .find({
            group: { $ne: UserGroup.Spectator },
        })
        .populate(userPopulate);

    res.json({
        users,
        userId: req.session?.osuId,
        username: req.session?.username,
        group: res.locals.userRequest.group,
    });
});

/* GET beatmaps listing. */
usersRouter.get('/beatmaps', async (req, res) => {
    const beatmaps = await BeatmapModel
        .find({})
        .populate(beatmapPopulate)
        .sort({ status: -1 });

    res.json({ beatmaps });
});

/* GET user's quests */
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
