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

//population
const questPopulate = [
    { innerPopulate: 'parties',  populate: { path: 'members leader' } },
    { populate: 'completedMembers',  display: 'username' },
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
    res.render('new', { 
        title: 'title', 
        subTitle: 'subtitle', 
        script: '../javascripts/new.js', 
        isQuests: true, 
        loggedInAs: req.session.osuId, 
        userTotalPoints: res.locals.userRequest.totalPoints,
        userParty: res.locals.userRequest.currentParty ? res.locals.userRequest.currentParty.name : null,
    });
});

/* GET relevant quest info */
router.get("/relevantInfo", async (req, res, next) => {
    let all = await quests.service.query({ $or: [ { status: 'open' }, { status: 'wip' } ] }, questPopulate, {createdAt: -1}, true);
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
    await quests.service.update(req.params.id, { $pull: { parties: p._id } });
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


module.exports = router;
