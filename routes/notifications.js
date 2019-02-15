var express = require('express');
var users = require('../models/user.js');
var beatmaps = require('../models/beatmap.js');
var parties = require('../models/party.js');
var notifications = require('../models/notification.js');
var invites = require('../models/invite.js');
var tasks = require('../models/task.js');
var logs = require('../models/log.js');
var api = require('../models/api.js');

var router = express.Router();

router.use(api.isLoggedIn);

const defaultNotificationPopulate = [
    { populate: 'sender',  display: 'username osuId' },
    { innerPopulate: 'map',  populate: { path: 'song' } },
];
const defaultInvitePopulate = [
    { populate: 'sender',  display: 'username osuId' },
    { innerPopulate: 'map',  populate: { path: 'song' } },
];
const defaultMapPopulate = [
    { populate: 'song',  display: 'artist title' },
];

/* GET notifications/invites */
router.get('/', async (req, res, next) => {
	res.render('notifications', { title: 'Notifications/Invites', script: '../javascripts/notifications.js', isNotifications: true, loggedInAs: req.session.username });
});

/* GET notifications/invites listing. */
router.get('/relevantInfo', async (req, res, next) => {

    let user = await users.service.query({ osuId: req.session.osuId });

    const [notif, inv] = await Promise.all([
        notifications.service.query({ visible: { $ne: false }, recipient: user._id}, defaultNotificationPopulate, {}, true),
        invites.service.query({ visible: { $ne: false }, recipient: user._id}, defaultInvitePopulate, {}, true)
    ]);
    res.json({notifications: notif, invites: inv});
  });

/* POST hide notification */
router.post('/hideNotification/:id', async (req, res) => {
    let n = await notifications.service.update(req.params.id, {visible: false});
    n = await notifications.service.query({_id: req.params.id}, defaultNotificationPopulate)
    res.json(n);
});

/* POST hide notification */
router.post('/declineInvite/:id', async (req, res) => {
    let inv = await invites.service.update(req.params.id, {visible: false});
    inv = await invites.service.query({_id: req.params.id}, defaultNotificationPopulate)
    res.json(inv);

    notifications.service.create(inv.id, `rejected your invitation related to the mapset`, inv.sender, inv.recipient, inv.map.id);
});


/* POST accept collab */
router.post('/acceptCollab/:id', async (req, res) => {
    let invite = await invites.service.query({_id: req.params.id}, defaultInvitePopulate);
    let u;
    try {
        u = await users.service.query({ _id: invite.recipient._id });
    } catch(error) {
        return res.json({ error: error._message });
    }
    if (!u) {
        return res.json({ error: 'Cannot find user!' });
    }
    if (req.session.username == u.username) {
        return res.json({ error: 'Cannot collaborate with yourself!' });
    }

    let b = await beatmaps.service.query({ tasks: invite.modified._id }, defaultMapPopulate);
    if(b.quest){
        let p = await parties.service.query({currentQuest: b.quest});
        let valid = false;
        for (let i = 0; i < p.members.length; i++) {
            if(p.members[i].toString() == u._id.toString()){
                valid = true;
                break;
            }
        }
        if(!valid){
            return res.json({error: "This mapset has become part of a quest since the invite was sent, so only members of the host's party can collaborate."})
        }
    }

    let isBn = false;
    b.bns.forEach(bn => {
        if(bn.id == u.id){
            isBn = true;
        }
    });
    if(isBn){
        return res.json({error: "Remove yourself from the Beatmap Nominator list of this map if you want to create a difficulty."})
    }

    let t;
    try {
        t = await tasks.service.query({ _id: invite.modified._id });
    } catch(error) {
        return res.json({ error: error._message });
    }

    t = await tasks.service.query({ _id: invite.modified._id, mappers: u._id });
    if (t.length != 0) {
        invite = await invites.service.update(req.params.id, {visible: false});
        return res.json(invite);
    }
    
    t = await tasks.service.update(invite.modified._id, { $push: { mappers: u._id } });

    invite = await invites.service.update(req.params.id, {visible: false});
    invite = await invites.service.query({_id: req.params.id}, defaultInvitePopulate)
    res.json(invite);

    logs.service.create(req.session.osuId, `added as collab mapper to "${t.name}" on "${b.song.artist} - ${b.song.title}"`, b._id, 'beatmap' );
    notifications.service.create(t.id, `accepted your invite to collaborate on the "${t.name}" difficulty on your mapset`, invite.sender, invite.recipient, b.id);
});

/* POST accept transfer host */
router.post('/acceptHost/:id', async (req, res) => {
    let invite = await invites.service.query({_id: req.params.id}, defaultInvitePopulate);
    let u;
    try {
        u = await users.service.query({ _id: invite.recipient._id })
    } catch(error) {
        console.log(error)
        return res.json({ error: error._message });
    }
    if (!u) {
        return res.json({ error: 'Cannot find user!' });
    }
    if(u.osuId == req.session.osuId){
        invite = await invites.service.update(req.params.id, {visible: false});
        return res.json(invite);
    }
   
    let b = await beatmaps.service.query({_id: invite.map._id});
    

    if(!b){
        return res.json({ error: 'That map no longer exists!' });
    }

    if(b.quest){
        let p = await parties.service.query({currentQuest: b.quest, members: u._id});
        if(!p){
            return res.json({error: "This mapset is part of a quest, so only members of the host's party can host."})
        }
    }

    const isAlreadyModder = await beatmaps.service.query({ _id: invite.map._id, modders: u._id });
    if (isAlreadyModder) {
        let update = { $pull: { modders: u._id } };
        b = await beatmaps.service.update(invite.map._id, update);
    }

    const isAlreadyBn = await beatmaps.service.query({ _id: invite.map._id, bns: u._id });
    if (isAlreadyBn) {
        update = { $pull: { bns: u._id } };
        b = await beatmaps.service.update(invite.map._id, update);
    }
    await beatmaps.service.update(b._id, {host: u._id})

    invite = await invites.service.update(req.params.id, {visible: false});
    invite = await invites.service.query({_id: req.params.id}, defaultInvitePopulate);
    res.json(invite);

    logs.service.create(req.session.osuId, `became host of "${b.song.artist} - ${b.song.title}"`, b._id, 'beatmap' );
    notifications.service.create(b.id, `accepted your invite to become the host of your mapset`, invite.sender, invite.recipient, b.id);
});


/* POST accept difficulty */
router.post('/acceptDiff/:id', async (req, res) => {
    let invite = await invites.service.query({_id: req.params.id}, defaultInvitePopulate);

    const u = await users.service.query({osuId: req.session.osuId});
    let b = await beatmaps.service.query({_id: invite.map.id}, defaultMapPopulate);

    //quest check
    if(b.quest){
        let p = await parties.service.query({currentQuest: b.quest});
        let valid = false;
        for (let i = 0; i < p.members.length; i++) {
            if(p.members[i].toString() == u._id.toString()){
                valid = true;
                break;
            }
        }
        if(!valid){
            return res.json({error: "Because the mapset host has linked their mapset to a quest, you're unable to create a difficulty"})
        }
    }

    //bn check
    let isBn = false;
    b.bns.forEach(bn => {
        if(bn.id == u.id){
            isBn = true;
        }
    });
    if(isBn){
        return res.json({error: "You can't add a difficulty if you're on the mapset's Beatmap Nominator list"})
    }

    //excess diffs check
    if(b.tasks.length > 20){
        return res.json({error: "This mapset has too many difficulties!"})
    }

    //multiple storyboards check
    if(invite.taskName == "Storyboard"){
        let sb = false;
        b.tasks.forEach(task => {
            if(task.name == "Storyboard"){
                sb = true;
            }
        })
        if(sb){
            return res.json({error: "There can only be one storyboard on a mapset!"});
        }
    }

    //create
    const t = await tasks.service.create({ name: invite.taskName, mappers: u._id });
    if (t.error) {
        return res.json(t.error);
    }

    b = await beatmaps.service.update(invite.map.id, { $push: {tasks: t._id } });
    if (b.error) {
        return res.json(b.error);
    }

    invite = await invites.service.update(req.params.id, {visible: false});
    invite = await invites.service.query({_id: req.params.id}, defaultInvitePopulate);
    res.json(invite);

    b = await beatmaps.service.query({_id: invite.map.id}, defaultMapPopulate);

    logs.service.create(req.session.osuId, `added "${invite.taskName}" difficulty to "${b.song.artist} - ${b.song.title}"`, b._id, 'beatmap' );
    notifications.service.create(b.id, `accepted your invite to create a difficulty`, invite.sender, invite.recipient, b.id);
});

module.exports = router;
