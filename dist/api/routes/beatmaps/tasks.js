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
const invite_1 = require("../../models/invite");
const invite_2 = require("../../../interfaces/invite");
const notification_1 = require("../../models/notification");
const log_1 = require("../../models/log");
const log_2 = require("../../../interfaces/log");
const tasksRouter = express_1.default.Router();
tasksRouter.use(middlewares_1.isLoggedIn);
const inviteError = 'Invite not sent: ';
/* POST create task from extended view. */
tasksRouter.post('/addTask/:mapId', middlewares_1.isNotSpectator, middlewares_2.isValidBeatmap, async (req, res) => {
    let beatmap = res.locals.beatmap;
    const user = res.locals.userRequest;
    const isHost = beatmap.host.id == user.id;
    const taskName = req.body.taskName;
    let taskMode = req.body.mode || beatmap.mode;
    if (taskName == task_2.TaskName.Storyboard) {
        taskMode = task_2.TaskMode.SB;
    }
    await beatmap.checkTaskAvailability(user, taskName, taskMode);
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
    if (!isHost) {
        notification_1.NotificationModel.generate(beatmap._id, `added "${taskName}" difficulty to your mapset`, beatmap.host._id, req.session?.mongoId, beatmap._id);
    }
});
/* POST delete task from extended view. */
tasksRouter.post('/removeTask/:id', async (req, res) => {
    const [b, t] = await Promise.all([
        beatmap_1.BeatmapModel
            .findOne({
            _id: req.body.beatmapId,
            status: { $ne: beatmap_2.BeatmapStatus.Ranked },
        })
            .orFail(),
        task_1.TaskModel
            .findById(req.params.id)
            .orFail(),
    ]);
    if (t.mappers.indexOf(req.session?.mongoId) < 0 && b.host != req.session?.mongoId) {
        return res.json({ error: 'Not mapper' });
    }
    await beatmap_1.BeatmapModel.findByIdAndUpdate(req.body.beatmapId, { $pull: { tasks: t._id } });
    await task_1.TaskModel.findByIdAndRemove(req.params.id);
    const updatedBeatmap = await beatmap_1.BeatmapModel
        .findById(req.body.beatmapId)
        .defaultPopulate()
        .orFail();
    res.json(updatedBeatmap);
    log_1.LogModel.generate(req.session?.mongoId, `removed "${t.name}" from "${updatedBeatmap.song.artist} - ${updatedBeatmap.song.title}"`, log_2.LogCategory.Beatmap);
    if (updatedBeatmap.host.id != req.session?.mongoId) {
        notification_1.NotificationModel.generate(updatedBeatmap._id, `removed task "${t.name}" from your mapset`, updatedBeatmap.host._id, req.session?.mongoId, updatedBeatmap._id);
    }
});
/* POST invite collab user to task. */
tasksRouter.post('/task/:taskId/addCollab', middlewares_2.isValidUser, async (req, res) => {
    const user = res.locals.userRequest;
    const userToRequest = res.locals.user;
    const taskId = req.params.taskId;
    const [task, beatmap] = await Promise.all([
        task_1.TaskModel
            .findOne({
            _id: taskId,
            mappers: user._id,
        })
            .orFail(),
        beatmap_1.BeatmapModel
            .findOne({
            tasks: taskId,
            status: { $ne: beatmap_2.BeatmapStatus.Ranked },
        })
            .defaultPopulate()
            .orFail(),
    ]);
    const taskMode = req.body.mode || beatmap.mode;
    if (task.mappers.some(m => m.id == userToRequest.id)) {
        throw new Error(inviteError + 'User is already a collaborator');
    }
    await beatmap.checkTaskAvailability(userToRequest, task.name, taskMode, invite_2.ActionType.Collab);
    const newInvite = await invite_1.InviteModel.generateMapInvite(userToRequest._id, user._id, req.params.taskId, `wants to collaborate with you on the "${task.name}" difficulty of`, invite_2.ActionType.Collab, beatmap._id, task.name, taskMode);
    if (!newInvite) {
        return res.json({ error: inviteError + 'Invite generation failed!' });
    }
    res.json(beatmap);
});
/* POST remove collab user from task. */
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
            .orFail(),
        task_1.TaskModel
            .findOne({
            _id: req.params.taskId,
            mappers: req.session?.mongoId,
        })
            .orFail(),
    ]);
    const updatedTask = await task_1.TaskModel
        .findByIdAndUpdate(t._id, { $pull: { mappers: u._id } })
        .orFail();
    const updatedB = await beatmap_1.BeatmapModel
        .findById(b._id)
        .defaultPopulate()
        .orFail();
    res.json(updatedB);
    log_1.LogModel.generate(req.session?.mongoId, `removed "${u.username}" from collab mapper of "${updatedTask.name}" on "${updatedB.song.artist} - ${updatedB.song.title}"`, log_2.LogCategory.Beatmap);
});
/* POST set status of the task selected from extended view. */
tasksRouter.post('/setTaskStatus/:taskId', async (req, res) => {
    const t = await task_1.TaskModel
        .findById(req.params.taskId)
        .orFail();
    let b = await beatmap_1.BeatmapModel
        .findOne({
        tasks: t._id,
        status: { $ne: beatmap_2.BeatmapStatus.Ranked },
    })
        .defaultPopulate()
        .orFail();
    if (t.mappers.indexOf(req.session?.mongoId) < 0 && req.session?.mongoId != b.host.id) {
        return res.json({ error: 'Not mapper' });
    }
    t.status = req.body.status;
    await t.save();
    b = await beatmap_1.BeatmapModel
        .findById(b._id)
        .defaultPopulate()
        .orFail();
    res.json(b);
    log_1.LogModel.generate(req.session?.mongoId, `changed status of "${t.name}" on "${b.song.artist} - ${b.song.title}"`, log_2.LogCategory.Beatmap);
    if (b.host.id != req.session?.mongoId) {
        notification_1.NotificationModel.generate(b._id, `changed status of "${t.name}" on your mapset`, b.host._id, req.session?.mongoId, b._id);
    }
});
/* POST request added task*/
tasksRouter.post('/requestTask/:mapId', middlewares_1.isNotSpectator, middlewares_2.isValidUser, middlewares_2.isValidBeatmap, middlewares_2.isBeatmapHost, async (req, res) => {
    const user = res.locals.user;
    const beatmap = res.locals.beatmap;
    await beatmap.checkTaskAvailability(user, req.body.taskName, req.body.mode, invite_2.ActionType.Create);
    res.json(beatmap);
    invite_1.InviteModel.generateMapInvite(user._id, req.session?.mongoId, beatmap._id, `wants you to create the ${req.body.taskName != task_2.TaskName.Storyboard ? req.body.mode + ' difficulty' : 'task'} ${req.body.taskName} for their mapset of`, invite_2.ActionType.Create, beatmap._id, req.body.taskName, req.body.mode);
});
exports.default = tasksRouter;
