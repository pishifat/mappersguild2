import express from 'express';
import { isLoggedIn, isNotSpectator } from '../helpers/middlewares';
import { UserService } from '../models-ts/user';
import { BeatmapService } from '../models-ts/beatmap/beatmap';
import { QuestService, Quest } from '../models-ts/quest';
import { canFail } from '../helpers/helpers';

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
        script: '../javascripts/users.js',
        isUsers: true,
        loggedInAs: req.session?.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
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

    res.json({ currentQuests });
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

/* POST switch user notifications */
usersRouter.post('/switchInvites', isNotSpectator, canFail(async (req, res) => {
    let u = await UserService.queryByIdOrFail(req.session?.mongoId);
    await UserService.updateOrFail(req.session?.mongoId, { invites: !u.invites });
    u = await UserService.queryByIdOrFail(req.session.mongoId, { defaultPopulate: true });

    res.json(u);
}));

export default usersRouter;
