import express from 'express';
import { isLoggedIn, isUser, isNotSpectator } from '../helpers/middlewares';
import { updateUserPoints } from '../helpers/points';
import { PartyModel } from '../models/party';
import { defaultErrorMessage, BasicResponse } from '../helpers/helpers';
import { BeatmapModel, Beatmap } from '../models/beatmap/beatmap';
import { BeatmapMode } from '../interfaces/beatmap/beatmap';
import { Quest, QuestModel } from '../models/quest';
import { TaskModel } from '../models/beatmap/task';
import { TaskName, TaskMode } from '../interfaces/beatmap/task';
import { Invite, InviteModel } from '../models/invite';
import { NotificationModel } from '../models/notification';
import { SpentPointsModel } from '../models/spentPoints';
import { SpentPointsCategory } from '../interfaces/spentPoints';
import { LogModel } from '../models/log';
import { LogCategory } from '../interfaces/log';
import { QuestStatus } from '../interfaces/quest';
import { User } from '../interfaces/user';

const notificationsRouter = express.Router();

notificationsRouter.use(isLoggedIn);
notificationsRouter.use(isUser);

//populations
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

//updating party rank and modes when accepting invite
async function updatePartyInfo(id: string): Promise<object> {
    const p = await PartyModel
        .findById(id)
        .populate({ path: 'members', select: 'rank osuPoints taikoPoints catchPoints maniaPoints' });

    let rank = 0;
    const modes: Omit<BeatmapMode, BeatmapMode.Hybrid>[] = [];

    if (!p) {
        return defaultErrorMessage;
    }

    p.members.forEach(user => {
        rank += user.rank;

        if (!modes.includes(user.mainMode)) {
            modes.push(user.mainMode);
        }
    });

    p.rank = Math.round(rank / p.members.length);
    p.modes = modes;
    await p.save();

    return { success: 'ok' };
}

//valid task check (doesn't have lock check, has special task checks)
async function addTaskChecks(userId: User['_id'], b: Beatmap, invite: Invite, isNewTask: boolean): Promise<BasicResponse> {
    if (!b) {
        return { error: 'This map no longer exists!' };
    }

    if (b.tasks.length > 20 && invite.taskName) {
        return { error: 'This mapset has too many difficulties!' };
    }

    if (invite.taskName == TaskName.Storyboard) {
        let sb = false;
        b.tasks.forEach(task => {
            if (task.name == TaskName.Storyboard) {
                sb = true;
            }
        });

        if (sb) {
            return { error: 'There can only be one storyboard on a mapset!' };
        }
    }

    if (b.quest && invite.taskName != TaskName.Storyboard) {
        const q = await QuestModel.findById(b.quest as Quest['_id']);
        let valid = false;

        if (!q) {
            return defaultErrorMessage;
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

    const isAlreadyBn = await BeatmapModel.findOne({
        _id: b._id,
        bns: userId,
    });

    if (isAlreadyBn) {
        return { error: 'Cannot create a difficulty while in BN list!' };
    }

    if (!isNewTask) {
        let t = await TaskModel.findById(invite.modified);

        if (!t) {
            return { error: `Task doesn't exist anymore!` };
        }

        t = await TaskModel.findOne({
            _id: invite.modified,
            mappers: userId,
        });

        if (t) {
            await InviteModel.findByIdAndUpdate(invite.map._id, { visible: false });

            return { error: `You're already a mapper on this task!` };
        }
    }

    return { success: 'ok' };
}

/* GET notifications/invites */
notificationsRouter.get('/', (req, res) => {
    res.render('notifications', {
        title: 'Notifications/Invites',
        script: 'notifications.js',
        isNotifications: true,
        loggedInAs: req.session?.osuId,
        userMongoId: req.session?.mongoId,
        pointsInfo: res.locals.userRequest.pointsInfo,
    });
});

/* GET notifications/invites listing. */
notificationsRouter.get('/relevantInfo', async (req, res) => {
    const [notif, inv] = await Promise.all([
        NotificationModel
            .find({
                visible: true,
                recipient: req.session?.mongoId,
            })
            .populate(notificationPopulate),

        InviteModel
            .find({
                visible: true,
                recipient: req.session?.mongoId,
            })
            .populate(invitePopulate),
    ]);

    res.json({ notifications: notif, invites: inv });
});

/* POST hide notification */
notificationsRouter.post('/hideNotification/:id', isNotSpectator, async (req, res) => {
    await NotificationModel.findByIdAndUpdate(req.params.id, { visible: false });
    const n = await NotificationModel.findById(req.params.id);
    res.json(n);
});

/* POST hide notification */
notificationsRouter.post('/hideAll/', isNotSpectator, async (req, res) => {
    const notifs = await NotificationModel
        .find({
            recipient: req.session?.mongoId,
            visible: true,
        })
        .orFail();

    notifs.forEach(n => {
        n.visible = false;
        n.save();
    });

    res.json({});
});

/* POST hide notification */
notificationsRouter.post('/hideInvite/:id', isNotSpectator, async (req, res) => {
    let inv = await InviteModel.findByIdAndUpdate(req.params.id, { visible: false });
    inv = await InviteModel
        .findById(req.params.id)
        .populate(invitePopulate)
        .orFail();

    res.json(inv);

    if (inv.map) {
        NotificationModel.generate(
            inv._id,
            `rejected your invite to ${inv.actionType} on the mapset`,
            inv.sender,
            inv.recipient,
            inv.map
        );
    } else {
        NotificationModel.generatePartyNotification(
            inv._id,
            `rejected your invite to join the party`,
            inv.sender,
            inv.recipient,
            inv.party,
            inv.quest
        );
    }
});

/* POST hide notification */
notificationsRouter.post('/hideAcceptedInvite/:id', isNotSpectator, async (req, res) => {
    res.json(await InviteModel.findByIdAndUpdate(req.params.id, { visible: false }));
});

/* POST hide notification */
notificationsRouter.post('/declineAll/', isNotSpectator, async (req, res) => {
    const invs = await InviteModel.find({
        recipient: req.session?.mongoId,
        visible: true,
    });

    invs.forEach(inv => {
        inv.visible = false;
        inv.save();
    });

    res.json({});
});

/* POST accept collab */
notificationsRouter.post('/acceptCollab/:id', isNotSpectator, async (req, res) => {
    let invite = await InviteModel
        .findById(req.params.id)
        .populate(invitePopulate)
        .orFail();

    if (!invite.modified) {
        return res.json({ error: `Mapset no longer exists!` });
    }

    // is invite.modified id or object?

    const b = await BeatmapModel
        .findOne({ tasks: (invite.modified)._id })
        .populate(beatmapPopulate)
        .orFail();

    const valid = await addTaskChecks(req.session?.mongoId, b, invite, false);

    if (valid.error) {
        return res.json(valid);
    }

    if (b.status == 'Ranked') {
        return res.json({ error: 'Mapset ranked' });
    }

    invite.visible = false;
    await invite.save();

    invite = await InviteModel
        .findById(req.params.id)
        .populate(invitePopulate)
        .orFail();

    res.json(invite);

    const t = await TaskModel.findByIdAndUpdate(invite.modified._id, { $push: { mappers: req.session?.mongoId } });

    if (t) {
        LogModel.generate(
            req.session?.mongoId,
            `added as collab mapper to "${t.name}" on "${b.song.artist} - ${b.song.title}"`,
            LogCategory.Beatmap
        );
        NotificationModel.generate(
            t._id,
            `accepted your invite to collaborate on the "${t.name}" difficulty on your mapset`,
            invite.sender,
            invite.recipient,
            b._id
        );
    }
});

/* POST accept difficulty */
notificationsRouter.post('/acceptDiff/:id', isNotSpectator, async (req, res) => {
    let invite = await InviteModel
        .findById(req.params.id)
        .populate(invitePopulate)
        .orFail();

    if (!invite.map) {
        return res.json({ error: `Mapset no longer exists!` });
    }

    const b = await BeatmapModel
        .findById(invite.map._id)
        .populate(beatmapPopulate)
        .orFail();

    const valid = await addTaskChecks(req.session?.mongoId, b, invite, true);

    if (valid.error) {
        return res.json(valid);
    }

    if (b.status != 'WIP') {
        return res.json({ error: `Mapset already marked as ${b.status.toLowerCase()}` });
    }

    invite.visible = false;
    await invite.save();

    invite = await InviteModel
        .findById(req.params.id)
        .populate(invitePopulate)
        .orFail();

    res.json(invite);

    if (invite.taskName == TaskName.Storyboard) {
        invite.taskMode = TaskMode.SB;
    }

    const t = new TaskModel();
    t.name = invite.taskName;
    t.mappers = req.session?.mongoId;
    t.mode = invite.taskMode;
    await t.save();

    await BeatmapModel.findByIdAndUpdate(invite.map._id, { $push: { tasks: t._id } });
    const updateBeatmap = await BeatmapModel
        .findById(invite.map._id)
        .populate(beatmapPopulate);

    if (updateBeatmap) {
        LogModel.generate(
            req.session?.mongoId,
            `added "${invite.taskName}" difficulty to "${b.song.artist} - ${b.song.title}"`,
            LogCategory.Beatmap
        );
        NotificationModel.generate(
            updateBeatmap._id,
            `accepted the invite to create a difficulty on your mapset`,
            invite.sender,
            invite.recipient,
            updateBeatmap._id
        );
    }
});

/* POST accept join party */
notificationsRouter.post('/acceptJoin/:id', isNotSpectator, async (req, res) => {
    let invite = await InviteModel
        .findById(req.params.id)
        .populate(invitePopulate)
        .orFail();

    const q = await QuestModel
        .findById(invite.quest._id)
        .defaultPopulate()
        .orFail();

    const currentParties = await PartyModel.find({ members: req.session?.mongoId });
    let duplicate = false;

    if (!invite.party) {
        return res.json({ error: 'That party no longer exists!' });
    }

    duplicate = q.parties.some(questParty => {
        return currentParties.some(userParty => questParty.id == userParty.id);
    });

    if (duplicate) {
        return res.json({ error: 'You are already in a party for this quest!' });
    }

    if (res.locals.userRequest.availablePoints < q.price) {
        return res.json({ error: 'You do not have enough points available to accept this quest! ' });
    }

    const p = await PartyModel
        .findById(invite.party._id)
        .defaultPopulate()
        .orFail();

    if (q.status == 'wip' && q.currentParty.members.length >= q.maxParty) {
        return res.json({ error: 'Party has too many members!' });
    }

    invite.visible = false;
    await invite.save();

    invite = await InviteModel
        .findById(req.params.id)
        .populate(invitePopulate)
        .orFail();

    res.json(invite);

    await PartyModel.findByIdAndUpdate(invite.party._id, { $push: { members: req.session?.mongoId } });
    await updatePartyInfo(p._id);

    if (q.status == QuestStatus.WIP) {
        SpentPointsModel.generate(
            SpentPointsCategory.AcceptQuest,
            req.session?.mongoId,
            q._id
        );
        updateUserPoints(req.session?.mongoId);
    }

    LogModel.generate(req.session?.mongoId, `joined a party for quest ${q.name}`, LogCategory.Party);

    NotificationModel.generatePartyNotification(
        p._id,
        `accepted the invite to join your party`,
        invite.sender,
        invite.recipient,
        p._id,
        q._id
    );
});

export default notificationsRouter;
