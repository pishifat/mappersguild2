import express from 'express';
import { BeatmapService, Beatmap } from '../../models/beatmap/beatmap';
import { BeatmapMode, BeatmapStatus } from '../../interfaces/beatmap/beatmap';
import { TaskService, Task } from '../../models/beatmap/task';
import { TaskName } from '../../interfaces/beatmap/task';
import { QuestService } from '../../models/quest';
import { NotificationService } from '../../models/notification';
import { LogService } from '../../models/log';
import { LogCategory } from '../../interfaces/log';
import { isLoggedIn, isNotSpectator, isBn } from '../../helpers/middlewares';
import { defaultErrorMessage, canFail } from '../../helpers/helpers';
import { isValidBeatmap } from './middlewares';

const beatmapsRouter = express.Router();

beatmapsRouter.use(isLoggedIn);

/* GET maps page. */
beatmapsRouter.get('/', (req, res) => {
    res.render('beatmaps', {
        title: 'Beatmaps',
        script: 'beatmaps.js',
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

    const mode = req.query.mode as BeatmapMode | 'any';
    const limit = parseInt(req.query.limit, 10);
    const status = req.query.status as BeatmapStatus | undefined;
    const quest = req.query.quest as 'none' | undefined;
    const search = req.query.search as string | undefined;

    let allBeatmaps = await BeatmapService.queryAll({
        query: {
            ...(mode != 'any' ? {
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
        limit: search ? undefined : limit,
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

/* GET quests for linking quest to beatmap */
beatmapsRouter.get('/users/quests', async (req, res) => {
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
        LogCategory.Beatmap
    );
}));

/* POST modder from extended view, returns new modders list. */
beatmapsRouter.post('/:id/updateModder', isNotSpectator, canFail(async (req, res) => {
    const isAlreadyModder = await BeatmapService.queryOne({
        query: {
            _id: req.params.id,
            modders: req.session?.mongoId,
        },
    });
    let update;

    if (isAlreadyModder) {
        update = { $pull: { modders: req.session?.mongoId } };
    } else {
        update = { $push: { modders: req.session?.mongoId } };
    }

    let b = await BeatmapService.queryByIdOrFail(req.params.id);

    if (b.status == BeatmapStatus.Ranked) {
        return res.json({ error: 'Mapset ranked' });
    }

    await BeatmapService.update(req.params.id, update);
    b = await BeatmapService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

    res.json(b);

    if (isAlreadyModder) {
        LogService.create(
            req.session?.mongoId,
            `removed from modder list on "${b.song.artist} - ${b.song.title}"`,
            LogCategory.Beatmap
        );
        NotificationService.create(
            b._id,
            `removed themself from the modder list of your mapset`,
            b.host.id,
            req.session?.mongoId,
            b._id
        );
    } else {
        LogService.create(
            req.session?.mongoId,
            `modded "${b.song.artist} - ${b.song.title}"`,
            LogCategory.Beatmap
        );
        NotificationService.create(
            b._id,
            `modded your mapset`,
            b.host.id,
            req.session?.mongoId,
            b._id
        );
    }
}));

/* POST bn from extended view, returns new bns list. */
beatmapsRouter.post('/:id/updateBn', isNotSpectator, isBn, isValidBeatmap, async (req, res) => {
    const b: Beatmap = res.locals.beatmap;
    const isAlreadyBn = await BeatmapService.queryOne({
        query: {
            _id: req.params.id,
            bns: req.session?.mongoId,
        },
    });
    let update;

    if (isAlreadyBn) {
        update = { $pull: { bns: req.session?.mongoId } };
    } else {
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
    }

    await BeatmapService.update(req.params.id, update);
    const updatedBeatmap = await BeatmapService.queryById(req.params.id, { defaultPopulate: true });

    if (!updatedBeatmap || BeatmapService.isError(updatedBeatmap)) {
        return res.json(defaultErrorMessage);
    }

    res.json(updatedBeatmap);

    if (isAlreadyBn) {
        LogService.create(
            req.session?.mongoId,
            `removed from Beatmap Nominator list on "${updatedBeatmap.song.artist} - ${updatedBeatmap.song.title}"`,
            LogCategory.Beatmap
        );
        NotificationService.create(
            updatedBeatmap._id,
            `removed themself from the Beatmap Nominator list on your mapset`,
            updatedBeatmap.host.id,
            req.session?.mongoId,
            updatedBeatmap._id
        );
    } else {
        LogService.create(
            req.session?.mongoId,
            `added to Beatmap Nominator list on "${updatedBeatmap.song.artist} - ${updatedBeatmap.song.title}"`,
            LogCategory.Beatmap
        );
        NotificationService.create(
            updatedBeatmap._id,
            `added themself to the Beatmap Nominator list on your mapset`,
            updatedBeatmap.host.id,
            req.session?.mongoId,
            updatedBeatmap._id
        );
    }
});

export default beatmapsRouter;
