"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const beatmap_1 = require("../../models/beatmap/beatmap");
const beatmap_2 = require("../../interfaces/beatmap/beatmap");
const task_1 = require("../../models/beatmap/task");
const task_2 = require("../../interfaces/beatmap/task");
const user_1 = require("../../models/user");
const middlewares_1 = require("../../helpers/middlewares");
const middlewares_2 = require("./middlewares");
const invite_1 = require("../../models/invite");
const invite_2 = require("../../interfaces/invite");
const notification_1 = require("../../models/notification");
const log_1 = require("../../models/log");
const log_2 = require("../../interfaces/log");
const tasksRouter = express_1.default.Router();
tasksRouter.use(middlewares_1.isLoggedIn);
const inviteError = 'Invite not sent: ';
tasksRouter.post('/addTask/:mapId', middlewares_1.isNotSpectator, middlewares_2.isValidBeatmap, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let beatmap = res.locals.beatmap;
    const user = res.locals.userRequest;
    const isHost = beatmap.host.id == user.id;
    const taskName = req.body.taskName;
    let taskMode = req.body.mode || beatmap.mode;
    if (taskName == task_2.TaskName.Storyboard) {
        taskMode = task_2.TaskMode.SB;
    }
    yield beatmap.checkTaskAvailability(user, taskName, taskMode);
    const t = new task_1.TaskModel();
    t.name = taskName;
    t.mappers = [user];
    t.mode = taskMode;
    yield t.save();
    beatmap.tasks.push(t._id);
    yield beatmap.save();
    beatmap = yield beatmap_1.BeatmapModel
        .findById(req.params.mapId)
        .defaultPopulate()
        .orFail();
    res.json(beatmap);
    if (beatmap.status !== beatmap_2.BeatmapStatus.Secret) {
        log_1.LogModel.generate((_a = req.session) === null || _a === void 0 ? void 0 : _a.mongoId, `added "${taskName}" difficulty to "${beatmap.song.artist} - ${beatmap.song.title}"`, log_2.LogCategory.Beatmap);
        if (!isHost) {
            notification_1.NotificationModel.generate(beatmap._id, `added "${taskName}" difficulty to your mapset`, beatmap.host._id, (_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId, beatmap._id);
        }
    }
}));
tasksRouter.post('/removeTask/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e, _f, _g;
    const [b, t] = yield Promise.all([
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
    if (t.mappers.indexOf((_c = req.session) === null || _c === void 0 ? void 0 : _c.mongoId) < 0 && b.host != ((_d = req.session) === null || _d === void 0 ? void 0 : _d.mongoId)) {
        return res.json({ error: 'Not mapper' });
    }
    yield beatmap_1.BeatmapModel.findByIdAndUpdate(req.body.beatmapId, { $pull: { tasks: t._id } });
    yield task_1.TaskModel.findByIdAndRemove(req.params.id);
    const updatedBeatmap = yield beatmap_1.BeatmapModel
        .findById(req.body.beatmapId)
        .defaultPopulate()
        .orFail();
    res.json(updatedBeatmap);
    if (updatedBeatmap.status !== beatmap_2.BeatmapStatus.Secret) {
        log_1.LogModel.generate((_e = req.session) === null || _e === void 0 ? void 0 : _e.mongoId, `removed "${t.name}" from "${updatedBeatmap.song.artist} - ${updatedBeatmap.song.title}"`, log_2.LogCategory.Beatmap);
        if (updatedBeatmap.host.id != ((_f = req.session) === null || _f === void 0 ? void 0 : _f.mongoId)) {
            notification_1.NotificationModel.generate(updatedBeatmap._id, `removed task "${t.name}" from your mapset`, updatedBeatmap.host._id, (_g = req.session) === null || _g === void 0 ? void 0 : _g.mongoId, updatedBeatmap._id);
        }
    }
}));
tasksRouter.post('/task/:taskId/addCollab', middlewares_2.isValidUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = res.locals.userRequest;
    const userToRequest = res.locals.user;
    const taskId = req.params.taskId;
    const [task, beatmap] = yield Promise.all([
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
    yield beatmap.checkTaskAvailability(userToRequest, task.name, taskMode, invite_2.ActionType.Collab);
    const newInvite = yield invite_1.InviteModel.generateMapInvite(userToRequest._id, user._id, req.params.taskId, `wants to collaborate with you on the "${task.name}" difficulty of`, invite_2.ActionType.Collab, beatmap._id, task.name, taskMode);
    if (!newInvite) {
        return res.json({ error: inviteError + 'Invite generation failed!' });
    }
    res.json(beatmap);
}));
tasksRouter.post('/task/:taskId/removeCollab', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _h, _j;
    const taskId = req.params.taskId;
    const [u, b, t] = yield Promise.all([
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
            mappers: (_h = req.session) === null || _h === void 0 ? void 0 : _h.mongoId,
        })
            .orFail(),
    ]);
    const updatedTask = yield task_1.TaskModel
        .findByIdAndUpdate(t._id, { $pull: { mappers: u._id } })
        .orFail();
    const updatedB = yield beatmap_1.BeatmapModel
        .findById(b._id)
        .defaultPopulate()
        .orFail();
    res.json(updatedB);
    if (updatedB.status !== beatmap_2.BeatmapStatus.Secret) {
        log_1.LogModel.generate((_j = req.session) === null || _j === void 0 ? void 0 : _j.mongoId, `removed "${u.username}" from collab mapper of "${updatedTask.name}" on "${updatedB.song.artist} - ${updatedB.song.title}"`, log_2.LogCategory.Beatmap);
    }
}));
tasksRouter.post('/setTaskStatus/:taskId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _k, _l, _m, _o, _p;
    const t = yield task_1.TaskModel
        .findById(req.params.taskId)
        .orFail();
    let b = yield beatmap_1.BeatmapModel
        .findOne({
        tasks: t._id,
        status: { $ne: beatmap_2.BeatmapStatus.Ranked },
    })
        .defaultPopulate()
        .orFail();
    if (t.mappers.indexOf((_k = req.session) === null || _k === void 0 ? void 0 : _k.mongoId) < 0 && ((_l = req.session) === null || _l === void 0 ? void 0 : _l.mongoId) != b.host.id) {
        return res.json({ error: 'Not mapper' });
    }
    t.status = req.body.status;
    yield t.save();
    b = yield beatmap_1.BeatmapModel
        .findById(b._id)
        .defaultPopulate()
        .orFail();
    res.json(b);
    if (b.status !== beatmap_2.BeatmapStatus.Secret) {
        log_1.LogModel.generate((_m = req.session) === null || _m === void 0 ? void 0 : _m.mongoId, `changed status of "${t.name}" on "${b.song.artist} - ${b.song.title}"`, log_2.LogCategory.Beatmap);
        if (b.host.id != ((_o = req.session) === null || _o === void 0 ? void 0 : _o.mongoId)) {
            notification_1.NotificationModel.generate(b._id, `changed status of "${t.name}" on your mapset`, b.host._id, (_p = req.session) === null || _p === void 0 ? void 0 : _p.mongoId, b._id);
        }
    }
}));
tasksRouter.post('/requestTask/:mapId', middlewares_1.isNotSpectator, middlewares_2.isValidUser, middlewares_2.isValidBeatmap, middlewares_2.isBeatmapHost, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _q;
    const user = res.locals.user;
    const beatmap = res.locals.beatmap;
    yield beatmap.checkTaskAvailability(user, req.body.taskName, req.body.mode, invite_2.ActionType.Create);
    res.json(beatmap);
    invite_1.InviteModel.generateMapInvite(user._id, (_q = req.session) === null || _q === void 0 ? void 0 : _q.mongoId, beatmap._id, `wants you to create the ${req.body.taskName != task_2.TaskName.Storyboard ? req.body.mode + ' difficulty' : 'task'} ${req.body.taskName} for their mapset of`, invite_2.ActionType.Create, beatmap._id, req.body.taskName, req.body.mode);
}));
exports.default = tasksRouter;
