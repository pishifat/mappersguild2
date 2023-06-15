import express from 'express';
import { BeatmapModel, Beatmap } from '../../models/beatmap/beatmap';
import { BeatmapMode, BeatmapStatus } from '../../../interfaces/beatmap/beatmap';
import { TaskModel } from '../../models/beatmap/task';
import { TaskName, TaskStatus } from '../../../interfaces/beatmap/task';
import { LogModel } from '../../models/log';
import { LogCategory } from '../../../interfaces/log';
import { isLoggedIn, isValidUrl } from '../../helpers/middlewares';
import { isBeatmapHost, isValidBeatmap } from './middlewares';
import { UserModel } from '../../models/user';
import { QuestModel } from '../../models/quest';
import { MissionModel } from '../../models/mission';
import { MissionMode } from '../../../interfaces/mission';

const beatmapsHostRouter = express.Router();

beatmapsHostRouter.use(isLoggedIn);

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

/* POST save a party/quest to a map */
beatmapsHostRouter.post('/:id/linkQuest', isValidBeatmap, isBeatmapHost, async (req, res) => {
    let beatmap: Beatmap = res.locals.beatmap;
    const questId = req.body.questOrMissionId;

    if (questId) {
        const quest = await QuestModel
            .findById(questId)
            .populate({
                path: 'parties',
                populate: { path: 'members pendingMembers' },
            })
            .orFail();

        for (const task of beatmap.tasks) {
            if (!quest.modes.includes(task.mode) && task.mode !== 'sb') {
                return res.json({ error: `Some of this mapset's difficulties are not the correct mode for the selected quest!` });
            }

            for (const mapper of task.mappers) {
                const user = await UserModel
                    .findById(mapper._id)
                    .orFail();

                if (!quest.currentParty?.members.some(m => m.id == user.id)) {
                    return res.json({ error: `Some of this mapset's mappers are not assigned to the selected quest!` });
                }
            }
        }

        beatmap.quest = quest;
        beatmap.mission = undefined;
    } else {
        beatmap.quest = undefined;
        beatmap.mission = undefined;
    }

    await beatmap.save();

    beatmap = await BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();

    res.json(beatmap);

    LogModel.generate(
        req.session?.mongoId,
        `${questId && questId.length ? 'linked quest to' : 'unlinked quest/mission from'} "${beatmap.song.artist} - ${beatmap.song.title}"`,
        LogCategory.Beatmap
    );
});

/* POST save a mission to a map */
beatmapsHostRouter.post('/:id/linkMission', isValidBeatmap, isBeatmapHost, async (req, res) => {
    let beatmap: Beatmap = res.locals.beatmap;
    const missionId = req.body.questOrMissionId;

    if (missionId) {
        const mission = await MissionModel
            .findById(missionId)
            .defaultPopulate()
            .orFail();

        const user = await UserModel.findById(req.session.mongoId).orFail();

        if (mission.userMaximumRankedBeatmapsCount && mission.userMaximumRankedBeatmapsCount !== 0) {
            if (user.rankedBeatmapsCount > mission.userMaximumRankedBeatmapsCount) {
                return res.json({ error: 'You have too many ranked maps to do this quest. Give the newer mappers a chance :)' });
            }
        }

        if (mission.userMaximumGlobalRank) {
            if (user.globalRank < mission.userMaximumGlobalRank) {
                return res.json({ error: `You're too high-ranked to accept this quest. Give worse players a chance :)` });
            }
        }

        if (!mission.modes.includes(beatmap.mode as unknown as MissionMode) && beatmap.mode !== BeatmapMode.Hybrid) {
            return res.json({ error: 'Mode not allowed for this quest' });
        }

        beatmap.quest = undefined;
        beatmap.mission = mission;
        await beatmap.save();
    } else {
        beatmap.quest = undefined;
        beatmap.mission = undefined;
        await beatmap.save();
    }

    beatmap = await BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();

    res.json(beatmap);

    LogModel.generate(
        req.session?.mongoId,
        `${missionId && missionId.length ? 'linked mission to' : 'unlinked quest/mission from'} "${beatmap.song.artist} - ${beatmap.song.title}"`,
        LogCategory.Beatmap
    );
});

/* POST edit link from extended view. */
beatmapsHostRouter.post('/:id/setLink', isValidBeatmap, isBeatmapHost, isValidUrl, async (req, res) => {
    const url = req.body.url;
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
