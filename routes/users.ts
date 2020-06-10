import express from 'express';
import { isLoggedIn } from '../helpers/middlewares';
import { UserService } from '../models/user';
import { BeatmapService } from '../models/beatmap/beatmap';
import { QuestService, Quest } from '../models/quest';
import { SpentPointsService } from '../models/spentPoints';
import { TaskService } from '../models/beatmap/task';

const usersRouter = express.Router();

usersRouter.use(isLoggedIn);

const beatmapPopulate = [
    { path: 'song', select: 'artist title' },
    { path: 'host', select: 'username osuId' },
    { path: 'tasks', populate: { path: 'mappers' } },
];

const questPopulate = [
    { path: 'currentParty', populate: { path: 'members leader' } },
];

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
    const u = await UserService.queryAll({
        query: {
            group: { $ne: 'spectator' },
        },
        useDefaults: true,
    });

    res.json({
        users: u,
        userId: req.session?.osuId,
        username: req.session?.username,
        group: res.locals.userRequest.group,
    });
});

/* GET beatmaps listing. */
usersRouter.get('/beatmaps', async (req, res) => {
    const b = await BeatmapService.queryAll({
        populate: beatmapPopulate,
        sort: { status: -1 },
    });

    res.json({ beatmaps: b });
});

/* GET user's quests */
usersRouter.get('/findCurrentQuests/:id', async (req, res) => {
    const wipQuests = await QuestService.queryAll({
        query: { status: 'wip' },
        populate: questPopulate,
        sort: { accepted: -1 },
    });

    const currentQuests: Quest[] = [];

    if (!QuestService.isError(wipQuests)) {
        wipQuests.forEach(quest => {
            quest.currentParty.members.forEach(member => {
                if (member.id == req.params.id) {
                    currentQuests.push(quest);
                }
            });
        });
    }

    res.json(currentQuests);
});

/* GET user's spent points */
usersRouter.get('/findSpentPoints/:id', async (req, res) => {
    const spentPoints = await SpentPointsService.queryAll({
        query: { user: req.params.id },
        populate: [{ path: 'quest', select: 'price art requiredMapsets name' }],
        sort: { createdAt: -1 },
    });

    res.json(spentPoints);
});

/* GET user's beatmaps */
usersRouter.get('/findUserBeatmaps/:id', async (req, res) => {
    const ownTasks = await TaskService.queryAll({
        query: { mappers: req.params.id },
        select: '_id',
    });

    const userBeatmaps = await BeatmapService.queryAll({
        query: {
            $or:
            [
                {
                    tasks: {
                        $in: ownTasks,
                    },
                },
                {
                    host: req.params.id,
                },
            ] },
        useDefaults: true,
    });

    res.json(userBeatmaps);
});

/* GET users with sorting. */
usersRouter.get('/:sort', async (req, res) => {
    res.json(await UserService.queryAll({
        query: {
            group: { $ne: 'spectator' },
        },
        defaultPopulate: true,
        sort: req.params.sort,
    }));
});

export default usersRouter;
