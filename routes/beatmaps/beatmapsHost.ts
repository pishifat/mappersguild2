import express from 'express';
import { BeatmapModel, Beatmap } from '../../models/beatmap/beatmap';
import { BeatmapMode, BeatmapStatus } from '../../interfaces/beatmap/beatmap';
import { TaskModel } from '../../models/beatmap/task';
import { TaskName, TaskStatus } from '../../interfaces/beatmap/task';
import { QuestModel } from '../../models/quest';
import { LogModel } from '../../models/log';
import { LogCategory } from '../../interfaces/log';
import { isLoggedIn, isNotSpectator } from '../../helpers/middlewares';
import { isValidBeatmap, isBeatmapHost } from './middlewares';
import { UserModel } from '../../models/user';

const beatmapsHostRouter = express.Router();

beatmapsHostRouter.use(isLoggedIn);
beatmapsHostRouter.use(isNotSpectator);

/* POST set game mode. */
beatmapsHostRouter.post('/:id/setMode', isValidBeatmap, isBeatmapHost, async (req, res) => {
    let b: Beatmap = res.locals.beatmap;

    if (req.body.mode != BeatmapMode.Hybrid) {
        if (b.quest && !b.quest.modes.includes(req.body.mode)) {
            return res.json({ error: `The selected quest doesn't support beatmaps of this mode!` });
        }

        for (let i = 0; i < b.tasks.length; i++) {
            const task = b.tasks[i];
            task.mode = req.body.mode;
            await task.save();
        }
    }

    b.mode = req.body.mode;
    await b.save();

    b = await BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();

    res.json(b);

    LogModel.generate(
        req.session?.mongoId,
        `changed mode of "${b.song.artist} - ${b.song.title}" to "${req.body.mode}"`,
        LogCategory.Beatmap
    );
});

/* POST set status of the beatmapset from extended view. */
beatmapsHostRouter.post('/:id/setStatus', isValidBeatmap, isBeatmapHost, async (req, res) => {
    const validBeatmap: Beatmap = res.locals.beatmap;

    if (validBeatmap.status == BeatmapStatus.Secret) {
        return res.json({ error: 'Cannot change status of secret map!' });
    }

    if (req.body.status == BeatmapStatus.Done) {
        if (validBeatmap.tasks.length == 0) {
            return res.json({ error: `You can't mark an empty mapset as complete!` });
        }

        if (validBeatmap.tasks.length == 1 && validBeatmap.tasks[0].name == TaskName.Storyboard) {
            return res.json({ error: `You can't mark a mapset without difficulties as complete!` });
        }

        for (let i = 0; i < validBeatmap.tasks.length; i++) {
            const task = validBeatmap.tasks[i];
            task.status = TaskStatus.Done;
            await task.save();
        }

        validBeatmap.tasksLocked = Object.values(TaskName);
        await validBeatmap.save();
    }

    validBeatmap.status = req.body.status;
    await validBeatmap.save();

    const updatedBeatmap = await BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();

    res.json(updatedBeatmap);

    LogModel.generate(
        req.session?.mongoId,
        `changed status of "${updatedBeatmap.song.artist} - ${updatedBeatmap.song.title}"`,
        LogCategory.Beatmap
    );
});

/* POST quest to map */
beatmapsHostRouter.post('/:id/saveQuest', isValidBeatmap, isBeatmapHost, async (req, res) => {
    let b: Beatmap = res.locals.beatmap;

    if (b.status == BeatmapStatus.Secret) {
        return res.json({ error: 'Cannot add quest to secret beatmap!' });
    }

    if (req.body.questId.length) {
        const q = await QuestModel
            .findById(req.body.questId)
            .populate({ path: 'currentParty',  select: 'members' })
            .orFail();

        let invalidMapper = false;
        let invalidMode = false;

        for (let i = 0; i < b.tasks.length; i++) {
            const task = b.tasks[i];

            if (q.modes.indexOf(task.mode) < 0) {
                invalidMode = true;
            }

            for (let j = 0; j < task.mappers.length; j++) {
                const u = await UserModel.findById(task.mappers[j]._id);

                if (!u) {
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

        b.quest = req.body.questId;
        await b.save();
    } else {
        await BeatmapModel.findByIdAndUpdate(req.params.id, { quest: undefined });
    }

    b = await BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();

    res.json(b);

    LogModel.generate(
        req.session?.mongoId,
        `${req.body.questId.length ? 'linked quest to' : 'unlinked quest from'} "${b.song.artist} - ${b.song.title}"`,
        LogCategory.Beatmap
    );
});

/* POST edit link from extended view. */
beatmapsHostRouter.post('/:id/setLink', isValidBeatmap, isBeatmapHost, async (req, res) => {
    let url = req.body.url;

    if (!url?.length) {
        url = undefined;
    }

    const regexp = /^(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;

    if (!regexp.test(url)) {
        return res.json({ error: 'Not a valid URL' });
    }

    let b: Beatmap = res.locals.beatmap;

    b.url = url;
    await b.save();

    b = await BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();

    res.json(b);

    LogModel.generate(
        req.session?.mongoId,
        `edited link on "${b.song.artist} - ${b.song.title}"`,
        LogCategory.Beatmap
    );
});

/* POST locks task from extended view. */
beatmapsHostRouter.post('/:id/lockTask', isValidBeatmap, isBeatmapHost, async (req, res) => {
    if (!req.body.task) {
        return res.json({ error: 'Not a valid task' });
    }

    let b: Beatmap = res.locals.beatmap;

    b.tasksLocked.push(req.body.task);
    await b.save();

    b = await BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();

    res.json(b);

    LogModel.generate(
        req.session?.mongoId,
        `locked claims for "${req.body.task}" on "${b.song.artist} - ${b.song.title}"`,
        LogCategory.Beatmap
    );
});

/* POST unlocks task from extended view. */
beatmapsHostRouter.post('/:id/unlockTask', isValidBeatmap, isBeatmapHost, async (req, res) => {
    await BeatmapModel.findByIdAndUpdate(req.params.id, {
        $pull: { tasksLocked: req.body.task },
    });

    const b = await BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();

    res.json(b);

    LogModel.generate(
        req.session?.mongoId,
        `unlocked claims for "${req.body.task}" on "${b.song.artist} - ${b.song.title}"`,
        LogCategory.Beatmap
    );
});

/* POST delete map */
beatmapsHostRouter.post('/:id/delete', isValidBeatmap, isBeatmapHost, async (req, res) => {
    const b: Beatmap = res.locals.beatmap;

    for (let i = 0; i < b.tasks.length; i++) {
        await TaskModel.findByIdAndRemove(b.tasks[i]);
    }

    await BeatmapModel.findByIdAndRemove(req.params.id);
    res.json(b);

    LogModel.generate(
        req.session?.mongoId,
        `deleted "${b.song.artist} - ${b.song.title}"`,
        LogCategory.Beatmap
    );
});

export default beatmapsHostRouter;
