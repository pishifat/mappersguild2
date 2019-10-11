const express = require('express');
const quests = require('../models/quest.js');
const logs = require('../models/log.js');
const notifications = require('../models/notification.js');
const parties = require('../models/party.js');
const invites = require('../models/invite.js');
const beatmaps = require('../models/beatmap.js');
const users = require('../models/user.js');
const api = require('../models/api.js');

const router = express.Router();

router.use(api.isLoggedIn);

//population
const questPopulate = [
    { innerPopulate: 'parties',  populate: { path: 'members leader' } },
    { innerPopulate: 'currentParty',  populate: { path: 'members leader' } },
    { populate: 'completedMembers',  display: 'username osuId rank' },
    { innerPopulate: 'associatedMaps',  populate: { path: 'song host' } }
];

const partyPopulate = [
    { populate: 'members', display: 'username osuId rank' },
    { populate: 'leader', display: 'username osuId' },
];

//updating party rank when leaving/kicking/joining
async function updatePartyRank(id) {
    let p = await parties.service.query({ _id: id }, partyPopulate);
    let rank = 0;
    p.members.forEach(user => {
        rank += user.rank;
    });
    await parties.service.update(id, { rank: Math.round(rank / p.members.length) });
}

/* GET quests page */
router.get('/', async (req, res, next) => {
    res.render('quests', { 
        title: 'title', 
        subTitle: 'subtitle', 
        script: '../javascripts/quests.js', 
        isQuests: true, 
        loggedInAs: req.session.osuId, 
        userTotalPoints: res.locals.userRequest.totalPoints,
        userParty: res.locals.userRequest.currentParty ? res.locals.userRequest.currentParty.name : null,
    });
});

/* GET relevant quest info */
router.get("/relevantInfo", async (req, res, next) => {
    let all = await quests.service.query({ $or: [ { status: 'open' }, { status: 'wip' } ] }, questPopulate, {createdAt: -1}, true);
    let wip = await quests.service.query({ status: 'wip' }, questPopulate, {createdAt: -1}, true);
    
    res.json({all, userId: req.session.mongoId});
});

/* GET completed quests */
router.get("/loadComplete", async (req, res, next) => {
    let complete = await quests.service.query({status: "done"}, questPopulate, {accepted: -1}, true);
    res.json({complete});
});

/* POST create party */
router.post('/createParty/:id', async (req, res) => {
    let p = await parties.service.create(req.session.mongoId);
    await updatePartyRank(p._id);
    await quests.service.update(req.params.id, { $push: { parties: p._id } });
    let q = await quests.service.query({ _id: req.params.id }, questPopulate);
    res.json(q);

    logs.service.create(req.session.mongoId, `created a party for ${q.name}`, p._id, 'party');
});

/* POST delete party */
router.post('/deleteParty/:partyId/:questId', async (req, res) => {
    let p = await parties.service.remove(req.params.partyId);
    await quests.service.update(req.params.questId, { $pull: { parties: p._id } });
    let q = await quests.service.query({ _id: req.params.questId }, questPopulate);
    res.json(q);

    logs.service.create(req.session.mongoId, `deleted a party for ${q.name}`, p._id, 'party');
});

/* POST toggle party lock */
router.post('/togglePartyLock/:partyId/:questId', async (req, res) => {
    let p = await parties.service.update(req.params.partyId, { lock: !req.body.lock });
    let q = await quests.service.query({ _id: req.params.questId }, questPopulate);
    res.json(q);

    logs.service.create(req.session.mongoId, `toggled lock on party for ${q.name}`, p._id, 'party');
});

/* POST join party */
router.post('/joinParty/:partyId/:questId', async (req, res) => {
    let p = await parties.service.update(req.params.partyId, { $push: { members: req.session.mongoId } });
    await updatePartyRank(req.params.partyId);
    let q = await quests.service.query({ _id: req.params.questId }, questPopulate);
    res.json(q);

    logs.service.create(req.session.mongoId, `joined party for ${q.name}`, p._id, 'party');
});

/* POST leave party */
router.post('/leaveParty/:partyId/:questId', async (req, res) => {
    let p = await parties.service.update(req.params.partyId, { $pull: { members: req.session.mongoId } });
    await updatePartyRank(req.params.partyId);
    let q = await quests.service.query({ _id: req.params.questId }, questPopulate);
    res.json(q);

    logs.service.create(req.session.mongoId, `joined party for ${q.name}`, p._id, 'party');
});

/* POST invite to party */
router.post('/inviteToParty/:partyId/:questId', async (req, res) => {
    let u;
    if(req.body.username.indexOf("[") >= 0 || req.body.username.indexOf("]") >= 0){
        u = await users.service.query({ username: new RegExp('^\\' + req.body.username + '$', 'i') });
    }else{
        u = await users.service.query({ username: new RegExp('^' + req.body.username + '$', 'i') });
    }
    let inviteError = 'Invite not sent: ';
    if (!u) {
        return res.json({ error: inviteError + 'Cannot find user!' });
    }
    if (!u.invites) {
        return res.json({ error: inviteError + 'User has invites disabled!' });
    }
    let senderInvite = await invites.service.query({ recipient: u._id, sender: req.session.mongoId, visible: true });
    if (senderInvite) {
        return res.json({error: inviteError + 'Wait for the user to reply to your previous invite before sending another!'});
    }
    let q = await quests.service.query({ _id: req.params.questId }, questPopulate);
    let currentParties = await parties.service.query({ members: u._id }, {}, {}, true);
    let duplicate;
    q.parties.forEach(questParty => {
        currentParties.forEach(userParty => {
            if (questParty.id == userParty.id){
                duplicate = true;    
            }
        });
    });
    if(duplicate){
        return res.json({ error: inviteError + 'User is already in a party for this quest!' });
    }        
    if(q.status == 'wip'){
        const timeWindow = (new Date() - q.accepted) / (24*3600*1000);
        if (timeWindow > 7) {
            return res.json({ error: inviteError + 'Your party has been running a quest for too long to add new members!' });
        }
    }

    res.json(true);

    invites.service.createPartyInvite(
        u.id,
        req.session.mongoId,
        req.params.partyId,
        `wants you to join their party`,
        'join',
        req.params.partyId,
    );
});

/* POST transfer party leader */
router.post('/transferPartyLeader/:partyId/:questId', async (req, res) => {
    let u = await users.service.query({_id: req.body.userId});
    if(!u || !req.body.userId.length){
        return res.json({ error: 'Cannot find user!' });
    }
    let p = await parties.service.update(req.params.partyId, { leader: u._id });
    let q = await quests.service.query({ _id: req.params.questId }, questPopulate);
    res.json(q);

    logs.service.create(req.session.mongoId, `transfer party leader in party for ${q.name}`, p._id, 'party');
});

/* POST kick party member */
router.post('/kickPartyMember/:partyId/:questId', async (req, res) => {
    let u = await users.service.query({_id: req.body.userId});
    if(!u || !req.body.userId.length){
        return res.json({ error: 'Cannot find user!' });
    }
    let p = await parties.service.update(req.params.partyId, { $pull: { members: u._id } });
    let q = await quests.service.query({ _id: req.params.questId }, questPopulate);
    res.json(q);

    logs.service.create(req.session.mongoId, `transfer party leader in party for ${q.name}`, p._id, 'party');
});

/* POST accepts quest. */
router.post('/acceptQuest/:partyId/:questId', async (req, res) => {
    let p = await parties.service.query({_id: req.params.partyId}, partyPopulate);
    if (!p) {
        return res.json({error: "Party doesn't exist!"});
    }
    let q = await quests.service.query({ _id: req.params.questId }, questPopulate);
    if(q.currentParty){
        return res.json({error: "Another party has taken this quest!"});
    }
    let valid = (p.members.length >= q.minParty 
        && p.members.length <= q.maxParty 
        && p.rank >= q.minRank);
    if(!valid){
        return res.json({error: "Something went wrong!"});
    }

    await quests.service.update(q._id, {
        accepted: new Date().getTime(),
        status: 'wip',
        deadline: new Date().getTime() + q.timeframe,
        parties: [],
        currentParty: p._id 
    });

    q = await quests.service.query({ _id: req.params.questId }, questPopulate);
    res.json(q);

    logs.service.create(req.session.mongoId, `party accepted quest "${q.name}"`, q._id, 'quest' );

    //webhook
    let memberList = "";
    for (let i = 0; i < p.members.length; i++) {
        memberList += p.members[i].username
        if(i != p.members.length - 1){
            memberList += ", ";
        }
    }
    api.webhookPost([{
        author: {
            name: `Quest accepted: "${q.name}"`,
            url: `https://mappersguild.com/quests`,
            icon_url: `https://a.ppy.sh/${p.leader.osuId}`,
        },
        color: '11403103',
        thumbnail: {
            url: `https://assets.ppy.sh/artists/${q.art}/cover.jpg`
        },
        fields: [{
            name: "Party members",
            value: memberList
        }]
    }]);
});

/* POST drop quest. */
router.post('/dropQuest/:partyId/:questId', async (req, res) => {
    let p = await parties.service.query({_id: req.params.partyId}, partyPopulate);
    if (!p) {
        return res.json({error: "Party doesn't exist!"});
    }
    let q = await quests.service.query({ _id: req.params.questId }, questPopulate);
    if(!q.currentParty || q.currentParty.id != p.id){
        return res.json({error: "Invalid request!"});
    }

    await quests.service.update(req.params.questId, {
        status: "open",
        currentParty: null,
    });

    if(q.associatedMaps){
        for (let i = 0; i < q.associatedMaps.length; i++) {
            beatmaps.service.update(q.associatedMaps[i]._id, {quest: null});
        }
    }
    
    q = await quests.service.query({ _id: req.params.questId }, questPopulate);
    res.json(q);
    
    for (let i = 0; i < p.members.length; i++) {
        let u = await users.service.query({_id: p.members[i].id});
        users.service.update(p.members[i]._id, {penaltyPoints: (u.penaltyPoints + q.reward)});
    }

    logs.service.create(req.session.mongoId, `party dropped quest "${q.name}"`, q._id, 'quest' );

    //webhook
    let memberList = "";
    for (let i = 0; i < p.members.length; i++) {
        memberList += p.members[i].username
        if(i != p.members.length - 1){
            memberList += ", ";
        }
    }
    api.webhookPost([{
        author: {
            name: `Quest dropped: "${q.name}"`,
            url: `https://mappersguild.com/quests`,
            icon_url: `https://a.ppy.sh/${p.leader.osuId}`,
        },
        color: '13710390',
        thumbnail: {
            url: `https://assets.ppy.sh/artists/${q.art}/cover.jpg`
        },
        fields: [{
            name: "Party members",
            value: memberList
        }]
    }]);

    parties.service.remove(req.params.partyId);
});

module.exports = router;
