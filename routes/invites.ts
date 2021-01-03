import express from 'express';
import { isLoggedIn, isUser, isNotSpectator } from '../helpers/middlewares';
import { updateUserPoints } from '../helpers/points';
import { PartyModel } from '../models/party';
import { BeatmapModel } from '../models/beatmap/beatmap';
import { TaskModel } from '../models/beatmap/task';
import { TaskName, TaskMode } from '../interfaces/beatmap/task';
import { BeatmapStatus } from '../interfaces/beatmap/beatmap';
import { InviteModel } from '../models/invite';
import { NotificationModel } from '../models/notification';
import { SpentPointsModel } from '../models/spentPoints';
import { SpentPointsCategory } from '../interfaces/spentPoints';
import { LogModel } from '../models/log';
import { LogCategory } from '../interfaces/log';
import { User } from '../interfaces/user';
import { ActionType } from '../interfaces/invite';
import { QuestStatus } from '../interfaces/quest';

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

const invitesRouter = express.Router();

invitesRouter.use(isLoggedIn);
invitesRouter.use(isUser);
invitesRouter.use(isNotSpectator);

/* POST hide invite and create notifications because of it */
invitesRouter.post('/:id/hide', async (req, res) => {
    const invite = await InviteModel
        .findById(req.params.id)
        .populate(invitePopulate)
        .orFail();

    invite.visible = false;
    await invite.save();

    res.json(invite);

    if (invite.map) {
        NotificationModel.generate(
            invite._id,
            `rejected your invite to ${invite.actionType} on the mapset`,
            invite.sender,
            invite.recipient,
            invite.map
        );
    } else {
        NotificationModel.generatePartyNotification(
            invite._id,
            `rejected your invite to join the party`,
            invite.sender,
            invite.recipient,
            invite.party,
            invite.quest
        );
    }
});

/* POST hide all pending notifications */
invitesRouter.post('/declineAll/', async (req, res) => {
    const invites = await InviteModel
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
    const user: User = res.locals.userRequest;
    const invite = await InviteModel
        .findById(req.params.id)
        .populate(invitePopulate)
        .orFail();

    if (invite.actionType === ActionType.Collab || invite.actionType === ActionType.Create) {
        let logMessage = '';
        let notificationMessage = '';
        let notificationTargetId: any;
        const beatmap = await BeatmapModel
            .findOne(invite.map._id)
            .defaultPopulate()
            .orFail();

        await beatmap.checkTaskAvailability(user, invite.taskName, invite.taskMode, invite.actionType, invite.modified.id);

        if (invite.actionType === ActionType.Collab) {
            const task = await TaskModel.findById(invite.modified._id).orFail();
            task.mappers.push(user);
            await task.save();

            logMessage = `added as collab mapper to "${task.name}" on "${beatmap.song.artist} - ${beatmap.song.title}"`;
            notificationMessage = `accepted your invite to collaborate on the "${task.name}" difficulty on your mapset`;
            notificationTargetId = task._id;
        } else if (invite.actionType === ActionType.Create) {
            // TODO this is kinda ? to have here, should be during the invite creation at least (if it's not done already ?)
            if (invite.taskName == TaskName.Storyboard) {
                invite.taskMode = TaskMode.SB;
            }

            const task = new TaskModel();
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

        if (beatmap.status !== BeatmapStatus.Secret) {
            LogModel.generate(
                user.id,
                logMessage,
                LogCategory.Beatmap
            );
            NotificationModel.generate(
                notificationTargetId,
                notificationMessage,
                invite.sender,
                invite.recipient,
                beatmap._id
            );
        }
    } else if (invite.actionType === ActionType.Join) {
        const party = await PartyModel.defaultFindByIdOrFail(invite.modified._id);

        if (party.quest.status === QuestStatus.Done) {
            throw new Error(`Party's quest already finished`);
        }

        await party.addUser(user);

        if (party.quest.status == QuestStatus.WIP) {
            await SpentPointsModel.generate(
                SpentPointsCategory.AcceptQuest,
                user.id,
                party.quest._id
            );
            await updateUserPoints(user.id);
        }

        LogModel.generate(
            user.id,
            `joined a party for quest ${party.quest.name}`,
            LogCategory.Party
        );
        NotificationModel.generatePartyNotification(
            party._id,
            `accepted the invite to join your party`,
            invite.sender,
            invite.recipient,
            party._id,
            party.quest._id
        );
    }

    invite.visible = false;
    await invite.save();

    res.json(invite);
});


export default invitesRouter;
