import express from 'express';
import { BeatmapService, Beatmap, BeatmapMode, BeatmapStatus } from '../../models/beatmap/beatmap';
import { TaskService, TaskName, TaskStatus } from '../../models/beatmap/task';
import { QuestService } from '../../models/quest';
import { LogService, LogCategory } from '../../models/log';
import { isLoggedIn, isNotSpectator } from '../../helpers/middlewares';
import { defaultErrorMessage, canFail } from '../../helpers/helpers';
import { isValidBeatmap, isBeatmapHost } from './middlewares';
import { UserService } from '../../models/user';

const beatmapsHostRouter = express.Router();

beatmapsHostRouter.use(isLoggedIn);
beatmapsHostRouter.use(isNotSpectator);

/* POST set game mode. */
beatmapsHostRouter.post('/:id/setMode', isValidBeatmap, isBeatmapHost, canFail(async (req, res) => {
    let b: Beatmap = res.locals.beatmap;

    if (req.body.mode != BeatmapMode.Hybrid) {
        if (b.quest && !b.quest.modes.includes(req.body.mode)) {
            return res.json({ error: `The selected quest doesn't support beatmaps of this mode!` });
        }

        for (let i = 0; i < b.tasks.length; i++) {
            const task = b.tasks[i];

            await TaskService.update(task.id, { mode: req.body.mode });
        }
    }

    await BeatmapService.update(req.params.id, { mode: req.body.mode });
    b = await BeatmapService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

    res.json(b);

    LogService.create(
        req.session?.mongoId,
        `changed mode of "${b.song.artist} - ${b.song.title}" to "${req.body.mode}"`,
        b._id,
        LogCategory.Beatmap
    );
}));

/* POST set status of the beatmapset from extended view. */
beatmapsHostRouter.post('/:id/setStatus', isValidBeatmap, isBeatmapHost, canFail(async (req, res) => {
    const validBeatmap: Beatmap = res.locals.beatmap;

    if (req.body.status == BeatmapStatus.Done) {
        if (validBeatmap.tasks.length == 0) {
            return res.json({ error: `You can't mark an empty mapset as complete!` });
        }

        if (validBeatmap.tasks.length == 1 && validBeatmap.tasks[0].name == TaskName.Storyboard) {
            return res.json({ error: `You can't mark a mapset without difficulties as complete!` });
        }

        for (let i = 0; i < validBeatmap.tasks.length; i++) {
            await TaskService.update(validBeatmap.tasks[i].id, { status: TaskStatus.Done });
        }

        await BeatmapService.update(req.params.id, {
            tasksLocked: Object.values(TaskName),
        });
    }

    await BeatmapService.update(req.params.id, { status: req.body.status });
    const updatedBeatmap = await BeatmapService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

    res.json(updatedBeatmap);

    LogService.create(
        req.session?.mongoId,
        `changed status of "${updatedBeatmap.song.artist} - ${updatedBeatmap.song.title}"`,
        updatedBeatmap._id,
        LogCategory.Beatmap
    );
}));

/* POST quest to map */
beatmapsHostRouter.post('/:id/saveQuest', isValidBeatmap, isBeatmapHost, canFail(async (req, res) => {
    let b: Beatmap = res.locals.beatmap;

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
        await BeatmapService.update(req.params.id, { quest: null });
    }

    await BeatmapService.update(req.params.id, { quest: req.body.questId });
    b = await BeatmapService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

    res.json(b);

    LogService.create(
        req.session?.mongoId,
        `${req.body.questId.length ? 'linked quest to' : 'unlinked quest from'} "${b.song.artist} - ${b.song.title}"`,
        b._id,
        LogCategory.Beatmap
    );
}));

/* POST edit link from extended view. */
beatmapsHostRouter.post('/:id/setLink', isValidBeatmap, isBeatmapHost, canFail(async (req, res) => {
    let url = req.body.url;

    if (!url?.length) {
        url = undefined;
    }

    const regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;

    if (!regexp.test(url)) {
        return res.json({ error: 'Not a valid URL' });
    }

    let b: Beatmap = res.locals.beatmap;

    await BeatmapService.update(req.params.id, { url });
    b = await BeatmapService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

    res.json(b);

    LogService.create(
        req.session?.mongoId,
        `edited link on "${b.song.artist} - ${b.song.title}"`,
        b._id,
        LogCategory.Beatmap
    );
}));

/* POST locks task from extended view. */
beatmapsHostRouter.post('/:id/lockTask', isValidBeatmap, isBeatmapHost, canFail(async (req, res) => {
    if (!req.body.task) {
        return res.json({ error: 'Not a valid task' });
    }

    await BeatmapService.update(req.params.id, {
        $push: { tasksLocked: req.body.task },
    });

    const b = await BeatmapService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

    res.json(b);

    LogService.create(
        req.session?.mongoId,
        `locked claims for "${req.body.task}" on "${b.song.artist} - ${b.song.title}"`,
        b._id,
        LogCategory.Beatmap
    );
}));

/* POST unlocks task from extended view. */
beatmapsHostRouter.post('/:id/unlockTask', isValidBeatmap, isBeatmapHost, canFail(async (req, res) => {
    await BeatmapService.update(req.params.id, {
        $pull: { tasksLocked: req.body.task },
    });

    const b = await BeatmapService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

    res.json(b);

    LogService.create(
        req.session?.mongoId,
        `unlocked claims for "${req.body.task}" on "${b.song.artist} - ${b.song.title}"`,
        b._id,
        LogCategory.Beatmap
    );
}));

/* POST delete map */
beatmapsHostRouter.post('/:id/delete', isValidBeatmap, isBeatmapHost, async (req, res) => {
    const b: Beatmap = res.locals.beatmap;

    for (let i = 0; i < b.tasks.length; i++) {
        await TaskService.remove(b.tasks[i]);
    }

    await BeatmapService.remove(req.params.id);
    res.json(b);

    LogService.create(
        req.session?.mongoId,
        `deleted "${b.song.artist} - ${b.song.title}"`,
        b._id,
        LogCategory.Beatmap
    );
});

export default beatmapsHostRouter;
