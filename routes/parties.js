var express = require('express');
var notifications = require('../models/notification.js');
var beatmaps = require('../models/beatmap.js');
var invites = require('../models/invite.js');
var parties = require('../models/party.js');
var quests = require('../models/quest.js');
var users = require('../models/user.js');
var logs = require('../models/log.js');
var api = require('../models/api.js');

var router = express.Router();

router.use(api.isLoggedIn);

//handling quest penalty points when leaving/kicking/deleting
async function questPenalty(u, p, userMongoId){
    const [q, questMaps] = await Promise.all([
        quests.service.query({_id: p.currentQuest}),
        beatmaps.service.query({quest: p.currentQuest}, [{ innerPopulate: 'tasks', populate: { path: 'mappers' } }], {}, true)
    ]);
    if(q.minParty == p.members.length){
        quests.service.update(q._id, {assignedParty: undefined}),
        quests.service.update(q._id, {status: "open"}),
        parties.service.update(p._id, {currentQuest: undefined})
        if(q.exclusive){
            quests.service.update(q._id, {status: "hidden"});
        }
        for (let i = 0; i < p.members.length; i++) {
            let u = await users.service.query({_id: p.members[i]._id});
            let penalty = (u.penaltyPoints + q.reward);
            users.service.update(u._id, {penaltyPoints: penalty});
        }
        questMaps.forEach(map => {
            beatmaps.service.update(map._id, {quest: undefined}); 
        });
        p.members.forEach(member => {
            if(member != userMongoId){
                notifications.service.create(p.id, `leaving your party forced you to drop the quest "${q.name}"`, member, userMongoId);
            }
        });
    }else{
        let penalty = (u.penaltyPoints + q.reward);
        users.service.update(u._id, {penaltyPoints: penalty});
        questMaps.forEach(map => {
            let invalid = false;
            map.tasks.forEach(task => {
                task.mappers.forEach(mapper => {
                    if(mapper.id == u.id){
                        invalid = true;
                    }
                });
            });
            if(invalid){
                beatmaps.service.update(map._id, {quest: undefined});
            }
        });
    }
}

let inviteError = "Invite not sent: ";
async function inviteChecks(u, senderId){
    if(!u.invites){
        return { error: inviteError + 'User has invites disabled!'};
    }
    let recipientInvites = await invites.service.query({recipient: u._id, visible: true}, {}, {}, true);
    if(recipientInvites.length > 2){
        return { error: inviteError + 'User has too many pending invites!'};
    }
    let senderInvite = await invites.service.query({recipient: u._id, sender: senderId, visible: true});
    if(senderInvite){
        return { error: inviteError + "Wait for the user to reply to your previous invite before sending another!"};
    }
    return true;
}

//population
const defaultPopulate = [
    { populate: 'members',  display: 'username osuId rank' },
    { populate: 'currentQuest',  display: 'name' },
    { populate: 'leader',  display: 'username osuId' },
];

/* GET parties page. */
router.get('/', async (req, res, next) => {
    res.render('parties', { title: 'Parties', script: '../javascripts/parties.js', isParties: true, loggedInAs: req.session.osuId });
  });

router.get("/relevantInfo", async (req, res, next) => {
     const [ps, p] = await Promise.all([
        parties.service.query({}, defaultPopulate, {updatedAt: -1}, true),
        parties.service.query({ 'members': req.session.mongoId })
    ]);
    if(p){
        res.json({
            parties: ps, 
            user: req.session.osuId, 
            party: p._id});
    }else{
        res.json({
            parties: ps, 
            user: req.session.osuId, 
            party: undefined});
    }
});

/* POST new party. */
router.post('/create', async (req, res) => {
    let duplicate = await parties.service.query({name: req.body.name});
    if(duplicate){
        return res.json({ error: 'Party name is already in use!' });
    }
    if(/[^a-zA-Z0-9\!\@\#\$\%\^\*\_\ \|]+/.test(req.body.name)){
        return res.json({ error: "Invalid characters!" })
    }
    let isMember = await parties.service.query({ 'members': req.session.mongoId });
    if(isMember){
        return res.json({ error: 'Leave your current party before creating a new one!' });
    }
    const p = await parties.service.create(req.body.name, req.session.mongoId);
    if(p){
        await users.service.update(req.session.mongoId, {currentParty: p._id});
        res.json(await parties.service.query({_id: p._id}, defaultPopulate));
    }

    logs.service.create(req.session.osuId, `created party "${p.name}"`, p._id, 'party' );
});

/* POST join party. */
router.post('/join', async (req, res) => {
    const [p, isMember] = await Promise.all([
        parties.service.query({_id: req.body.partyId}),
        parties.service.query({ 'members': req.session.mongoId })
    ]);
    if (p && !isMember && !p.lock && !p.currentQuest && p.members.length < 12) {
        await Promise.all([
            parties.service.update(req.body.partyId, { $push: { members: req.session.mongoId } }),
            users.service.update(req.session.mongoId, { currentParty: p._id })
        ]);
        res.json(await parties.service.query({_id: req.body.partyId}, defaultPopulate));
    } else {
        return res.json({ error: 'Party is locked! or something' });
    }

    logs.service.create(req.session.osuId, `joined party "${p.name}"`, p._id, 'party' );
    p.members.forEach(member => {
        if(member.id != req.session.mongoId){
            notifications.service.create(p.id, `joined your party`, member.id, req.session.mongoId);
        }
    });
    
});

/* POST leave party. */
router.post('/leave', async (req, res) => {
    const [u, p, leader] = await Promise.all([
        users.service.query({osuId: req.session.osuId}),
        parties.service.query({_id: req.body.partyId}),
        parties.service.query({leader: req.session.mongoId})
    ]);
    if (leader || !p) {
        return res.json({ error: "Something went wrong!" });
    }
    if(p.currentQuest){
        questPenalty(u, p, req.session.mongoId);
    }
    await Promise.all([
        parties.service.update(p._id, {$pull: {members: u._id}}),
        users.service.update(u._id, {currentParty: undefined})
    ]);
    res.json(await parties.service.query({ _id: p._id }, defaultPopulate));
    
    logs.service.create(req.session.osuId, `left party "${p.name}"`, p._id, 'party' );
    p.members.forEach(member => {
        notifications.service.createPartyNotification(p.id, `left your party`, member.id, req.session.mongoId, p.id);
    });
});

/* POST delete party. */
router.post('/delete', async (req, res) => {
    const p = await parties.service.query({leader: req.session.mongoId});
    if(!p){
        return res.json("Something went wrong!")
    }
    if (p.currentQuest) {
        u = await users.service.query({_id: req.session.mongoId});
        questPenalty(u, p, req.session.mongoId);
    }
    await users.service.update(req.session.mongoId, {currentParty: undefined});
    const success = await parties.service.remove(p._id);
    if (success.error) {
        return res.json({ error: "Something went wrong" });
    }else{
        res.json(success);
    }

    logs.service.create(req.session.osuId, `deleted party "${p.name}"`, p._id, 'party' );
});

/* POST kick member. */
router.post('/kick', async (req, res) => {    
    const [u, p] = await Promise.all([
        users.service.query({_id: req.body.user}),
        parties.service.query({leader: req.session.mongoId})
    ]);
    if (!p || !u) {
        return res.json({error: "Something went wrong!"});
    }
    if (req.session.mongoId == u.id) {
        return res.json({error: "You cannot kick yourself!"});
    }
    if(p.currentQuest){
        questPenalty(u, p, req.session.mongoId);
    }
    await Promise.all([
        parties.service.update(p._id, {$pull: {members: u._id}}),
        users.service.update(u._id, {currentParty: undefined})
    ]);
    res.json(await parties.service.query({ _id: p._id }, defaultPopulate));
    
    logs.service.create(req.session.osuId, `kicked "${u.username}" from party "${p.name}"`, p._id, 'party' );
    p.members.forEach(member => {
        if(member.id != req.session.mongoId){
            notifications.service.createPartyNotification(p.id, `was kicked from your party`, member, req.session.mongoId, p.id);
        }
    });
});

/* POST transfer party leadership. */
router.post('/transferLeader', async (req, res) => {
    const [p, u] = await Promise.all([
        parties.service.query({leader: req.session.mongoId}),
        users.service.query({_id: req.body.user})
    ]);
    if (req.session.mongoId == u.id) {
        return res.json({error: "You can't transfer to yourself!"})
    }
    if (p && u) {
        await parties.service.update(p._id, {leader: u._id});
        res.json(await parties.service.query({ _id: p._id }, defaultPopulate));

        logs.service.create(req.session.osuId, `transferred party leader to "${u.username}" in party "${p.name}"`, p._id, 'party' );
        p.members.forEach(member => {
            if(member.id != req.session.mongoId){
                notifications.service.createPartyNotification(p.id, `was promoted to leader in your party`, member, u.id, p.id);
            }
        });
    }
});

/* POST new name for party */
router.post('/rename', async (req, res) => {
    if(/[^a-zA-Z0-9\!\@\#\$\%\^\*\_\ \|]+/.test(req.body.newName)){
        return res.json({error: "Invalid characters!"})
    }
    const [duplicate, p] = await Promise.all([
        parties.service.query({name: req.body.newName}),
        parties.service.query({leader: req.session.mongoId})
    ]);
    if(duplicate){
        return res.json({error: "That name is already taken!"})
    }
    if(!p){
        return res.json({error: "Something went wrong!"})
    }
    await parties.service.update(p._id, {name: req.body.newName});
    res.json(await parties.service.query({ _id: p._id }, defaultPopulate));
    logs.service.create(req.session.osuId, `renamed party from "${p.name}" to "${req.body.newName}"`, p._id, 'party' );
});

/* POST switch party lock */
router.post('/switchLock', async (req, res) => {
    let p = await parties.service.query({leader: req.session.mongoId});
    if(!p){
        return res.json({error: "Something went wrong!"})
    }
    await parties.service.update(p._id, {lock: !p.lock});
    res.json(await parties.service.query({ _id: p._id }, defaultPopulate));
    logs.service.create(req.session.osuId, `${p.lock ? "unlocked" : "locked"} admissions to party "${p.name}"`, p._id, 'party' );
});

/* POST add banner */
router.post('/addBanner', async (req, res) => {
    let p = await parties.service.query({leader: req.session.mongoId});
    if(!p){
        return res.json({error: "Something went wrong!"})
    }
    if (req.body.banner.indexOf('osu.ppy.sh/beatmapsets/') != -1) {
        let indexStart = req.body.banner.indexOf('beatmapsets/') + 'beatmapsets/'.length;
        let indexEnd = req.body.banner.indexOf('#');
        let idUrl;
        if (indexEnd !== -1) {
            idUrl = req.body.banner.slice(indexStart, indexEnd);
        } else {
            idUrl = req.body.banner.slice(indexStart);
        }
        const axios = require('axios');
        axios
            .get(`https://assets.ppy.sh/beatmaps/${idUrl}/covers/cover.jpg`)
			.then(async function() {
                await parties.service.update(p._id, {art: idUrl});
                res.json(await parties.service.query({ _id: p._id }, defaultPopulate));        
                logs.service.create(req.session.osuId, `added banner on party "${p.name}"`, p._id, 'party' );
            })
            .catch(err => {
                if(err.response.status == 404){
                    return res.json({error: "That map doesn't exist or has no cover art!"})
                }
            });
    }else{
        return res.json({error: "Not a valid URL! Link a beatmap's page on the new osu! site."})
    }
});

/* POST invite member */
router.post('/inviteMember', async (req, res) => {
    let u = await users.service.query({ username: new RegExp("^"+req.body.user+"$", "i") });
    if(!u){
        return res.json({error: inviteError + "Cannot find user!"})
    }
    let valid = await inviteChecks(u, req.session.mongoId);
    if(valid.error){
        return res.json(valid);
    }
    let isMember = await parties.service.query({ 'members': u._id });
    if(isMember){
        return res.json({ error: inviteError + 'User is already in a party!' });
    }
    let p = await parties.service.query({leader: req.session.mongoId});
    if(!p){
        return res.json({error: inviteError + "Something went wrong!"})
    }
    if(p.members.length >= 12){
        return res.json({ error: inviteError + 'Your party has too many members!'});
    }
    if(p.currentQuest){
        return res.json({ error: inviteError + 'Your party is currently running a quest!'})
    }
    res.json(p);

    invites.service.createPartyInvite(u.id, req.session.mongoId, p.id, `wants you to join their party`, 'join', p.id );
});

/* GET parties with sorting. */
router.get("/:sort", async (req, res, next) => {
    const populate = [
        { populate: 'members',  display: 'username osuId rank' },
        { populate: 'currentQuest',  display: 'name' },
        { populate: 'leader',  display: 'username osuId' },
    ];
    const sortBy = req.params.sort;
    res.json(await parties.service.query({}, populate, sortBy, true));
  });

module.exports = router;
