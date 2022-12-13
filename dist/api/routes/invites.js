"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../helpers/middlewares");
const points_1 = require("../helpers/points");
const party_1 = require("../models/party");
const beatmap_1 = require("../models/beatmap/beatmap");
const task_1 = require("../models/beatmap/task");
const task_2 = require("../../interfaces/beatmap/task");
const invite_1 = require("../models/invite");
const notification_1 = require("../models/notification");
const spentPoints_1 = require("../models/spentPoints");
const spentPoints_2 = require("../../interfaces/spentPoints");
const log_1 = require("../models/log");
const log_2 = require("../../interfaces/log");
const invite_2 = require("../../interfaces/invite");
const quest_1 = require("../../interfaces/quest");
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
    { path: 'party', populate: { path: 'members leader quest' } },
    {
        path: 'quest',
        populate: {
            path: 'parties', populate: { path: 'members' },
        },
    },
];
const invitesRouter = express_1.default.Router();
invitesRouter.use(middlewares_1.isLoggedIn);
/* POST hide invite and create notifications because of it */
invitesRouter.post('/:id/hide', async (req, res) => {
    const invite = await invite_1.InviteModel
        .findById(req.params.id)
        .populate(invitePopulate)
        .orFail();
    invite.visible = false;
    await invite.save();
    res.json(invite);
    if (invite.map) {
        notification_1.NotificationModel.generate(invite._id, `rejected your invite to ${invite.actionType} on the mapset`, invite.sender, invite.recipient, invite.map);
    }
    else {
        notification_1.NotificationModel.generatePartyNotification(invite._id, `rejected your invite to join the party`, invite.sender, invite.recipient, invite.party, invite.quest);
    }
});
/* POST hide all pending notifications */
invitesRouter.post('/declineAll/', async (req, res) => {
    const invites = await invite_1.InviteModel
        .find({
        recipient: req.session?.mongoId,
        visible: true,
    })
        .orFail();
    for (const invite of invites) {
        invite.visible = false;
        invite.save();
    }
    res.json({});
});
/* POST accept an invite */
invitesRouter.post('/:id/accept', async (req, res) => {
    const user = res.locals.userRequest;
    const invite = await invite_1.InviteModel
        .findById(req.params.id)
        .populate(invitePopulate)
        .orFail();
    if (invite.actionType === invite_2.ActionType.Collab || invite.actionType === invite_2.ActionType.Create) {
        let logMessage = '';
        let notificationMessage = '';
        let notificationTargetId;
        const beatmap = await beatmap_1.BeatmapModel
            .findOne(invite.map._id)
            .defaultPopulate()
            .orFail();
        await beatmap.checkTaskAvailability(user, invite.taskName, invite.taskMode, invite.actionType, invite.modified.toString());
        if (invite.actionType === invite_2.ActionType.Collab) {
            const task = await task_1.TaskModel.findById(invite.modified._id).orFail();
            task.mappers.push(user);
            await task.save();
            logMessage = `added as collab mapper to "${task.name}" on "${beatmap.song.artist} - ${beatmap.song.title}"`;
            notificationMessage = `accepted your invite to collaborate on the "${task.name}" difficulty on your mapset`;
            notificationTargetId = task._id;
        }
        else if (invite.actionType === invite_2.ActionType.Create) {
            // TODO this is kinda ? to have here, should be during the invite creation at least (if it's not done already ?)
            if (invite.taskName == task_2.TaskName.Storyboard) {
                invite.taskMode = task_2.TaskMode.SB;
            }
            const task = new task_1.TaskModel();
            task.name = invite.taskName;
            task.mappers = [user];
            task.mode = invite.taskMode;
            await task.save();
            beatmap.tasks.push(task);
            await beatmap.save();
            logMessage = `added "${invite.taskName}" difficulty to "${beatmap.song.artist} - ${beatmap.song.title}"`;
            notificationMessage = `accepted the invite to create a difficulty on your mapset`;
            notificationTargetId = beatmap._id;
        }
        log_1.LogModel.generate(user.id, logMessage, log_2.LogCategory.Beatmap);
        notification_1.NotificationModel.generate(notificationTargetId, notificationMessage, invite.sender, invite.recipient, beatmap._id);
    }
    else if (invite.actionType === invite_2.ActionType.Join) {
        const party = await party_1.PartyModel.defaultFindByIdOrFail(invite.modified._id);
        if (party.quest.status === quest_1.QuestStatus.Done) {
            throw new Error(`Party's quest already finished`);
        }
        await party.addUser(user);
        if (party.quest.status == quest_1.QuestStatus.WIP) {
            await spentPoints_1.SpentPointsModel.generate(spentPoints_2.SpentPointsCategory.AcceptQuest, user.id, party.quest._id);
            await points_1.updateUserPoints(user.id);
        }
        log_1.LogModel.generate(user.id, `joined a party for quest ${party.quest.name}`, log_2.LogCategory.Party);
        notification_1.NotificationModel.generatePartyNotification(party._id, `accepted the invite to join your party`, invite.sender, invite.recipient, party._id, party.quest._id);
    }
    invite.visible = false;
    await invite.save();
    res.json(invite);
});
exports.default = invitesRouter;
