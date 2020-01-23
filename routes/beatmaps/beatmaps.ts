import express from 'express';
import { BeatmapService, Beatmap, ModeOrAny, BeatmapMode, BeatmapStatus } from '../../models/beatmap/beatmap';
import { TaskService, Task, TaskStatus, TaskName } from '../../models/beatmap/task';
import { UserService } from '../../models/user';
import { QuestService, Quest } from '../../models/quest';
import { NotificationService } from '../../models/notification';
import { FeaturedArtistService } from '../../models/featuredArtist';
import { LogService, LogCategory } from '../../models/log';
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

/* GET guest difficulty related beatmaps */
beatmapsRouter.get('/guestBeatmaps', async (req, res) => {
    const ownTasks = await TaskService.queryAll({
        query: { mappers: req.session?.mongoId },
        select: '_id',
    });

    const userBeatmaps = await BeatmapService.queryAll({
        query: {
            tasks: {
                $in: ownTasks,
            },
        },
        useDefaults: true,
    });

    res.json({ userBeatmaps });
});

/* GET mode-specific beatmaps */
beatmapsRouter.get('/search', async (req, res) => {
    if (!req.query.mode || !req.query.limit) {
        return res.json({ error: 'Missing mode filter...' });
    }

    const mode = req.query.mode as ModeOrAny;
    const limit = parseInt(req.query.limit);
    const status = req.query.status as BeatmapStatus | undefined;
    const quest = req.query.quest as 'none' | undefined;
    const search = req.query.search as string | undefined;

    let allBeatmaps = await BeatmapService.queryAll({
        query: {
            ...(mode != ModeOrAny.Any ? {
                $or: [
                    { mode },
                    { mode: BeatmapMode.Hybrid },
                ],
            } : {}),
            ...(status ? { status } : {}),
            ...(quest ? { quest: { $exists: false } } : {}),
            host: { $ne: req.session?.mongoId },
        },
        useDefaults: true,
        // this actually returns every map, pretty dumb, need to fix somehow
        limit: search ? undefined: limit,
    });

    if (search && !BeatmapService.isError(allBeatmaps)) {
        const tags = search
            .toLowerCase()
            .trim()
            .split(' ')
            .filter(t => t.length);

        allBeatmaps = allBeatmaps.filter(b => {
            let searchableTags = b.song.artist + ' ' + b.song.title + ' ' + b.host.username;
            b.tasks.forEach(task => {
                task.mappers.forEach(mapper => {
                    searchableTags += ' ' + mapper.username;
                });
            });

            searchableTags = searchableTags.toLowerCase();

            return tags.some(t => searchableTags.includes(t));
        });
    }

    res.json({ allBeatmaps });
});

/* GET artists for new map entry */
beatmapsRouter.get('/artists/', async (req, res) => {
    const featuredArtists = await FeaturedArtistService.queryAll({
        query: { osuId: { $exists: true } },
    });

    res.json(featuredArtists);
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
    if (!req.body.song) {
        return res.json({ error: 'Missing song!' });
    }

    if (req.body.tasks.length < 1) {
        return res.json({ error: 'Select at least one difficulty to map!' });
    }

    const tasks: TaskName[] = req.body.tasks;
    const createdTasks: Task['_id'][] = [];

    for (let i = 0; i < tasks.length; i++) {
        const t = await TaskService.create({
            name: tasks[i],
            mappers: req.session?.mongoId,
            mode: req.body.mode,
        });

        if (TaskService.isError(t)) {
            return res.json({ error: 'Missing task!' });
        }

        createdTasks.push(t._id);
    }

    let locks: TaskName[] = [];

    if (req.body.tasksLocked) {
        locks = req.body.tasksLocked;
    }

    const newBeatmap = await BeatmapService.create(req.session?.mongoId, createdTasks, locks, req.body.song, req.body.mode);

    if (!newBeatmap || BeatmapService.isError(newBeatmap)) {
        return res.json(defaultErrorMessage);
    }

    const b = await BeatmapService.queryByIdOrFail(newBeatmap._id, { defaultPopulate: true });

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
