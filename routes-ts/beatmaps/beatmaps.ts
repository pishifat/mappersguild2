import express from 'express';
import { BeatmapService, Beatmap, ModeOrAny, BeatmapMode, BeatmapStatus } from '../../models-ts/beatmap/beatmap';
import { TaskService, Task, TaskStatus } from '../../models-ts/beatmap/task';
import { UserService } from '../../models-ts/user';
import { QuestService, Quest } from '../../models-ts/quest';
import { NotificationService } from '../../models-ts/notification';
import { FeaturedArtistService } from '../../models-ts/featuredArtist';
import { LogService, LogCategory } from '../../models-ts/log';
import { isLoggedIn, isNotSpectator, isBn } from '../../helpers/middlewares';
import { defaultErrorMessage, canFail } from '../../helpers/helpers';
import { isValidBeatmap, isBeatmapHost } from './middlewares';

const beatmapsRouter = express.Router();

beatmapsRouter.use(isLoggedIn);

/* GET maps page. */
beatmapsRouter.get('/', (req, res) => {
    res.render('beatmaps', {
        title: 'Beatmaps',
        script: '../javascripts/maps.js',
        isMaps: true,
        loggedInAs: req.session?.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});

/* GET info for page load */
beatmapsRouter.get('/relevantInfo', async (req, res) => {
    const query: Partial<Beatmap> = {
        host: req.session?.mongoId,
        mode: res.locals.userRequest.mainMode,
    };

    const hostBeatmaps = await BeatmapService.queryAll({
        query,
        useDefaults: true,
    });

    res.json({
        beatmaps: hostBeatmaps,
        userOsuId: req.session?.osuId,
        userMongoId: req.session?.mongoId,
        username: req.session?.username,
        group: res.locals.userRequest.group,
        mainMode: res.locals.userRequest.mainMode,
    });
});

/* GET mode-specific beatmaps */
beatmapsRouter.get('/loadBeatmaps/:mode/:days', async (req, res) => {
    let statusParams: object;
    let allParams: object;
    const mode = req.params.mode;
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() - parseInt(req.params.days, 10));

    if (mode != ModeOrAny.Any) {
        statusParams = {
            $and: [
                {
                    $or: [
                        { mode },
                        { mode: BeatmapMode.Hybrid },
                    ],
                },
                {
                    $or: [
                        { host: req.session?.mongoId },
                        { updatedAt: { $gte: maxDate } },
                    ],
                },
            ],
        };

        allParams = {
            $or: [{ mode }, { mode: BeatmapMode.Hybrid }],
            updatedAt: { $lte: maxDate },
        };
    } else {
        statusParams = {
            $or: [
                { host: req.session?.mongoId },
                { updatedAt: { $gte: maxDate } },
            ],
        };

        allParams = {
            updatedAt: { $lte: maxDate },
        };
    }

    const [statusBeatmaps, allBeatmaps] = await Promise.all([
        BeatmapService.queryAll({
            query: statusParams,
            useDefaults: true,
        }),
        BeatmapService.queryAll({
            query: allParams,
            useDefaults: true,
        }),
    ]);

    const guestDifficultyBeatmaps: Beatmap[] = [];

    if (!BeatmapService.isError(allBeatmaps)) {
        allBeatmaps.forEach(beatmap => {
            if (beatmap.host.osuId != req.session?.osuId) {
                let breakLoop = false;

                for (let i = 0; i < beatmap.tasks.length; i++) {
                    const task = beatmap.tasks[i];

                    for (let j = 0; j < task.mappers.length; j++) {
                        const mapper = task.mappers[j];

                        if (mapper.osuId == req.session?.osuId) {
                            guestDifficultyBeatmaps.push(beatmap);
                            breakLoop = true;
                            break;
                        }
                    }

                    if (breakLoop) {
                        break;
                    }
                }
            }
        });
    }

    res.json({ statusBeatmaps, guestDifficultyBeatmaps });
});

/* GET artists for new map entry */
beatmapsRouter.get('/artists/', async (req, res) => {
    const fa = await FeaturedArtistService.queryAll({
        query: { osuId: { $exists: true } },
    });

    res.json(fa);
});


/* GET songs for new map entry */
beatmapsRouter.get('/songs/:labelId', canFail(async (req, res) => {
    const fa = await FeaturedArtistService.queryByIdOrFail(req.params.labelId, {
        useDefaults: true,
    });

    res.json(fa.songs);
}));

/* GET quests for linking quest to beatmap */
beatmapsRouter.get('/findUserQuests/', async (req, res) => {
    const userQuests = await QuestService.getUserQuests(req.session?.mongoId);

    res.json({ userQuests });
});

/* POST create new map */
beatmapsRouter.post('/create', isNotSpectator, canFail(async (req, res) => {
    if (req.body.song == 'none') {
        return res.json({ error: 'Missing song!' });
    }

    if (req.body.tasks.length < 1) {
        return res.json({ error: 'Select at least one difficulty to map!' });
    }

    const newTasks = req.body.tasks.split('|');
    const realTasks: Task['_id'][] = [];

    for (let i = 0; i < newTasks.length; i++) {
        const t = await TaskService.create({
            name: newTasks[i],
            mappers: req.session?.mongoId,
            mode: req.body.mode,
        });

        if (TaskService.isError(t)) {
            return res.json({ error: 'Missing task!' });
        }

        realTasks.push(t._id);
    }

    let locks = [];

    if (req.body.tasksLocked) {
        locks = req.body.tasksLocked.split('|');
    }

    const newB = await BeatmapService.create(req.session?.mongoId, realTasks, locks, req.body.song, req.body.mode);

    if (!newB || BeatmapService.isError(newB)) {
        return res.json(defaultErrorMessage);
    }

    const b = await BeatmapService.queryByIdOrFail(newB._id, { defaultPopulate: true });

    res.json(b);

    LogService.create(
        req.session?.mongoId,
        `created new map "${b.song.artist} - ${b.song.title}"`,
        b._id,
        LogCategory.Beatmap
    );
}));

/* POST modder from extended view, returns new modders list. */
beatmapsRouter.post('/updateModder/:mapId', isNotSpectator, canFail(async (req, res) => {
    const isAlreadyModder = await BeatmapService.queryOne({
        query: {
            _id: req.params.mapId,
            modders: req.session?.mongoId,
        },
    });
    let update;

    if (!isAlreadyModder) {
        update = { $push: { modders: req.session?.mongoId } };
    } else {
        update = { $pull: { modders: req.session?.mongoId } };
    }

    let b = await BeatmapService.queryByIdOrFail(req.params.mapId);

    if (b.status == BeatmapStatus.Ranked) {
        return res.json({ error: 'Mapset ranked' });
    }

    await BeatmapService.update(req.params.mapId, update);
    b = await BeatmapService.queryByIdOrFail(req.params.mapId, { defaultPopulate: true });

    res.json(b);

    if (isAlreadyModder) {
        LogService.create(
            req.session?.mongoId,
            `removed from modder list on "${b.song.artist} - ${b.song.title}"`,
            b._id,
            LogCategory.Beatmap
        );
        NotificationService.create(
            b.id,
            `removed themself from the modder list of your mapset`,
            b.host.id,
            req.session?.mongoId,
            b.id
        );
    } else {
        LogService.create(
            req.session?.mongoId,
            `modded "${b.song.artist} - ${b.song.title}"`,
            b._id,
            LogCategory.Beatmap
        );
        NotificationService.create(
            b.id,
            `modded your mapset`,
            b.host.id,
            req.session?.mongoId,
            b.id
        );
    }
}));

/* POST bn from extended view, returns new bns list. */
beatmapsRouter.post('/updateBn/:mapId', isNotSpectator, isBn, isValidBeatmap, async (req, res) => {
    const b: Beatmap = res.locals.beatmap;
    const isAlreadyBn = await BeatmapService.queryOne({
        query: {
            _id: req.params.mapId,
            bns: req.session?.mongoId,
        },
    });
    let update;

    if (!isAlreadyBn) {
        let hasTask = false;

        b.tasks.forEach(task => {
            task.mappers.forEach(mapper => {
                if (mapper.id == req.session?.mongoId) {
                    hasTask = true;
                }
            });
        });

        if (hasTask) {
            return res.json({ error: `You can't nominate a mapset you've done a task for!` });
        }

        update = { $push: { bns: req.session?.mongoId } };
    } else {
        update = { $pull: { bns: req.session?.mongoId } };
    }

    await BeatmapService.update(req.params.mapId, update);
    const updatedBeatmap = await BeatmapService.queryById(req.params.mapId, { defaultPopulate: true });

    if (!updatedBeatmap || BeatmapService.isError(updatedBeatmap)) {
        return res.json(defaultErrorMessage);
    }

    res.json(updatedBeatmap);

    if (isAlreadyBn) {
        LogService.create(
            req.session?.mongoId,
            `removed from Beatmap Nominator list on "${updatedBeatmap.song.artist} - ${updatedBeatmap.song.title}"`,
            updatedBeatmap._id,
            LogCategory.Beatmap
        );
        NotificationService.create(
            updatedBeatmap.id,
            `removed themself from the Beatmap Nominator list on your mapset`,
            updatedBeatmap.host.id,
            req.session?.mongoId,
            updatedBeatmap.id
        );
    } else {
        LogService.create(
            req.session?.mongoId,
            `added to Beatmap Nominator list on "${updatedBeatmap.song.artist} - ${updatedBeatmap.song.title}"`,
            updatedBeatmap._id,
            LogCategory.Beatmap
        );
        NotificationService.create(
            updatedBeatmap.id,
            `added themself to the Beatmap Nominator list on your mapset`,
            updatedBeatmap.host.id,
            req.session?.mongoId,
            updatedBeatmap.id
        );
    }
});

//#region Host exclusive routes

/* POST set game mode. */
beatmapsRouter.post('/setMode/:mapId', isNotSpectator, isValidBeatmap, isBeatmapHost, async (req, res) => {
    let b = await BeatmapService.queryById(req.params.mapId, { defaultPopulate: true });

    if (!b || BeatmapService.isError(b)) {
        return res.json(defaultErrorMessage);
    }

    if (req.body.mode != 'hybrid') {
        if (b.quest && !(b.quest as Quest).modes.includes(req.body.mode)) {
            return res.json({ error: `The selected quest doesn't support beatmaps of this mode!` });
        }

        for (let i = 0; i < b.tasks.length; i++) {
            const task = b.tasks[i];

            await TaskService.update(task.id, { mode: req.body.mode });
        }
    }

    await BeatmapService.update(req.params.mapId, { mode: req.body.mode });
    b = await BeatmapService.queryById(req.params.mapId, { defaultPopulate: true });

    if (!b || BeatmapService.isError(b)) {
        return res.json(defaultErrorMessage);
    }

    res.json(b);

    LogService.create(
        req.session?.mongoId,
        `changed mode of "${b.song.artist} - ${b.song.title}" to "${req.body.mode}"`,
        b._id,
        LogCategory.Beatmap
    );
});

/* POST set status of the beatmapset from extended view. */
beatmapsRouter.post('/setStatus/:mapId', isNotSpectator, isValidBeatmap, isBeatmapHost, async (req, res) => {
    const validBeatmap: Beatmap = res.locals.beatmap;

    if (req.body.status == 'Done') {
        if (validBeatmap.tasks.length == 0) {
            return res.json({ error: `You can't mark an empty mapset as complete!` });
        }

        if (validBeatmap.tasks.length == 1 && validBeatmap.tasks[0].name == 'Storyboard') {
            return res.json({ error: `You can't mark a mapset without difficulties as complete!` });
        }

        for (let i = 0; i < validBeatmap.tasks.length; i++) {
            await TaskService.update(validBeatmap.tasks[i].id, { status: TaskStatus.Done });
        }

        await BeatmapService.update(req.params.mapId, {
            tasksLocked: ['Easy', 'Normal', 'Hard', 'Insane', 'Expert', 'Storyboard'],
        });
    }

    await BeatmapService.update(req.params.mapId, { status: req.body.status });
    const updatedBeatmap = await BeatmapService.queryById(req.params.mapId, { defaultPopulate: true });

    if (!updatedBeatmap || BeatmapService.isError(updatedBeatmap)) {
        return res.json(defaultErrorMessage);
    }

    res.json(updatedBeatmap);

    LogService.create(
        req.session?.mongoId,
        `changed status of "${updatedBeatmap.song.artist} - ${updatedBeatmap.song.title}"`,
        updatedBeatmap._id,
        LogCategory.Beatmap
    );
});

/* POST quest to map */
beatmapsRouter.post('/saveQuest/:mapId', isNotSpectator, isValidBeatmap, isBeatmapHost, async (req, res) => {
    let b = res.locals.beatmap;

    if (req.body.questId.length) {
        const q = await QuestService.queryOne({
            query: { _id: req.body.questId },
            populate: [{ path: 'currentParty',  select: 'members' }],
        });

        if (!q || QuestService.isError(q)) {
            return defaultErrorMessage;
        }

        let invalidMapper = false;
        let invalidMode = false;

        for (let i = 0; i < b.tasks.length; i++) {
            const task = b.tasks[i];

            if (q.modes.indexOf(task.mode) < 0) {
                invalidMode = true;
            }

            for (let j = 0; j < task.mappers.length; j++) {
                const u = await UserService.queryById(task.mappers[j]._id);

                if (!u || UserService.isError(u)) {
                    invalidMapper = true;
                    continue;
                }

                if (q.currentParty.members.indexOf(u._id) < 0) {
                    invalidMapper = true;
                }
            }
        }

        if (invalidMapper) {
            return res.json({ error: `Some of this mapset's mappers are not assigned to your quest!` });
        }

        if (invalidMode) {
            return res.json({ error: `Some of this mapset's difficulties are not the correct mode for this quest!` });
        }
    } else {
        await BeatmapService.update(req.params.mapId, { quest: null });
    }

    await BeatmapService.update(req.params.mapId, { quest: req.body.questId });
    b = await BeatmapService.queryById(req.params.mapId, { defaultPopulate: true });

    if (BeatmapService.isError(b)) {
        return res.json(defaultErrorMessage);
    }

    res.json(b);

    LogService.create(
        req.session?.mongoId,
        `${req.body.questId.length ? 'linked quest to' : 'unlinked quest from'} "${b.song.artist} - ${b.song.title}"`,
        b._id,
        LogCategory.Beatmap
    );
});

/* POST edit link from extended view. */
beatmapsRouter.post('/setLink/:mapId', isNotSpectator, isValidBeatmap, isBeatmapHost, async (req, res) => {
    let url = req.body.url;

    if (url.length == 0) {
        url = undefined;
    }

    const regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;

    if (!regexp.test(url)) {
        return res.json({ error: 'Not a valid URL' });
    }

    let b = res.locals.beatmap;

    await BeatmapService.update(req.params.mapId, { url });
    b = await BeatmapService.queryById(req.params.mapId, { defaultPopulate: true });

    if (BeatmapService.isError(b)) {
        return res.json(defaultErrorMessage);
    }

    res.json(b);

    LogService.create(
        req.session?.mongoId,
        `edited link on "${b.song.artist} - ${b.song.title}"`,
        b._id,
        LogCategory.Beatmap
    );
});

/* POST locks task from extended view. */
beatmapsRouter.post('/lockTask/:mapId', isNotSpectator, isValidBeatmap, isBeatmapHost, canFail(async (req, res) => {
    if (!req.body.task) {
        return res.json({ error: 'Not a valid task' });
    }

    let b: Beatmap = res.locals.beatmap;

    await BeatmapService.update(req.params.mapId, {
        $push: { tasksLocked: req.body.task },
    });

    b = await BeatmapService.queryByIdOrFail(req.params.mapId, { defaultPopulate: true });

    res.json(b);

    LogService.create(
        req.session?.mongoId,
        `locked claims for "${req.body.task}" on "${b.song.artist} - ${b.song.title}"`,
        b._id,
        LogCategory.Beatmap
    );
}));

/* POST unlocks task from extended view. */
beatmapsRouter.post('/unlockTask/:mapId', isNotSpectator, isValidBeatmap, isBeatmapHost, async (req, res) => {
    let b = res.locals.beatmap;

    await BeatmapService.update(req.params.mapId, {
        $pull: { tasksLocked: req.body.task },
    });

    b = await BeatmapService.queryById(req.params.mapId, { defaultPopulate: true });

    if (BeatmapService.isError(b)) {
        return res.json(defaultErrorMessage);
    }

    res.json(b);

    LogService.create(
        req.session?.mongoId,
        `unlocked claims for "${req.body.task}" on "${b.song.artist} - ${b.song.title}"`,
        b._id,
        LogCategory.Beatmap
    );
});

/* POST delete map */
beatmapsRouter.post('/delete/:mapId', isNotSpectator, isValidBeatmap, isBeatmapHost, async (req, res) => {
    const b = res.locals.beatmap;

    for (let i = 0; i < b.tasks.length; i++) {
        await TaskService.remove(b.tasks[i]);
    }

    await BeatmapService.remove(req.params.mapId);
    res.json(b);

    LogService.create(
        req.session?.mongoId,
        `deleted "${b.song.artist} - ${b.song.title}"`,
        b._id,
        LogCategory.Beatmap
    );
});

//#endregion

export default beatmapsRouter;
