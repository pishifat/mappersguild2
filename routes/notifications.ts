import express from 'express';
import { isLoggedIn, isUser, isNotSpectator } from '../helpers/middlewares';
import { PartyService } from '../models/party';
import { defaultErrorMessage, canFail, BasicResponse } from '../helpers/helpers';
import { BeatmapService, Beatmap } from '../models/beatmap/beatmap';
import { BeatmapMode } from '../interfaces/beatmap/beatmap';
import { Quest, QuestService } from '../models/quest';
import { TaskService } from '../models/beatmap/task';
import { TaskName, TaskMode } from '../interfaces/beatmap/task';
import { User } from '../models/user';
import { Invite, InviteService } from '../models/invite';
import { NotificationService } from '../models/notification';
import { LogService } from '../models/log';
import { LogCategory } from '../interfaces/log';

const notificationsRouter = express.Router();

notificationsRouter.use(isLoggedIn);
notificationsRouter.use(isUser);

//populations
const beatmapPopulate = [{ path: 'song', select: 'artist title' }];

//updating party rank and modes when accepting invite
async function updatePartyInfo(id: string): Promise<object> {
    const p = await PartyService.queryById(id, {
        populate: [{ path: 'members', select: 'rank osuPoints taikoPoints catchPoints maniaPoints' }],
    });
    let rank = 0;
    const modes: Omit<BeatmapMode, BeatmapMode.Hybrid>[] = [];

    if (!p || PartyService.isError(p)) {
        return defaultErrorMessage;
    }

    p.members.forEach(user => {
        rank += user.rank;

        if (!modes.includes(user.mainMode)) {
            modes.push(user.mainMode);
        }
    });

    await PartyService.update(id, { rank: Math.round(rank / p.members.length), modes });

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
        const q = await QuestService.queryById(b.quest as Quest['_id'], { defaultPopulate: true });
        let valid = false;

        if (!q || QuestService.isError(q)) {
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

    const isAlreadyBn = await BeatmapService.queryOne({
        query: { _id: b._id, bns: userId },
    });

    if (isAlreadyBn) {
        return { error: 'Cannot create a difficulty while in BN list!' };
    }

    if (!isNewTask) {
        let t = await TaskService.queryById(invite.modified);

        if (!t) {
            return { error: `Task doesn't exist anymore!` };
        }

        t = await TaskService.queryOne({ query: { _id: invite.modified, mappers: userId } });

        if (t && !TaskService.isError(t)) {
            await InviteService.update(invite.map._id, { visible: false });

            return { error: `You're already a mapper on this task!` };
        }
    }

    return { success: 'ok' };
}

/* GET notifications/invites */
notificationsRouter.get('/', (req, res) => {
    res.render('notifications', {
        title: 'Notifications/Invites',
        script: '../javascripts/notifications.js',
        isNotifications: true,
        loggedInAs: req.session?.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});

/* GET notifications/invites listing. */
notificationsRouter.get('/relevantInfo', async (req, res) => {
    const [notif, inv] = await Promise.all([
        NotificationService.queryAll({
            query: { visible: true, recipient: req.session?.mongoId },
            defaultPopulate: true,
        }),
        InviteService.queryAll({
            query: { visible: true, recipient: req.session?.mongoId },
            defaultPopulate: true,
        }),
    ]);

    res.json({ notifications: notif, invites: inv });
});

/* POST hide notification */
notificationsRouter.post('/hideNotification/:id', isNotSpectator, async (req, res) => {
    await NotificationService.update(req.params.id, { visible: false });
    const n = await NotificationService.queryById(req.params.id, { defaultPopulate: true });
    res.json(n);
});

/* POST hide notification */
notificationsRouter.post('/hideAll/', isNotSpectator, canFail(async (req, res) => {
    const notifs = await NotificationService.queryAllOrFail({
        query: { recipient: req.session?.mongoId, visible: true },
    });

    notifs.forEach(n => {
        NotificationService.update(n._id, { visible: false });
    });

    res.json({});
}));

/* POST hide notification */
notificationsRouter.post('/hideInvite/:id', isNotSpectator, canFail(async (req, res) => {
    let inv = await InviteService.update(req.params.id, { visible: false });
    inv = await InviteService.queryByIdOrFail(req.params.id, { defaultPopulate: true });
    res.json(inv);

    if (inv.map) {
        NotificationService.create(
            inv._id,
            `rejected your invite to ${inv.actionType} on the mapset`,
            inv.sender,
            inv.recipient,
            inv.map
        );
    } else {
        NotificationService.createPartyNotification(
            inv._id,
            `rejected your invite to join the party`,
            inv.sender,
            inv.recipient,
            inv.party,
            inv.quest
        );
    }
}));

/* POST hide notification */
notificationsRouter.post('/hideAcceptedInvite/:id', isNotSpectator, async (req, res) => {
    res.json(await InviteService.update(req.params.id, { visible: false }));
});

/* POST hide notification */
notificationsRouter.post('/declineAll/', isNotSpectator, canFail(async (req, res) => {
    const invs = await InviteService.queryAllOrFail({ query: { recipient: req.session.mongoId, visible: true } });

    invs.forEach(inv => {
        InviteService.update(inv._id, { visible: false });
    });

    res.json({});
}));

/* POST accept collab */
notificationsRouter.post('/acceptCollab/:id', isNotSpectator, canFail(async (req, res) => {
    let invite = await InviteService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

    if (!invite.modified) {
        return res.json({ error: `Mapset no longer exists!` });
    }

    // is invite.modified id or object?

    const b = await BeatmapService.queryOneOrFail({
        query: { tasks: (invite.modified as Beatmap)._id },
        populate: beatmapPopulate,
    });

    const valid = await addTaskChecks(req.session?.mongoId, b, invite, false);

    if (valid.error) {
        return res.json(valid);
    }

    if (b.status == 'Ranked') {
        return res.json({ error: 'Mapset ranked' });
    }

    await InviteService.update(req.params.id, { visible: false });
    invite = await InviteService.queryByIdOrFail(req.params.id, { defaultPopulate: true });
    res.json(invite);

    const t = await TaskService.updateOrFail(invite.modified._id, { $push: { mappers: req.session.mongoId } });

    LogService.create(
        req.session.mongoId,
        `added as collab mapper to "${t.name}" on "${b.song.artist} - ${b.song.title}"`,
        LogCategory.Beatmap
    );
    NotificationService.create(
        t._id,
        `accepted your invite to collaborate on the "${t.name}" difficulty on your mapset`,
        invite.sender,
        invite.recipient,
        b._id
    );
}));

/* POST accept difficulty */
notificationsRouter.post('/acceptDiff/:id', isNotSpectator, canFail(async (req, res) => {
    let invite = await InviteService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

    if (!invite.map) {
        return res.json({ error: `Mapset no longer exists!` });
    }

    const b = await BeatmapService.queryByIdOrFail(invite.map._id, { populate: beatmapPopulate });
    const valid = await addTaskChecks(req.session.mongoId, b, invite, true);

    if (valid.error) {
        return res.json(valid);
    }

    if (b.status != 'WIP') {
        return res.json({ error: `Mapset already marked as ${b.status.toLowerCase()}` });
    }

    await InviteService.update(req.params.id, { visible: false });
    invite = await InviteService.queryByIdOrFail(req.params.id, { defaultPopulate: true });
    res.json(invite);

    if (invite.taskName == TaskName.Storyboard) {
        invite.taskMode = TaskMode.SB;
    }

    const t = await TaskService.create({ name: invite.taskName, mappers: req.session.mongoId, mode: invite.taskMode });

    if (TaskService.isError(t)) {
        return;
    }

    await BeatmapService.update(invite.map._id, { $push: { tasks: t._id } });
    const updateBeatmap = await BeatmapService.queryById(invite.map._id, { populate: beatmapPopulate });

    if (updateBeatmap && !BeatmapService.isError(updateBeatmap)) {
        LogService.create(
            req.session.mongoId,
            `added "${invite.taskName}" difficulty to "${b.song.artist} - ${b.song.title}"`,
            LogCategory.Beatmap
        );
        NotificationService.create(
            updateBeatmap._id,
            `accepted the invite to create a difficulty on your mapset`,
            invite.sender,
            invite.recipient,
            updateBeatmap._id
        );
    }
}));

/* POST accept join party */
notificationsRouter.post('/acceptJoin/:id', isNotSpectator, canFail(async (req, res) => {
    let invite = await InviteService.queryByIdOrFail(req.params.id, { defaultPopulate: true });
    const q = await QuestService.queryByIdOrFail(invite.quest._id, { defaultPopulate: true });
    const currentParties = await PartyService.queryAll({ query: { members: req.session.mongoId } });
    let duplicate = false;

    if (!PartyService.isError(currentParties)) {
        q.parties.forEach(questParty => {
            currentParties.forEach(userParty => {
                if (questParty.id == userParty.id) {
                    duplicate = true;
                }
            });
        });
    }

    if (duplicate) {
        return res.json({ error: 'You are already in a party for this quest!' });
    }

    if (!invite.party) {
        return res.json({ error: 'That party no longer exists!' });
    }

    const p = await PartyService.queryByIdOrFail(invite.party._id);

    if (q.status == 'wip') {
        if (q.currentParty.members.length >= q.maxParty) {
            return res.json({ error: 'Party has too many members!' });
        }

        // if timing window > 7 days, can't invite anymore
        const timeWindow = (+new Date() - +q.accepted) / (24*3600*1000);

        if (timeWindow > 7) {
            return res.json({ error: `You cannot join a party that's been running a quest for over a week!` });
        }
    }

    await InviteService.update(req.params.id, { visible: false });
    invite = await InviteService.queryByIdOrFail(req.params.id, { defaultPopulate: true });
    res.json(invite);

    await PartyService.update(invite.party._id, { $push: { members: req.session.mongoId } });
    await updatePartyInfo(p._id);

    LogService.create(req.session.mongoId, `joined a party for quest ${q.name}`, LogCategory.Party);
    NotificationService.createPartyNotification(
        p._id,
        `accepted the invite to join your party`,
        invite.sender,
        invite.recipient,
        p._id,
        q._id
    );
}));

export default notificationsRouter;
