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
const points_1 = require("../helpers/points");
const party_1 = require("../models/party");
const helpers_1 = require("../helpers/helpers");
const beatmap_1 = require("../models/beatmap/beatmap");
const quest_1 = require("../models/quest");
const task_1 = require("../models/beatmap/task");
const task_2 = require("../interfaces/beatmap/task");
const invite_1 = require("../models/invite");
const notification_1 = require("../models/notification");
const spentPoints_1 = require("../models/spentPoints");
const spentPoints_2 = require("../interfaces/spentPoints");
const log_1 = require("../models/log");
const log_2 = require("../interfaces/log");
const quest_2 = require("../interfaces/quest");
const notificationsRouter = express_1.default.Router();
notificationsRouter.use(middlewares_1.isLoggedIn);
notificationsRouter.use(middlewares_1.isUser);
const beatmapPopulate = [{ path: 'song', select: 'artist title' }];
const notificationPopulate = [
    { path: 'sender', select: 'username osuId' },
    {
        path: 'map',
        populate: [
            { path: 'song' },
            { path: 'host' },
            {
                path: 'tasks', populate: { path: 'mappers' },
            },
        ],
    },
    { path: 'party', populate: { path: 'members leader' } },
    { path: 'quest', select: 'name' },
];
const invitePopulate = [
    { path: 'sender', select: 'username osuId' },
    {
        path: 'map',
        populate: [
            { path: 'song' },
            { path: 'host' },
            {
                path: 'tasks', populate: { path: 'mappers' },
            },
        ],
    },
    { path: 'party', populate: { path: 'members leader' } },
    {
        path: 'quest', populate: {
            path: 'currentParty', populate: { path: 'members' },
        },
    },
];
function updatePartyInfo(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const p = yield party_1.PartyModel
            .findById(id)
            .populate({ path: 'members', select: 'rank' });
        let rank = 0;
        if (!p) {
            return helpers_1.defaultErrorMessage;
        }
        const uniqueMembers = [];
        for (const member of p.members) {
            if (!uniqueMembers.includes(member))
                uniqueMembers.push(member);
        }
        p.members = uniqueMembers;
        p.members.forEach(user => {
            rank += user.rank;
        });
        p.rank = Math.round(rank / p.members.length);
        p.save();
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
            const q = yield quest_1.QuestModel
                .findById(b.quest)
                .populate({ path: 'currentParty', populate: { path: 'members' } });
            let valid = false;
            if (!q) {
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
        const isAlreadyBn = yield beatmap_1.BeatmapModel.findOne({
            _id: b._id,
            bns: userId,
        });
        if (isAlreadyBn) {
            return { error: 'Cannot create a difficulty while in BN list!' };
        }
        if (!isNewTask) {
            let t = yield task_1.TaskModel.findById(invite.modified);
            if (!t) {
                return { error: `Task doesn't exist anymore!` };
            }
            t = yield task_1.TaskModel.findOne({
                _id: invite.modified,
                mappers: userId,
            });
            if (t) {
                yield invite_1.InviteModel.findByIdAndUpdate(invite.map._id, { visible: false });
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
        pointsInfo: res.locals.userRequest.pointsInfo,
    });
});
notificationsRouter.get('/relevantInfo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const [notif, inv] = yield Promise.all([
        notification_1.NotificationModel
            .find({
            visible: true,
            recipient: (_a = req.session) === null || _a === void 0 ? void 0 : _a.mongoId,
        })
            .populate(notificationPopulate),
        invite_1.InviteModel
            .find({
            visible: true,
            recipient: (_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId,
        })
            .populate(invitePopulate),
    ]);
    res.json({ notifications: notif, invites: inv });
}));
notificationsRouter.post('/hideNotification/:id', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield notification_1.NotificationModel.findByIdAndUpdate(req.params.id, { visible: false });
    const n = yield notification_1.NotificationModel.findById(req.params.id);
    res.json(n);
}));
notificationsRouter.post('/hideAll/', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const notifs = yield notification_1.NotificationModel
        .find({
        recipient: (_c = req.session) === null || _c === void 0 ? void 0 : _c.mongoId,
        visible: true,
    })
        .orFail();
    notifs.forEach(n => {
        n.visible = false;
        n.save();
    });
    res.json({});
}));
notificationsRouter.post('/hideInvite/:id', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let inv = yield invite_1.InviteModel.findByIdAndUpdate(req.params.id, { visible: false });
    inv = yield invite_1.InviteModel
        .findById(req.params.id)
        .populate(invitePopulate)
        .orFail();
    res.json(inv);
    if (inv.map) {
        notification_1.NotificationModel.generate(inv._id, `rejected your invite to ${inv.actionType} on the mapset`, inv.sender, inv.recipient, inv.map);
    }
    else {
        notification_1.NotificationModel.generatePartyNotification(inv._id, `rejected your invite to join the party`, inv.sender, inv.recipient, inv.party, inv.quest);
    }
}));
notificationsRouter.post('/hideAcceptedInvite/:id', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(yield invite_1.InviteModel.findByIdAndUpdate(req.params.id, { visible: false }));
}));
notificationsRouter.post('/declineAll/', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const invs = yield invite_1.InviteModel.find({
        recipient: (_d = req.session) === null || _d === void 0 ? void 0 : _d.mongoId,
        visible: true,
    });
    invs.forEach(inv => {
        inv.visible = false;
        inv.save();
    });
    res.json({});
}));
notificationsRouter.post('/acceptCollab/:id', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f, _g;
    let invite = yield invite_1.InviteModel
        .findById(req.params.id)
        .populate(invitePopulate)
        .orFail();
    if (!invite.modified) {
        return res.json({ error: `Mapset no longer exists!` });
    }
    const b = yield beatmap_1.BeatmapModel
        .findOne({ tasks: (invite.modified)._id })
        .populate(beatmapPopulate)
        .orFail();
    const valid = yield addTaskChecks((_e = req.session) === null || _e === void 0 ? void 0 : _e.mongoId, b, invite, false);
    if (valid.error) {
        return res.json(valid);
    }
    if (b.status == 'Ranked') {
        return res.json({ error: 'Mapset ranked' });
    }
    invite.visible = false;
    yield invite.save();
    invite = yield invite_1.InviteModel
        .findById(req.params.id)
        .populate(invitePopulate)
        .orFail();
    res.json(invite);
    const t = yield task_1.TaskModel.findByIdAndUpdate(invite.modified._id, { $push: { mappers: (_f = req.session) === null || _f === void 0 ? void 0 : _f.mongoId } });
    if (t) {
        log_1.LogModel.generate((_g = req.session) === null || _g === void 0 ? void 0 : _g.mongoId, `added as collab mapper to "${t.name}" on "${b.song.artist} - ${b.song.title}"`, log_2.LogCategory.Beatmap);
        notification_1.NotificationModel.generate(t._id, `accepted your invite to collaborate on the "${t.name}" difficulty on your mapset`, invite.sender, invite.recipient, b._id);
    }
}));
notificationsRouter.post('/acceptDiff/:id', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _h, _j, _k;
    let invite = yield invite_1.InviteModel
        .findById(req.params.id)
        .populate(invitePopulate)
        .orFail();
    if (!invite.map) {
        return res.json({ error: `Mapset no longer exists!` });
    }
    const b = yield beatmap_1.BeatmapModel
        .findById(invite.map._id)
        .populate(beatmapPopulate)
        .orFail();
    const valid = yield addTaskChecks((_h = req.session) === null || _h === void 0 ? void 0 : _h.mongoId, b, invite, true);
    if (valid.error) {
        return res.json(valid);
    }
    if (b.status != 'WIP') {
        return res.json({ error: `Mapset already marked as ${b.status.toLowerCase()}` });
    }
    invite.visible = false;
    yield invite.save();
    invite = yield invite_1.InviteModel
        .findById(req.params.id)
        .populate(invitePopulate)
        .orFail();
    res.json(invite);
    if (invite.taskName == task_2.TaskName.Storyboard) {
        invite.taskMode = task_2.TaskMode.SB;
    }
    const t = new task_1.TaskModel();
    t.name = invite.taskName;
    t.mappers = (_j = req.session) === null || _j === void 0 ? void 0 : _j.mongoId;
    t.mode = invite.taskMode;
    yield t.save();
    yield beatmap_1.BeatmapModel.findByIdAndUpdate(invite.map._id, { $push: { tasks: t._id } });
    const updateBeatmap = yield beatmap_1.BeatmapModel
        .findById(invite.map._id)
        .populate(beatmapPopulate);
    if (updateBeatmap) {
        log_1.LogModel.generate((_k = req.session) === null || _k === void 0 ? void 0 : _k.mongoId, `added "${invite.taskName}" difficulty to "${b.song.artist} - ${b.song.title}"`, log_2.LogCategory.Beatmap);
        notification_1.NotificationModel.generate(updateBeatmap._id, `accepted the invite to create a difficulty on your mapset`, invite.sender, invite.recipient, updateBeatmap._id);
    }
}));
notificationsRouter.post('/acceptJoin/:id', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _l, _m, _o, _p, _q;
    let invite = yield invite_1.InviteModel
        .findById(req.params.id)
        .populate(invitePopulate)
        .orFail();
    const q = yield quest_1.QuestModel
        .findById(invite.quest._id)
        .defaultPopulate()
        .orFail();
    if (!invite.party) {
        return res.json({ error: 'That party no longer exists!' });
    }
    const currentParties = yield party_1.PartyModel.find({ members: (_l = req.session) === null || _l === void 0 ? void 0 : _l.mongoId });
    let duplicate = false;
    duplicate = q.parties.some(questParty => {
        return currentParties.some(userParty => questParty.id == userParty.id);
    });
    if (duplicate) {
        return res.json({ error: 'You are already in a party for this quest!' });
    }
    if (res.locals.userRequest.availablePoints < q.price) {
        return res.json({ error: 'You do not have enough points available to accept this quest! ' });
    }
    const p = yield party_1.PartyModel
        .findById(invite.party._id)
        .defaultPopulate()
        .orFail();
    if (q.status == 'wip' && q.currentParty.members.length >= q.maxParty) {
        return res.json({ error: 'Party has too many members!' });
    }
    invite.visible = false;
    yield invite.save();
    invite = yield invite_1.InviteModel
        .findById(req.params.id)
        .populate(invitePopulate)
        .orFail();
    res.json(invite);
    yield party_1.PartyModel.findByIdAndUpdate(invite.party._id, { $push: { members: (_m = req.session) === null || _m === void 0 ? void 0 : _m.mongoId } });
    yield updatePartyInfo(p._id);
    if (q.status == quest_2.QuestStatus.WIP) {
        spentPoints_1.SpentPointsModel.generate(spentPoints_2.SpentPointsCategory.AcceptQuest, (_o = req.session) === null || _o === void 0 ? void 0 : _o.mongoId, q._id);
        points_1.updateUserPoints((_p = req.session) === null || _p === void 0 ? void 0 : _p.mongoId);
    }
    log_1.LogModel.generate((_q = req.session) === null || _q === void 0 ? void 0 : _q.mongoId, `joined a party for quest ${q.name}`, log_2.LogCategory.Party);
    notification_1.NotificationModel.generatePartyNotification(p._id, `accepted the invite to join your party`, invite.sender, invite.recipient, p._id, q._id);
}));
exports.default = notificationsRouter;
