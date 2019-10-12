var express = require('express');
var beatmaps = require('../models/beatmap.js');
var parties = require('../models/party.js');
var quests = require('../models/quest.js');
var notifications = require('../models/notification.js');
var invites = require('../models/invite.js');
var tasks = require('../models/task.js');
var logs = require('../models/log.js');
var api = require('../models/api.js');

var router = express.Router();

router.use(api.isLoggedIn);

//populations
const defaultNotificationPopulate = [
    { populate: 'sender', display: 'username osuId' },
    { innerPopulate: 'map', populate: { path: 'song host' } },
    { innerPopulate: 'map', populate: { path: 'tasks', populate: { path: 'mappers' } } },
    { innerPopulate: 'party', populate: { path: 'members leader' } },
];
const defaultInvitePopulate = [
    { populate: 'sender', display: 'username osuId' },
    { innerPopulate: 'map', populate: { path: 'song host' } },
    { innerPopulate: 'map', populate: { path: 'tasks', populate: { path: 'mappers' } } },
    { innerPopulate: 'party', populate: { path: 'members leader' } },
    { innerPopulate: 'quest', populate: { path: 'currentParty', populate: { path: 'members' } } },
];
const defaultMapPopulate = [{ populate: 'song', display: 'artist title' }];
const questPopulate = [
    { innerPopulate: 'parties',  populate: { path: 'members leader' } },
    { innerPopulate: 'currentParty',  populate: { path: 'members leader' } },
    { populate: 'completedMembers',  display: 'username osuId rank' },
    { innerPopulate: 'associatedMaps',  populate: { path: 'song host' } }
];

//updating party rank when accepting invite
async function updatePartyRank(id) {
    let p = await parties.service.query({ _id: id }, [{ populate: 'members', display: 'rank' }]);
    var rank = 0;
    p.members.forEach(user => {
        rank += user.rank;
    });
    await parties.service.update(id, { rank: Math.round(rank / p.members.length) });
}

//valid task check (doesn't have lock check, has special task checks)
async function addTaskChecks(userId, b, invite) {
    if (!b) {
        return { error: 'This map no longer exists!' };
    }
    if (b.tasks.length > 20 && invite.taskName) {
        return { error: 'This mapset has too many difficulties!' };
    }
    if (invite.taskName == 'Storyboard') {
        let sb = false;
        b.tasks.forEach(task => {
            if (task.name == 'Storyboard') {
                sb = true;
            }
        });
        if (sb) {
            return { error: 'There can only be one storyboard on a mapset!' };
        }
    }
    if (b.quest && invite.taskName != 'Storyboard') {
        let q = await quests.service.query({ _id: b.quest }, questPopulate);
        let valid = false;
        q.currentParty.members.forEach(member => {
            if(member.id == userId){
                valid = true;
            }
        });
        if (!valid) {
            return {
                error:
                    "This mapset is part of a quest, so only members of the quest's current party can add difficulties!",
            };
        }
    }
    const isAlreadyBn = await beatmaps.service.query({ _id: b._id, bns: userId });
    if (isAlreadyBn) {
        return { error: 'Cannot create a difficulty while in BN list!' };
    }
    let t = await tasks.service.query({ _id: invite.modified._id });
    if (!t) {
        return { error: "Task doesn't exist anymore!" };
    }
    t = await tasks.service.query({ _id: invite.modified._id, mappers: userId });
    if (t.length != 0) {
        invite = await invites.service.update(invite.map.id, { visible: false });
        return { error: "You're already a mapper on this task!" };
    }
    return true;
}

/* GET notifications/invites */
router.get('/', async (req, res, next) => {
    res.render('notifications', {
        title: 'Notifications/Invites',
        script: '../javascripts/notifications.js',
        isNotifications: true,
        loggedInAs: req.session.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});

/* GET notifications/invites listing. */
router.get('/relevantInfo', async (req, res, next) => {
    const [notif, inv] = await Promise.all([
        notifications.service.query(
            { visible: true, recipient: req.session.mongoId },
            defaultNotificationPopulate,
            {},
            true
        ),
        invites.service.query(
            { visible: true, recipient: req.session.mongoId },
            defaultInvitePopulate,
            {},
            true
        ),
    ]);
    res.json({ notifications: notif, invites: inv });
});

/* POST hide notification */
router.post('/hideNotification/:id', async (req, res) => {
    await notifications.service.update(req.params.id, { visible: false });
    let n = await notifications.service.query({ _id: req.params.id }, defaultNotificationPopulate);
    res.json(n);
});

/* POST hide notification */
router.post('/hideAll/', async (req, res) => {
    let notifs = await notifications.service.query(
        { recipient: req.session.mongoId, visible: true },
        {},
        {},
        true
    );
    notifs.forEach(n => {
        notifications.service.update(n._id, { visible: false });
    });
    res.json({});
});

/* POST hide notification */
router.post('/hideInvite/:id', async (req, res) => {
    let inv = await invites.service.update(req.params.id, { visible: false });
    inv = await invites.service.query({ _id: req.params.id }, defaultNotificationPopulate);
    res.json(inv);

    if (inv.map) {
        notifications.service.create(
            inv.id,
            `rejected your invite to ${inv.actionType} on the mapset`,
            inv.sender,
            inv.recipient,
            inv.map
        );
    } else {
        notifications.service.createPartyNotification(
            inv.id,
            `rejected your invite to join the party`,
            inv.sender,
            inv.recipient,
            inv.party
        );
    }
});

/* POST hide notification */
router.post('/hideAcceptedInvite/:id', async (req, res) => {
    res.json(await invites.service.update(req.params.id, { visible: false }));
});

/* POST hide notification */
router.post('/declineAll/', async (req, res) => {
    let invs = await invites.service.query({ recipient: req.session.mongoId, visible: true }, {}, {}, true);
    invs.forEach(inv => {
        invites.service.update(inv._id, { visible: false });
    });
    res.json({});
});

/* POST accept collab */
router.post('/acceptCollab/:id', async (req, res) => {
    let invite = await invites.service.query({ _id: req.params.id }, defaultInvitePopulate);
    let b = await beatmaps.service.query({ tasks: invite.modified._id }, defaultMapPopulate);
    let valid = await addTaskChecks(req.session.mongoId, b, invite);
    if (valid.error) {
        return res.json(valid);
    }
    if (b.status == 'Ranked') {
        return res.json({ error: 'Mapset ranked' });
    }
    await invites.service.update(req.params.id, { visible: false });
    invite = await invites.service.query({ _id: req.params.id }, defaultInvitePopulate);
    res.json(invite);

    let t = await tasks.service.update(invite.modified._id, { $push: { mappers: req.session.mongoId } });

    logs.service.create(
        req.session.mongoId,
        `added as collab mapper to "${t.name}" on "${b.song.artist} - ${b.song.title}"`,
        b._id,
        'beatmap'
    );
    notifications.service.create(
        t.id,
        `accepted your invite to collaborate on the "${t.name}" difficulty on your mapset`,
        invite.sender,
        invite.recipient,
        b.id
    );
});

/* POST accept difficulty */
router.post('/acceptDiff/:id', async (req, res) => {
    let invite = await invites.service.query({ _id: req.params.id }, defaultInvitePopulate);
    let b = await beatmaps.service.query({ _id: invite.map._id }, defaultMapPopulate);
    let valid = await addTaskChecks(req.session.mongoId, b, invite);
    if (valid.error) {
        return res.json(valid);
    }
    if (b.status != 'WIP') {
        return res.json({ error: `Mapset already marked as ${b.status.toLowerCase()}` });
    }
    await invites.service.update(req.params.id, { visible: false });
    invite = await invites.service.query({ _id: req.params.id }, defaultInvitePopulate);
    res.json(invite);

    if(invite.taskName == "Storyboard"){
        invite.taskMode = 'sb';
    }

    let t = await tasks.service.create({ name: invite.taskName, mappers: req.session.mongoId, mode: invite.taskMode });
    await beatmaps.service.update(invite.map.id, { $push: { tasks: t._id } });
    b = await beatmaps.service.query({ _id: invite.map.id }, defaultMapPopulate);

    logs.service.create(
        req.session.mongoId,
        `added "${invite.taskName}" difficulty to "${b.song.artist} - ${b.song.title}"`,
        b._id,
        'beatmap'
    );
    notifications.service.create(
        b.id,
        `accepted the invite to create a difficulty on your mapset`,
        invite.sender,
        invite.recipient,
        b.id
    );
});

/* POST accept join party */
router.post('/acceptJoin/:id', async (req, res) => {
    let invite = await invites.service.query({ _id: req.params.id }, defaultInvitePopulate);
    let q = await quests.service.query({ _id: invite.quest.id }, questPopulate);
    let currentParties = await parties.service.query({ members: req.session.mongoId }, {}, {}, true);
    let duplicate;
    q.parties.forEach(questParty => {
        currentParties.forEach(userParty => {
            if (questParty.id == userParty.id){
                duplicate = true;    
            }
        });
    });
    if(duplicate){
        return res.json({ error: inviteError + 'You are already in a party for this quest!' });
    }

    let p = await parties.service.query({ _id: invite.party._id });
    if (!p || p.error) {
        return res.json({ error: 'That party no longer exists!' });
    }
    // if timing window > 7 days, can't invite anymore
    if(q.status == 'wip'){
        const timeWindow = (new Date() - q.accepted) / (24*3600*1000);
        if(timeWindow > 7){
            return res.json({ error: "You cannot join a party that's been running a quest for over a week!"})
        }
    }
    
    await invites.service.update(req.params.id, { visible: false });
    invite = await invites.service.query({ _id: req.params.id }, defaultInvitePopulate);
    res.json(invite);

    await parties.service.update(invite.party.id, { $push: { members: req.session.mongoId } });
    await updatePartyRank(p._id);
    logs.service.create(req.session.mongoId, `joined a party for quest ${q.name}`, p._id, 'party');
    notifications.service.createPartyNotification(
        p.id,
        `accepted the invite to join your party`,
        invite.sender,
        invite.recipient,
        p.id
    );
});

module.exports = router;
