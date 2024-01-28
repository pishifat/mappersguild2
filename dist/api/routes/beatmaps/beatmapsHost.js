"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const beatmap_1 = require("../../models/beatmap/beatmap");
const beatmap_2 = require("../../../interfaces/beatmap/beatmap");
const task_1 = require("../../models/beatmap/task");
const task_2 = require("../../../interfaces/beatmap/task");
const log_1 = require("../../models/log");
const log_2 = require("../../../interfaces/log");
const middlewares_1 = require("../../helpers/middlewares");
const helpers_1 = require("../../helpers/helpers");
const osuApi_1 = require("../../helpers/osuApi");
const middlewares_2 = require("./middlewares");
const user_1 = require("../../models/user");
const quest_1 = require("../../models/quest");
const mission_1 = require("../../models/mission");
const beatmapsHostRouter = express_1.default.Router();
beatmapsHostRouter.use(middlewares_1.isLoggedIn);
/* POST set game mode. */
beatmapsHostRouter.post('/:id/setMode', middlewares_2.isValidBeatmap, middlewares_2.isBeatmapHost, async (req, res) => {
    let b = res.locals.beatmap;
    if (req.body.mode == beatmap_2.BeatmapMode.Taiko) {
        const hitsoundTask = b.tasks.find(t => t.name == 'Hitsounds');
        if (hitsoundTask && req.body.mode == 'taiko') {
            return res.json({ error: '"Hitsounds" are not applicable to osu!taiko' });
        }
    }
    if (req.body.mode != beatmap_2.BeatmapMode.Hybrid) {
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
    b = await beatmap_1.BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();
    res.json(b);
    log_1.LogModel.generate(req.session?.mongoId, `changed mode of "${b.song.artist} - ${b.song.title}" to "${req.body.mode}"`, log_2.LogCategory.Beatmap);
});
/* POST set status of the beatmapset from extended view. */
beatmapsHostRouter.post('/:id/setStatus', middlewares_2.isValidBeatmap, middlewares_2.isBeatmapHost, async (req, res) => {
    const validBeatmap = res.locals.beatmap;
    if (req.body.status == beatmap_2.BeatmapStatus.Done) {
        if (validBeatmap.tasks.length == 0) {
            return res.json({ error: `You can't mark an empty mapset as complete!` });
        }
        const difficulties = ['Easy', 'Normal', 'Hard', 'Insane', 'Expert'];
        let hasNoDifficulties = true;
        let hasHitsounds = false;
        for (const task of validBeatmap.tasks) {
            if (difficulties.includes(task.name)) {
                hasNoDifficulties = false;
            }
            if (task.name == task_2.TaskName.Hitsounds) {
                hasHitsounds = true;
            }
        }
        if (hasNoDifficulties) {
            return res.json({ error: `You can't mark a mapset without difficulties as complete!` });
        }
        if (validBeatmap.mode == 'osu' || validBeatmap.mode == 'catch') {
            if (!hasHitsounds) {
                return res.json({ error: `Your mapset needs hitsounds!` });
            }
        }
        for (let i = 0; i < validBeatmap.tasks.length; i++) {
            const task = validBeatmap.tasks[i];
            task.status = task_2.TaskStatus.Done;
            await task.save();
        }
        validBeatmap.tasksLocked = Object.values(task_2.TaskName);
        await validBeatmap.save();
    }
    validBeatmap.status = req.body.status;
    await validBeatmap.save();
    const updatedBeatmap = await beatmap_1.BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();
    res.json(updatedBeatmap);
    log_1.LogModel.generate(req.session?.mongoId, `changed status of "${updatedBeatmap.song.artist} - ${updatedBeatmap.song.title}"`, log_2.LogCategory.Beatmap);
});
/* POST save a party/quest to a map */
beatmapsHostRouter.post('/:id/linkQuest', middlewares_2.isValidBeatmap, middlewares_2.isBeatmapHost, async (req, res) => {
    let beatmap = res.locals.beatmap;
    const questId = req.body.questOrMissionId;
    if (questId) {
        const quest = await quest_1.QuestModel
            .findById(questId)
            .populate({
            path: 'parties',
            populate: { path: 'members pendingMembers' },
        })
            .orFail();
        for (const task of beatmap.tasks) {
            if (!quest.modes.includes(task.mode) && task.mode != 'sb' && task.mode != 'hs') {
                return res.json({ error: `Some of this mapset's difficulties are not the correct mode for the selected quest!` });
            }
            for (const mapper of task.mappers) {
                const user = await user_1.UserModel
                    .findById(mapper._id)
                    .orFail();
                if (!quest.currentParty?.members.some(m => m.id == user.id)) {
                    return res.json({ error: `Some of this mapset's mappers are not assigned to the selected quest!` });
                }
            }
        }
        beatmap.quest = quest;
        beatmap.mission = undefined;
    }
    else {
        beatmap.quest = undefined;
        beatmap.mission = undefined;
    }
    await beatmap.save();
    beatmap = await beatmap_1.BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();
    res.json(beatmap);
    log_1.LogModel.generate(req.session?.mongoId, `${questId && questId.length ? 'linked quest to' : 'unlinked quest/mission from'} "${beatmap.song.artist} - ${beatmap.song.title}"`, log_2.LogCategory.Beatmap);
});
/* POST save a mission to a map */
beatmapsHostRouter.post('/:id/linkMission', middlewares_2.isValidBeatmap, middlewares_2.isBeatmapHost, async (req, res) => {
    let beatmap = res.locals.beatmap;
    const missionId = req.body.questOrMissionId;
    if (missionId) {
        const mission = await mission_1.MissionModel
            .findById(missionId)
            .defaultPopulate()
            .orFail();
        const user = await user_1.UserModel.findById(req.session.mongoId).orFail();
        if (!mission.modes.includes(beatmap.mode) && beatmap.mode !== beatmap_2.BeatmapMode.Hybrid) {
            return res.json({ error: 'Mode not allowed for this quest' });
        }
        beatmap.quest = undefined;
        beatmap.mission = mission;
        await beatmap.save();
    }
    else {
        beatmap.quest = undefined;
        beatmap.mission = undefined;
        await beatmap.save();
    }
    beatmap = await beatmap_1.BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();
    res.json(beatmap);
    log_1.LogModel.generate(req.session?.mongoId, `${missionId && missionId.length ? 'linked mission to' : 'unlinked quest/mission from'} "${beatmap.song.artist} - ${beatmap.song.title}"`, log_2.LogCategory.Beatmap);
});
/* POST edit link from extended view. */
beatmapsHostRouter.post('/:id/setLink', middlewares_2.isValidBeatmap, middlewares_2.isBeatmapHost, middlewares_1.isValidUrl, async (req, res) => {
    const url = req.body.url;
    let b = res.locals.beatmap;
    b.url = url;
    await b.save();
    b = await beatmap_1.BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();
    res.json(b);
    log_1.LogModel.generate(req.session?.mongoId, `edited link on "${b.song.artist} - ${b.song.title}"`, log_2.LogCategory.Beatmap);
    // set submissionDate (not needed on beatmaps page and it takes extra time, so it's done after return)
    const response = await osuApi_1.getClientCredentialsGrant();
    if (!osuApi_1.isOsuResponseError(response)) {
        const token = response.access_token;
        if (url.indexOf('osu.ppy.sh/beatmapsets/') > -1) {
            const osuId = helpers_1.findBeatmapsetId(url);
            const bmInfo = await osuApi_1.getBeatmapsetV2Info(token, osuId);
            if (!osuApi_1.isOsuResponseError(bmInfo)) {
                b.submissionDate = new Date(bmInfo.submitted_date);
                await b.save();
            }
        }
    }
});
/* POST locks task from extended view. */
beatmapsHostRouter.post('/:id/lockTask', middlewares_2.isValidBeatmap, middlewares_2.isBeatmapHost, async (req, res) => {
    if (!req.body.task) {
        return res.json({ error: 'Not a valid task' });
    }
    let b = res.locals.beatmap;
    b.tasksLocked.push(req.body.task);
    await b.save();
    b = await beatmap_1.BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();
    res.json(b);
    log_1.LogModel.generate(req.session?.mongoId, `locked claims for "${req.body.task}" on "${b.song.artist} - ${b.song.title}"`, log_2.LogCategory.Beatmap);
});
/* POST unlocks task from extended view. */
beatmapsHostRouter.post('/:id/unlockTask', middlewares_2.isValidBeatmap, middlewares_2.isBeatmapHost, async (req, res) => {
    await beatmap_1.BeatmapModel.findByIdAndUpdate(req.params.id, {
        $pull: { tasksLocked: req.body.task },
    });
    const b = await beatmap_1.BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();
    res.json(b);
    log_1.LogModel.generate(req.session?.mongoId, `unlocked claims for "${req.body.task}" on "${b.song.artist} - ${b.song.title}"`, log_2.LogCategory.Beatmap);
});
/* POST delete map */
beatmapsHostRouter.post('/:id/delete', middlewares_2.isValidBeatmap, middlewares_2.isBeatmapHost, async (req, res) => {
    const b = res.locals.beatmap;
    for (let i = 0; i < b.tasks.length; i++) {
        await task_1.TaskModel.findByIdAndRemove(b.tasks[i]);
    }
    await beatmap_1.BeatmapModel.findByIdAndRemove(req.params.id);
    res.json(b);
    log_1.LogModel.generate(req.session?.mongoId, `deleted "${b.song.artist} - ${b.song.title}"`, log_2.LogCategory.Beatmap);
});
exports.default = beatmapsHostRouter;
