const express = require('express');
const quests = require('../models/quest.js');
const logs = require('../models/log.js');
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

const beatmapPopulate = [
    { innerPopulate: 'tasks', populate: { path: 'mappers' } },
];

//updating party rank and modes when leaving/kicking/joining
async function updatePartyInfo(id) {
    let p = await parties.service.query({ _id: id }, [{ populate: 'members', display: 'rank osuPoints taikoPoints catchPoints maniaPoints' }]);
    let rank = 0;
    let modes = [];
    p.members.forEach(user => {
        rank += user.rank;
        if(!modes.includes(user.mainMode)){
            modes.push(user.mainMode);
        }
    });
    await parties.service.update(id, { rank: Math.round(rank / p.members.length), modes: modes });
}

/* GET quests page */
router.get('/', async (req, res, next) => {
    res.render('quests', { 
        title: 'Quests',
        script: '../javascripts/quests.js', 
        isQuests: true, 
        loggedInAs: req.session.osuId, 
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});

/* GET relevant quest info */
router.get("/relevantInfo", async (req, res, next) => {
    let all = await quests.service.query({ modes: res.locals.userRequest.mainMode, status: 'open' }, questPopulate, {createdAt: -1}, true);
    
    res.json({all, userId: req.session.mongoId, group: res.locals.userRequest.group, mainMode: res.locals.userRequest.mainMode});
});

/* GET relevant quest info */
router.get("/loadQuests/:mode", async (req, res, next) => {
    let all;
    if(req.params.mode != 'any'){
        all = await quests.service.query({ modes: req.params.mode, status: { $ne: 'hidden' } }, questPopulate, {createdAt: -1}, true);
    }else{
        all = await quests.service.query({ status: { $ne: 'hidden' } }, questPopulate, {createdAt: -1}, true);
    }

    res.json({all});
});

/* POST create party */
router.post('/createParty/:id', api.isNotSpectator, async (req, res) => {
    let p = await parties.service.create(req.session.mongoId, res.locals.userRequest.mainMode);
    await updatePartyInfo(p._id);
    await quests.service.update(req.params.id, { $push: { parties: p._id } });
    let q = await quests.service.query({ _id: req.params.id }, questPopulate);
    res.json(q);

    logs.service.create(req.session.mongoId, `created a party for ${q.name}`, p._id, 'party');
});

/* POST delete party */
router.post('/deleteParty/:partyId/:questId', api.isNotSpectator, async (req, res) => {
    let p = await parties.service.remove(req.params.partyId);
    await quests.service.update(req.params.questId, { $pull: { parties: p._id } });
    let q = await quests.service.query({ _id: req.params.questId }, questPopulate);
    res.json(q);

    logs.service.create(req.session.mongoId, `deleted a party for ${q.name}`, p._id, 'party');
});

/* POST toggle party lock */
router.post('/togglePartyLock/:partyId/:questId', api.isNotSpectator, async (req, res) => {
    let p = await parties.service.update(req.params.partyId, { lock: !req.body.lock });
    let q = await quests.service.query({ _id: req.params.questId }, questPopulate);
    res.json(q);

    logs.service.create(req.session.mongoId, `toggled lock on party for ${q.name}`, p._id, 'party');
});

/* POST join party */
router.post('/joinParty/:partyId/:questId', api.isNotSpectator, async (req, res) => {
    let p = await parties.service.update(req.params.partyId, { $push: { members: req.session.mongoId } });
    if(!p.modes.includes(res.locals.userRequest.mainMode)){
        p = await parties.service.update(req.params.partyId, { $push: { modes: res.locals.userRequest.mainMode } });
    }
    await updatePartyInfo(req.params.partyId);
    let q = await quests.service.query({ _id: req.params.questId }, questPopulate);
    res.json(q);

    logs.service.create(req.session.mongoId, `joined party for ${q.name}`, p._id, 'party');
});

/* POST leave party */
router.post('/leaveParty/:partyId/:questId', api.isNotSpectator, async (req, res) => {
    let p = await parties.service.update(req.params.partyId, { $pull: { members: req.session.mongoId } });
    await updatePartyInfo(req.params.partyId);
    let q = await quests.service.query({ _id: req.params.questId }, questPopulate);
    res.json(q);

    logs.service.create(req.session.mongoId, `left party for ${q.name}`, p._id, 'party');

    if(q.status == 'wip'){
        const timeWindow = (new Date() - q.accepted) / (24*3600*1000);
        if (timeWindow > 7) {
            let u = await users.service.query({ _id: req.session.mongoId });
            users.service.update(u._id, {penaltyPoints: (u.penaltyPoints + q.reward)});
        }
    }

    if(q.associatedMaps){
        for (let i = 0; i < q.associatedMaps.length; i++) {
            let valid = true;
            let b = await beatmaps.service.query({ _id: q.associatedMaps[i]._id }, beatmapPopulate);
            b.tasks.forEach(task => {
                task.mappers.forEach(mapper => {
                    if(mapper.id == req.session.mongoId){
                        valid = false;
                    }
                });
            });
            if(!valid){
                await beatmaps.service.update(q.associatedMaps[i]._id, {quest: null});
            }
        }
    }
    
});

/* POST invite to party */
router.post('/inviteToParty/:partyId/:questId', api.isNotSpectator, async (req, res) => {
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
        req.params.questId,
    );
});

/* POST transfer party leader */
router.post('/transferPartyLeader/:partyId/:questId', api.isNotSpectator, async (req, res) => {
    let u = await users.service.query({_id: req.body.userId});
    if(!u || !req.body.userId.length){
        return res.json({ error: 'Cannot find user!' });
    }
    let p = await parties.service.update(req.params.partyId, { leader: u._id });
    let q = await quests.service.query({ _id: req.params.questId }, questPopulate);
    res.json(q);

    logs.service.create(req.session.mongoId, `transferred party leader in party for ${q.name}`, p._id, 'party');
});

/* POST kick party member */
router.post('/kickPartyMember/:partyId/:questId', api.isNotSpectator, async (req, res) => {
    let u = await users.service.query({_id: req.body.userId});
    if(!u || !req.body.userId.length){
        return res.json({ error: 'Cannot find user!' });
    }
    let p = await parties.service.update(req.params.partyId, { $pull: { members: u._id } });
    let q = await quests.service.query({ _id: req.params.questId }, questPopulate);
    res.json(q);

    logs.service.create(req.session.mongoId, `kicked member from party for ${q.name}`, p._id, 'party');

    if(q.status == 'wip'){
        const timeWindow = (new Date() - q.accepted) / (24*3600*1000);
        if (timeWindow > 7) {
            users.service.update(u._id, {penaltyPoints: (u.penaltyPoints + q.reward)});
        }
    }

    if(q.associatedMaps){
        for (let i = 0; i < q.associatedMaps.length; i++) {
            let valid = true;
            let b = await beatmaps.service.query({ _id: q.associatedMaps[i]._id }, beatmapPopulate);
            b.tasks.forEach(task => {
                task.mappers.forEach(mapper => {
                    if(mapper.id == u.id){
                        valid = false;
                    }
                });
            });
            if(!valid){
                await beatmaps.service.update(q.associatedMaps[i]._id, {quest: null});
            }
        }
    }
});

/* POST accepts quest. */
router.post('/acceptQuest/:partyId/:questId', api.isNotSpectator, async (req, res) => {
    let p = await parties.service.query({ _id: req.params.partyId }, partyPopulate);
    if (!p) {
        return res.json({error: "Party doesn't exist!"});
    }
    let q = await quests.service.query({ _id: req.params.questId }, questPopulate);
    let valid = (p.members.length >= q.minParty 
        && p.members.length <= q.maxParty 
        && p.rank >= q.minRank);
    if(!valid){
        return res.json({error: "Something went wrong!"});
    }
    let invalidQuest = await quests.service.query({ name: q.name, modes: p.modes }, questPopulate); //does this detect in case of newparty osu, oldquest osu/taiko?
    if(invalidQuest){
        return res.json({error: "Quest already exists for selected mode(s)!"});
    }
    if(q.modes.length == p.modes.length){
        await quests.service.update(q._id, {
            accepted: new Date().getTime(),
            status: 'wip',
            deadline: new Date().getTime() + q.timeframe,
            parties: [],
            currentParty: p._id 
        });
    }else{
        for (let i = 0; i < p.modes.length; i++) {
            const mode = p.modes[i];
            await quests.service.update(q._id, { $pull: { modes: mode } });
        }
        await quests.service.update(q._id, {
            $pull: { parties: p._id },
        });
        let body = {name: q.name,
            reward: q.reward,
            descriptionMain: q.descriptionMain,
            timeframe: q.timeframe,
            minParty: q.minParty,
            maxParty: q.maxParty,
            minRank: q.minRank,
            art: q.art,
            color: q.color,
            modes: p.modes}
        let newQuest = await quests.service.create(body);
        await quests.service.update(newQuest._id, {
            accepted: new Date().getTime(),
            status: 'wip',
            deadline: new Date().getTime() + newQuest.timeframe,
            currentParty: p._id 
        });
    }

    let allQuests = await quests.service.query({}, questPopulate, {createdAt: -1}, true);
    res.json(allQuests);

    

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
router.post('/dropQuest/:partyId/:questId', api.isNotSpectator, async (req, res) => {
    let p = await parties.service.query({_id: req.params.partyId}, partyPopulate);
    if (!p) {
        return res.json({error: "Party doesn't exist!"});
    }
    let q = await quests.service.query({ _id: req.params.questId }, questPopulate);
    if(!q.currentParty || q.currentParty.id != p.id){
        return res.json({error: "Invalid request!"});
    }

    if(q.associatedMaps){
        for (let i = 0; i < q.associatedMaps.length; i++) {
            beatmaps.service.update(q.associatedMaps[i]._id, {quest: null});
        }
    }

    const timeWindow = (new Date() - q.accepted) / (24*3600*1000);
    if (timeWindow > 7) {
        for (let i = 0; i < p.members.length; i++) {
            let u = await users.service.query({_id: p.members[i].id});
            users.service.update(p.members[i]._id, {penaltyPoints: (u.penaltyPoints + q.reward)});
        }
    }

    let openQuest = await quests.service.query({ name: q.name, status: 'open' });
    if(openQuest){
        await quests.service.update(openQuest._id, {
            $push: { modes: q.modes }
        });
        await quests.service.remove(req.params.questId);
    }else{
        await quests.service.update(req.params.questId, {
            status: "open",
            currentParty: null,
        });
    }

    let allQuests = await quests.service.query({}, questPopulate, {createdAt: -1}, true);
    res.json(allQuests);

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
