var express = require('express');
var quests = require('../models/quest.js');
var logs = require('../models/log.js');
var notifications = require('../models/notification.js');
var parties = require('../models/party.js');
var beatmaps = require('../models/beatmap.js');
var users = require('../models/user.js');
var api = require('../models/api.js');

var router = express.Router();

router.use(api.isLoggedIn);

const defaultPopulate = [
    { populate: 'assignedParty',  display: 'name' },
    { innerPopulate: 'assignedParty',  populate: { path: 'members leader' } },
    { populate: 'completedMembers',  display: 'username' },
    { innerPopulate: 'associatedMaps',  populate: { path: 'song host' } }
];

/* GET quests page. */
router.get('/', async (req, res, next) => {
    res.render('quests', { 
        title: 'Quests', 
        script: '../javascripts/quests.js', 
        isQuests: true, 
        loggedInAs: req.session.osuId, 
        userTotalPoints: res.locals.userRequest.totalPoints,
        userParty: res.locals.userRequest.currentParty ? res.locals.userRequest.currentParty.name : null,
    });
});

router.get("/relevantInfo", async (req, res, next) => {
    const [openQuests, wipQuests, p] = await Promise.all([
        quests.service.query({status: "open"}, defaultPopulate, {createdAt: -1}, true), 
        quests.service.query({status: "wip"}, defaultPopulate, {accepted: -1}, true),
        parties.service.query({leader: req.session.mongoId})
    ]);
    if(p){
        res.json({
            openQuests: openQuests, 
            wipQuests: wipQuests,
            quest: p.currentQuest,
            rank: p.rank,
            members: p.members, 
            name: p.name
        });
    }else{
        res.json({
            openQuests: openQuests, 
            wipQuests: wipQuests,
            rank: 0,
            members: []
        });
    }
    
});

/* GET current user's quest or null. */
router.get('/currentQuest', async (req, res) => {
    let p = await parties.service.query({leader: req.session.mongoId});
    if (p) {
        res.json({ quest: p.currentQuest, rank: p.rank, members: p.members, name: p.name});
    } else{
        res.json({ quest: "undefined", rank: 0 , members: []})
    }
});

/* POST accepts quest. */
router.post('/acceptQuest/:id', async (req, res) => {
    let p = await parties.service.query({leader: req.session.mongoId});
    if (!p) {
        return res.json({error: "Something went wrong!"});
    }
    let q = await quests.service.query({_id: req.params.id});
    if(q.assignedParty){
        return res.json({error: "Can't accept already assigned quest"});
    }
    let valid = (p.members.length >= q.minParty 
        && p.members.length <= q.maxParty 
        && p.currentQuest == undefined
        && p.rank >= q.minRank);
    if(!valid){
        return res.json({error: "Something went wrong!"});
    }
    await Promise.all([
        parties.service.update(p._id, {currentQuest: q._id}),
        quests.service.update(q._id, {accepted: new Date().getTime()}),
        quests.service.update(q._id, {status: "wip"}),
    ]);
    await quests.service.update(q._id, {deadline: new Date().getTime() + q.timeframe});
    
    q = await quests.service.query({_id: q._id}, defaultPopulate)
    res.json(q);

    logs.service.create(req.session.mongoId, `party "${p.name}" accepted quest "${q.name}"`, q._id, 'quest' );
    p.members.forEach(member => {
        if(member != req.session.mongoId){
            notifications.service.create(q.id, `accepted the quest "${q.name}" for your party`, member, req.session.mongoId);
        }
    });
});

/* POST drops party's quest. */
router.post('/dropQuest/:id', async (req, res) => {
    let p = await parties.service.query({leader: req.session.mongoId});
    let q = await quests.service.query({_id: req.params.id}, defaultPopulate);
    if(!p || !q.assignedParty){
        return res.json({error: "Something went wrong!"});
    }
    if(q.exclusive){
        await quests.service.update(req.params.id, {status: "hidden"});
    }else{
        await quests.service.update(req.params.id, {status: "open"});
    }
    await parties.service.update(p._id, {currentQuest: undefined});
    q = await quests.service.query({_id: req.params.id}, defaultPopulate)
    res.json(q);
    
    for (let i = 0; i < p.members.length; i++) {
        let u = await users.service.query({_id: p.members[i]});
        users.service.update(p.members[i]._id, {penaltyPoints: (u.penaltyPoints + q.reward)});
    }
    let maps = await beatmaps.service.query({}, {}, {}, true);
    for (let i = 0; i < maps.length; i++) {
        if(maps[i].quest && maps[i].quest == q.id){
            beatmaps.service.update(maps[i]._id, {quest: undefined});
        }
    }

    logs.service.create(req.session.mongoId, `party "${p.name}" dropped quest "${q.name}"`, q._id, 'quest' );
    p.members.forEach(member => {
        if(member != req.session.mongoId){
            notifications.service.create(q.id, `dropped the quest "${q.name}" for your party`, member, req.session.mongoId);
        }
    });
});

module.exports = router;
