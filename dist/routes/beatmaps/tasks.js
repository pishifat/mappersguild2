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
const helpers_1 = require("../../helpers/helpers");
const middlewares_2 = require("./middlewares");
const quest_1 = require("../../models/quest");
const invite_1 = require("../../models/invite");
const invite_2 = require("../../interfaces/invite");
const notification_1 = require("../../models/notification");
const log_1 = require("../../models/log");
const log_2 = require("../../interfaces/log");
const tasksRouter = express_1.default.Router();
tasksRouter.use(middlewares_1.isLoggedIn);
function addTaskChecks(userId, b, taskName, taskMode, isHost) {
    return __awaiter(this, void 0, void 0, function* () {
        if (b.tasks.length > 20 && taskName) {
            return { error: 'This mapset has too many difficulties!' };
        }
        if (taskName == task_2.TaskName.Storyboard) {
            let sb = false;
            b.tasks.forEach(task => {
                if (task.name == task_2.TaskName.Storyboard) {
                    sb = true;
                }
            });
            if (sb) {
                return { error: 'There can only be one storyboard on a mapset!' };
            }
        }
        if (b.quest && taskName != task_2.TaskName.Storyboard) {
            const q = yield quest_1.QuestModel
                .findOne({ _id: b.quest })
                .defaultPopulate();
            let validMapper = false;
            if (!q) {
                return helpers_1.defaultErrorMessage;
            }
            q.currentParty.members.forEach(member => {
                if (member.id == userId) {
                    validMapper = true;
                }
            });
            if (!validMapper) {
                return { error: `This mapset is part of a quest, so only members of the quest's current party can add difficulties!` };
            }
            if (taskMode && !b.quest.modes.includes(taskMode)) {
                return { error: `The selected quest doesn't support beatmaps of this mode!` };
            }
        }
        const isAlreadyBn = yield beatmap_1.BeatmapModel.findOne({
            _id: b._id,
            bns: userId,
        });
        if (isAlreadyBn) {
            return { error: 'Cannot create a difficulty while in BN list!' };
        }
        if (b.tasksLocked && !isHost && taskName) {
            let locked = false;
            b.tasksLocked.forEach(task => {
                if (taskName == task) {
                    locked = true;
                }
            });
            if (locked) {
                return { error: 'This task is locked by the mapset host!' };
            }
        }
        return { success: 'ok' };
    });
}
const inviteError = 'Invite not sent: ';
tasksRouter.post('/addTask/:mapId', middlewares_1.isNotSpectator, middlewares_2.isValidBeatmap, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    let b = res.locals.beatmap;
    const isHost = b.host.id == ((_a = req.session) === null || _a === void 0 ? void 0 : _a.mongoId);
    const valid = yield addTaskChecks((_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId, b, req.body.taskName, req.body.mode, isHost);
    if (valid.error) {
        return res.json(valid);
    }
    let mode = req.body.mode;
    if (!mode) {
        mode = b.mode;
    }
    if (req.body.taskName == task_2.TaskName.Storyboard) {
        mode = 'sb';
    }
    const t = new task_1.TaskModel();
    t.name = req.body.taskName;
    t.mappers = (_c = req.session) === null || _c === void 0 ? void 0 : _c.mongoId;
    t.mode = mode;
    yield t.save();
    if (!t) {
        return res.json(helpers_1.defaultErrorMessage);
    }
    b.tasks.push(t._id);
    yield b.save();
    b = yield beatmap_1.BeatmapModel.findById(req.params.mapId).defaultPopulate();
    res.json(b);
    log_1.LogModel.generate((_d = req.session) === null || _d === void 0 ? void 0 : _d.mongoId, `added "${req.body.taskName}" difficulty to "${b.song.artist} - ${b.song.title}"`, log_2.LogCategory.Beatmap);
    if (!isHost) {
        notification_1.NotificationModel.generate(b.id, `added "${req.body.taskName}" difficulty to your mapset`, b.host.id, (_e = req.session) === null || _e === void 0 ? void 0 : _e.mongoId, b.id);
    }
}));
tasksRouter.post('/removeTask/:id', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f, _g, _h, _j, _k;
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
    if (t.mappers.indexOf((_f = req.session) === null || _f === void 0 ? void 0 : _f.mongoId) < 0 && b.host != ((_g = req.session) === null || _g === void 0 ? void 0 : _g.mongoId)) {
        return res.json({ error: 'Not mapper' });
    }
    yield beatmap_1.BeatmapModel.findByIdAndUpdate(req.body.beatmapId, { $pull: { tasks: t._id } });
    yield task_1.TaskModel.findByIdAndRemove(req.params.id);
    const updatedBeatmap = yield beatmap_1.BeatmapModel
        .findById(req.body.beatmapId)
        .defaultPopulate()
        .orFail();
    res.json(updatedBeatmap);
    log_1.LogModel.generate((_h = req.session) === null || _h === void 0 ? void 0 : _h.mongoId, `removed "${t.name}" from "${updatedBeatmap.song.artist} - ${updatedBeatmap.song.title}"`, log_2.LogCategory.Beatmap);
    if (updatedBeatmap.host.id != ((_j = req.session) === null || _j === void 0 ? void 0 : _j.mongoId)) {
        notification_1.NotificationModel.generate(updatedBeatmap._id, `removed task "${t.name}" from your mapset`, updatedBeatmap.host.id, (_k = req.session) === null || _k === void 0 ? void 0 : _k.mongoId, updatedBeatmap._id);
    }
}));
tasksRouter.post('/task/:taskId/addCollab', middlewares_1.isNotSpectator, middlewares_2.isValidUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _l, _m;
    const u = res.locals.user;
    const [t, b] = yield Promise.all([
        task_1.TaskModel.findOne({
            _id: req.params.taskId,
            mappers: u._id,
        }),
        beatmap_1.BeatmapModel
            .findOne({
            tasks: req.params.taskId,
            status: { $ne: beatmap_2.BeatmapStatus.Ranked },
        })
            .defaultPopulate(),
    ]);
    if (t || !b) {
        return res.json({ error: inviteError + 'User is already a collaborator' });
    }
    if (!req.body.mode) {
        req.body.mode = b.mode;
    }
    const validity = yield addTaskChecks(u.id, b, req.body.taskName, req.body.mode, b.host.id == ((_l = req.session) === null || _l === void 0 ? void 0 : _l.mongoId));
    if (validity.error) {
        return res.json(validity);
    }
    const updatedTask = yield task_1.TaskModel.findById(req.params.taskId);
    if (!updatedTask) {
        return res.json({ error: inviteError + 'Task does not exist!' });
    }
    const newInvite = yield invite_1.InviteModel.generateMapInvite(u.id, (_m = req.session) === null || _m === void 0 ? void 0 : _m.mongoId, req.params.taskId, `wants to collaborate with you on the "${updatedTask.name}" difficulty of`, invite_2.ActionType.Collab, b._id, req.body.taskName, req.body.mode);
    if (!newInvite) {
        return res.json({ error: inviteError + 'Invite generation failed!' });
    }
    res.json(b);
}));
tasksRouter.post('/task/:taskId/removeCollab', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _o, _p;
    const [u, b, t] = yield Promise.all([
        user_1.UserModel
            .findById(req.body.user)
            .orFail(),
        beatmap_1.BeatmapModel
            .findOne({
            tasks: req.params.taskId,
            status: { $ne: beatmap_2.BeatmapStatus.Ranked },
        })
            .orFail(),
        task_1.TaskModel
            .findOne({
            _id: req.params.taskId,
            mappers: (_o = req.session) === null || _o === void 0 ? void 0 : _o.mongoId,
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
    log_1.LogModel.generate((_p = req.session) === null || _p === void 0 ? void 0 : _p.mongoId, `removed "${u.username}" from collab mapper of "${updatedTask.name}" on "${updatedB.song.artist} - ${updatedB.song.title}"`, log_2.LogCategory.Beatmap);
}));
tasksRouter.post('/setTaskStatus/:taskId', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _q, _r, _s, _t, _u;
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
    if (t.mappers.indexOf((_q = req.session) === null || _q === void 0 ? void 0 : _q.mongoId) < 0 && ((_r = req.session) === null || _r === void 0 ? void 0 : _r.mongoId) != b.host.id) {
        return res.json({ error: 'Not mapper' });
    }
    t.status = req.body.status;
    yield t.save();
    b = yield beatmap_1.BeatmapModel
        .findById(b._id)
        .defaultPopulate()
        .orFail();
    res.json(b);
    log_1.LogModel.generate((_s = req.session) === null || _s === void 0 ? void 0 : _s.mongoId, `changed status of "${t.name}" on "${b.song.artist} - ${b.song.title}"`, log_2.LogCategory.Beatmap);
    if (b.host.id != ((_t = req.session) === null || _t === void 0 ? void 0 : _t.mongoId)) {
        notification_1.NotificationModel.generate(b._id, `changed status of "${t.name}" on your mapset`, b.host.id, (_u = req.session) === null || _u === void 0 ? void 0 : _u.mongoId, b._id);
    }
}));
tasksRouter.post('/requestTask/:mapId', middlewares_1.isNotSpectator, middlewares_2.isValidUser, middlewares_2.isValidBeatmap, middlewares_2.isBeatmapHost, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _v;
    const u = res.locals.user;
    const b = res.locals.beatmap;
    const valid = yield addTaskChecks(u.id, b, req.body.taskName, req.body.mode, true);
    if (valid.error) {
        return res.json(valid);
    }
    res.json(b);
    invite_1.InviteModel.generateMapInvite(u._id, (_v = req.session) === null || _v === void 0 ? void 0 : _v.mongoId, b._id, `wants you to create the ${req.body.taskName != task_2.TaskName.Storyboard ? req.body.mode + ' difficulty' : 'task'} ${req.body.taskName} for their mapset of`, invite_2.ActionType.Create, b._id, req.body.taskName, req.body.mode);
}));
exports.default = tasksRouter;
