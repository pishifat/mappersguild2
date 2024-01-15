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
const user_1 = require("../../models/user");
const middlewares_1 = require("../../helpers/middlewares");
const middlewares_2 = require("./middlewares");
const log_1 = require("../../models/log");
const log_2 = require("../../../interfaces/log");
const user_2 = require("../../../interfaces/user");
const tasksRouter = express_1.default.Router();
tasksRouter.use(middlewares_1.isLoggedIn);
/* POST create task */
tasksRouter.post('/addTask/:mapId', middlewares_2.isValidBeatmap, middlewares_1.isValidUser, async (req, res) => {
    let beatmap = res.locals.beatmap;
    const user = req.body.user && req.body.user.length ? res.locals.user : res.locals.userRequest;
    const taskName = req.body.taskName;
    let taskMode = req.body.mode || beatmap.mode;
    if (taskName == task_2.TaskName.Storyboard) {
        taskMode = task_2.TaskMode.SB;
        const existingStoryboardTask = beatmap.tasks.find(t => t.name == task_2.TaskName.Storyboard);
        if (existingStoryboardTask) {
            return res.json({ error: 'Only one "Storyboard" task is allowed' });
        }
    }
    if (taskName == task_2.TaskName.Hitsounds) {
        taskMode = task_2.TaskMode.HS;
        const existingHitsoundsTask = beatmap.tasks.find(t => t.name == task_2.TaskName.Hitsounds);
        if (existingHitsoundsTask) {
            return res.json({ error: 'Only one "Hitsounds" task is allowed' });
        }
    }
    await beatmap.checkTaskAvailability(user, taskName, taskMode, res.locals.userRequest.group == user_2.UserGroup.Admin);
    const t = new task_1.TaskModel();
    t.name = taskName;
    t.mappers = [user];
    t.mode = taskMode;
    await t.save();
    beatmap.tasks.push(t._id);
    await beatmap.save();
    beatmap = await beatmap_1.BeatmapModel
        .findById(req.params.mapId)
        .defaultPopulate()
        .orFail();
    res.json(beatmap);
    log_1.LogModel.generate(req.session?.mongoId, `added "${taskName}" difficulty to "${beatmap.song.artist} - ${beatmap.song.title}"`, log_2.LogCategory.Beatmap);
});
/* POST delete task */
tasksRouter.post('/removeTask/:taskId/:mapId', middlewares_2.isValidBeatmap, middlewares_1.isValidUser, async (req, res) => {
    const t = await task_1.TaskModel
        .findById(req.params.taskId)
        .orFail();
    const b = res.locals.beatmap;
    if (t.mappers.indexOf(req.session?.mongoId) < 0 && b.host != req.session?.mongoId) {
        if (res.locals.userRequest.group !== user_2.UserGroup.Admin) {
            return res.json({ error: 'Not mapper' });
        }
    }
    await beatmap_1.BeatmapModel.findByIdAndUpdate(req.params.mapId, { $pull: { tasks: t._id } });
    await task_1.TaskModel.findByIdAndRemove(req.params.taskId);
    const updatedBeatmap = await beatmap_1.BeatmapModel
        .findById(req.params.mapId)
        .defaultPopulate()
        .orFail();
    res.json(updatedBeatmap);
    log_1.LogModel.generate(req.session?.mongoId, `removed "${t.name}" from "${updatedBeatmap.song.artist} - ${updatedBeatmap.song.title}"`, log_2.LogCategory.Beatmap);
});
/* POST add mapper to task */
tasksRouter.post('/addCollab/:mapId', middlewares_2.isValidBeatmap, middlewares_1.isValidUser, async (req, res) => {
    let beatmap = res.locals.beatmap;
    const user = req.body.user && req.body.user.length ? res.locals.user : res.locals.userRequest;
    const task = await task_1.TaskModel
        .findById(req.body.task._id)
        .populate('mappers')
        .orFail();
    if (task.mappers.some(m => m.id == user.id)) {
        return res.json({ error: 'User is already a mapper for this difficulty!' });
    }
    await task_1.TaskModel.findByIdAndUpdate(task.id, { $push: { mappers: user._id } });
    beatmap = await beatmap_1.BeatmapModel
        .findById(req.params.mapId)
        .defaultPopulate()
        .orFail();
    res.json(beatmap);
    log_1.LogModel.generate(req.session?.mongoId, `added collab mapper to "${task.name}" difficulty to "${beatmap.song.artist} - ${beatmap.song.title}"`, log_2.LogCategory.Beatmap);
});
/* POST remove collab user from task */
tasksRouter.post('/task/:taskId/removeCollab', async (req, res) => {
    const taskId = req.params.taskId;
    const [u, b, t] = await Promise.all([
        user_1.UserModel
            .findById(req.body.user)
            .orFail(),
        beatmap_1.BeatmapModel
            .findOne({
            tasks: taskId,
            status: { $ne: beatmap_2.BeatmapStatus.Ranked },
        })
            .populate('host')
            .orFail(),
        task_1.TaskModel
            .findOne({
            _id: req.params.taskId,
        })
            .populate('mappers')
            .orFail(),
    ]);
    const isMapper = t.mappers.some(m => m.id == req.session?.mongoId);
    const isHost = b.host.id == req.session?.mongoId;
    if (!isMapper && !isHost) {
        return res.json({ error: 'Not allowed to edit' });
    }
    const updatedTask = await task_1.TaskModel
        .findByIdAndUpdate(t._id, { $pull: { mappers: u._id } })
        .orFail();
    const updatedBeatmap = await beatmap_1.BeatmapModel
        .findById(b._id)
        .defaultPopulate()
        .orFail();
    res.json(updatedBeatmap);
    log_1.LogModel.generate(req.session?.mongoId, `removed "${u.username}" from collab mapper of "${updatedTask.name}" on "${updatedBeatmap.song.artist} - ${updatedBeatmap.song.title}"`, log_2.LogCategory.Beatmap);
});
/* POST set status of the task selected from extended view. */
tasksRouter.post('/setTaskStatus/:taskId', async (req, res) => {
    const t = await task_1.TaskModel
        .findById(req.params.taskId)
        .orFail();
    let b = await beatmap_1.BeatmapModel
        .findOne({
        tasks: t._id,
        status: req.session.osuId == 3178418 ? { $exists: true } : { $ne: beatmap_2.BeatmapStatus.Ranked },
    })
        .defaultPopulate()
        .orFail();
    if (t.mappers.indexOf(req.session?.mongoId) < 0 && req.session?.mongoId != b.host.id) {
        if (res.locals.userRequest.group !== user_2.UserGroup.Admin) {
            return res.json({ error: 'Not mapper' });
        }
    }
    t.status = req.body.status;
    await t.save();
    b = await beatmap_1.BeatmapModel
        .findById(b._id)
        .defaultPopulate()
        .orFail();
    res.json(b);
    log_1.LogModel.generate(req.session?.mongoId, `changed status of "${t.name}" on "${b.song.artist} - ${b.song.title}"`, log_2.LogCategory.Beatmap);
});
exports.default = tasksRouter;
