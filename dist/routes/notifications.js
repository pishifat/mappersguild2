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
const middlewares_1 = require("../helpers/middlewares");
const party_1 = require("../models/party");
const helpers_1 = require("../helpers/helpers");
const beatmap_1 = require("../models/beatmap/beatmap");
const quest_1 = require("../models/quest");
const task_1 = require("../models/beatmap/task");
const task_2 = require("../interfaces/beatmap/task");
const user_1 = require("../models/user");
const invite_1 = require("../models/invite");
const notification_1 = require("../models/notification");
const log_1 = require("../models/log");
const log_2 = require("../interfaces/log");
const quest_2 = require("../interfaces/quest");
const notificationsRouter = express_1.default.Router();
notificationsRouter.use(middlewares_1.isLoggedIn);
notificationsRouter.use(middlewares_1.isUser);
const beatmapPopulate = [{ path: 'song', select: 'artist title' }];
function updatePartyInfo(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const p = yield party_1.PartyService.queryById(id, {
            populate: [{ path: 'members', select: 'rank osuPoints taikoPoints catchPoints maniaPoints' }],
        });
        let rank = 0;
        const modes = [];
        if (!p || party_1.PartyService.isError(p)) {
            return helpers_1.defaultErrorMessage;
        }
        p.members.forEach(user => {
            rank += user.rank;
            if (!modes.includes(user.mainMode)) {
                modes.push(user.mainMode);
            }
        });
        p.rank = Math.round(rank / p.members.length);
        p.modes = modes;
        yield party_1.PartyService.saveOrFail(p);
        return { success: 'ok' };
    });
}
function addTaskChecks(userId, b, invite, isNewTask) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!b) {
            return { error: 'This map no longer exists!' };
        }
        if (b.tasks.length > 20 && invite.taskName) {
            return { error: 'This mapset has too many difficulties!' };
        }
        if (invite.taskName == task_2.TaskName.Storyboard) {
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
        if (b.quest && invite.taskName != task_2.TaskName.Storyboard) {
            const q = yield quest_1.QuestService.queryById(b.quest, { defaultPopulate: true });
            let valid = false;
            if (!q || quest_1.QuestService.isError(q)) {
                return helpers_1.defaultErrorMessage;
            }
            q.currentParty.members.forEach(member => {
                if (member.id == userId) {
                    valid = true;
                }
            });
            if (!valid) {
                return { error: `This mapset is part of a quest, so only members of the quest's current party can add difficulties!` };
            }
            if (!q.modes.includes(invite.taskMode)) {
                return { error: `The selected quest doesn't support beatmaps of this mode!` };
            }
        }
        const isAlreadyBn = yield beatmap_1.BeatmapService.queryOne({
            query: { _id: b._id, bns: userId },
        });
        if (isAlreadyBn) {
            return { error: 'Cannot create a difficulty while in BN list!' };
        }
        if (!isNewTask) {
            let t = yield task_1.TaskService.queryById(invite.modified);
            if (!t) {
                return { error: `Task doesn't exist anymore!` };
            }
            t = yield task_1.TaskService.queryOne({ query: { _id: invite.modified, mappers: userId } });
            if (t && !task_1.TaskService.isError(t)) {
                yield invite_1.InviteService.update(invite.map._id, { visible: false });
                return { error: `You're already a mapper on this task!` };
            }
        }
        return { success: 'ok' };
    });
}
notificationsRouter.get('/', (req, res) => {
    var _a, _b;
    res.render('notifications', {
        title: 'Notifications/Invites',
        script: 'notifications.js',
        isNotifications: true,
        loggedInAs: (_a = req.session) === null || _a === void 0 ? void 0 : _a.osuId,
        userMongoId: (_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});
notificationsRouter.get('/relevantInfo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const [notif, inv] = yield Promise.all([
        notification_1.NotificationService.queryAll({
            query: { visible: true, recipient: (_a = req.session) === null || _a === void 0 ? void 0 : _a.mongoId },
            defaultPopulate: true,
        }),
        invite_1.InviteService.queryAll({
            query: { visible: true, recipient: (_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId },
            defaultPopulate: true,
        }),
    ]);
    res.json({ notifications: notif, invites: inv });
}));
notificationsRouter.post('/hideNotification/:id', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield notification_1.NotificationService.update(req.params.id, { visible: false });
    const n = yield notification_1.NotificationService.queryById(req.params.id, { defaultPopulate: true });
    res.json(n);
}));
notificationsRouter.post('/hideAll/', middlewares_1.isNotSpectator, helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const notifs = yield notification_1.NotificationService.queryAllOrFail({
        query: { recipient: (_c = req.session) === null || _c === void 0 ? void 0 : _c.mongoId, visible: true },
    });
    notifs.forEach(n => {
        n.visible = false;
        notification_1.NotificationService.saveOrFail(n);
    });
    res.json({});
})));
notificationsRouter.post('/hideInvite/:id', middlewares_1.isNotSpectator, helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let inv = yield invite_1.InviteService.update(req.params.id, { visible: false });
    inv = yield invite_1.InviteService.queryByIdOrFail(req.params.id, { defaultPopulate: true });
    res.json(inv);
    if (inv.map) {
        notification_1.NotificationService.create(inv._id, `rejected your invite to ${inv.actionType} on the mapset`, inv.sender, inv.recipient, inv.map);
    }
    else {
        notification_1.NotificationService.createPartyNotification(inv._id, `rejected your invite to join the party`, inv.sender, inv.recipient, inv.party, inv.quest);
    }
})));
notificationsRouter.post('/hideAcceptedInvite/:id', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(yield invite_1.InviteService.update(req.params.id, { visible: false }));
}));
notificationsRouter.post('/declineAll/', middlewares_1.isNotSpectator, helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const invs = yield invite_1.InviteService.queryAllOrFail({ query: { recipient: req.session.mongoId, visible: true } });
    invs.forEach(inv => {
        inv.visible = false;
        invite_1.InviteService.saveOrFail(inv);
    });
    res.json({});
})));
notificationsRouter.post('/acceptCollab/:id', middlewares_1.isNotSpectator, helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    let invite = yield invite_1.InviteService.queryByIdOrFail(req.params.id, { defaultPopulate: true });
    if (!invite.modified) {
        return res.json({ error: `Mapset no longer exists!` });
    }
    const b = yield beatmap_1.BeatmapService.queryOneOrFail({
        query: { tasks: invite.modified._id },
        populate: beatmapPopulate,
    });
    const valid = yield addTaskChecks((_d = req.session) === null || _d === void 0 ? void 0 : _d.mongoId, b, invite, false);
    if (valid.error) {
        return res.json(valid);
    }
    if (b.status == 'Ranked') {
        return res.json({ error: 'Mapset ranked' });
    }
    invite.visible = false;
    yield invite_1.InviteService.saveOrFail(invite);
    invite = yield invite_1.InviteService.queryByIdOrFail(req.params.id, { defaultPopulate: true });
    res.json(invite);
    const t = yield task_1.TaskService.updateOrFail(invite.modified._id, { $push: { mappers: req.session.mongoId } });
    log_1.LogService.create(req.session.mongoId, `added as collab mapper to "${t.name}" on "${b.song.artist} - ${b.song.title}"`, log_2.LogCategory.Beatmap);
    notification_1.NotificationService.create(t._id, `accepted your invite to collaborate on the "${t.name}" difficulty on your mapset`, invite.sender, invite.recipient, b._id);
})));
notificationsRouter.post('/acceptDiff/:id', middlewares_1.isNotSpectator, helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let invite = yield invite_1.InviteService.queryByIdOrFail(req.params.id, { defaultPopulate: true });
    if (!invite.map) {
        return res.json({ error: `Mapset no longer exists!` });
    }
    const b = yield beatmap_1.BeatmapService.queryByIdOrFail(invite.map._id, { populate: beatmapPopulate });
    const valid = yield addTaskChecks(req.session.mongoId, b, invite, true);
    if (valid.error) {
        return res.json(valid);
    }
    if (b.status != 'WIP') {
        return res.json({ error: `Mapset already marked as ${b.status.toLowerCase()}` });
    }
    invite.visible = false;
    yield invite_1.InviteService.saveOrFail(invite);
    invite = yield invite_1.InviteService.queryByIdOrFail(req.params.id, { defaultPopulate: true });
    res.json(invite);
    if (invite.taskName == task_2.TaskName.Storyboard) {
        invite.taskMode = task_2.TaskMode.SB;
    }
    const t = yield task_1.TaskService.create({ name: invite.taskName, mappers: req.session.mongoId, mode: invite.taskMode });
    if (task_1.TaskService.isError(t)) {
        return;
    }
    yield beatmap_1.BeatmapService.update(invite.map._id, { $push: { tasks: t._id } });
    const updateBeatmap = yield beatmap_1.BeatmapService.queryById(invite.map._id, { populate: beatmapPopulate });
    if (updateBeatmap && !beatmap_1.BeatmapService.isError(updateBeatmap)) {
        log_1.LogService.create(req.session.mongoId, `added "${invite.taskName}" difficulty to "${b.song.artist} - ${b.song.title}"`, log_2.LogCategory.Beatmap);
        notification_1.NotificationService.create(updateBeatmap._id, `accepted the invite to create a difficulty on your mapset`, invite.sender, invite.recipient, updateBeatmap._id);
    }
})));
notificationsRouter.post('/acceptJoin/:id', middlewares_1.isNotSpectator, helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let invite = yield invite_1.InviteService.queryByIdOrFail(req.params.id, { defaultPopulate: true });
    const q = yield quest_1.QuestService.queryByIdOrFail(invite.quest._id, { defaultPopulate: true });
    const currentParties = yield party_1.PartyService.queryAll({ query: { members: req.session.mongoId } });
    let duplicate = false;
    if (!invite.party) {
        return res.json({ error: 'That party no longer exists!' });
    }
    if (!party_1.PartyService.isError(currentParties)) {
        duplicate = q.parties.some(questParty => {
            return currentParties.some(userParty => questParty.id == userParty.id);
        });
    }
    if (duplicate) {
        return res.json({ error: 'You are already in a party for this quest!' });
    }
    if (res.locals.userRequest.availablePoints < q.price) {
        return res.json({ error: 'You do not have enough points available to accept this quest! ' });
    }
    const p = yield party_1.PartyService.queryByIdOrFail(invite.party._id);
    if (q.status == 'wip') {
        if (q.currentParty.members.length >= q.maxParty) {
            return res.json({ error: 'Party has too many members!' });
        }
        if (q.overLimit) {
            return res.json({ error: `You cannot join a party that's been running a quest for over a week!` });
        }
    }
    invite.visible = false;
    yield invite_1.InviteService.saveOrFail(invite);
    invite = yield invite_1.InviteService.queryByIdOrFail(req.params.id, { defaultPopulate: true });
    res.json(invite);
    yield party_1.PartyService.update(invite.party._id, { $push: { members: req.session.mongoId } });
    yield updatePartyInfo(p._id);
    if (q.status == quest_2.QuestStatus.WIP) {
        const spentPoints = res.locals.userRequest.spentPoints + q.price;
        yield user_1.UserService.update(req.session.mongoId, { spentPoints });
    }
    log_1.LogService.create(req.session.mongoId, `joined a party for quest ${q.name}`, log_2.LogCategory.Party);
    notification_1.NotificationService.createPartyNotification(p._id, `accepted the invite to join your party`, invite.sender, invite.recipient, p._id, q._id);
})));
exports.default = notificationsRouter;
