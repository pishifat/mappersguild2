const express = require('express');
const users = require('../models/user.js');
const quests = require('../models/quest.js');
const beatmaps = require('../models/beatmap.js');
const api = require('../models/api.js');

const router = express.Router();

router.use(api.isLoggedIn);

const defaultPopulate = [
    { populate: 'completedQuests', display: 'name completed' },
];
const beatmapPopulate = [
    { populate: 'song', display: 'artist title' },
    { populate: 'host', display: 'username osuId' },
    { innerPopulate: 'tasks', populate: { path: 'mappers' } },
];

const questPopulate = [
    { innerPopulate: 'currentParty',  populate: { path: 'members leader' } }
];

/* GET page render. */
router.get('/', async (req, res, next) => {
    res.render('users', {
        title: 'Users',
        script: '../javascripts/users.js',
        isUsers: true,
        loggedInAs: req.session.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});

/* GET users listing. */
router.get('/relevantInfo', async (req, res, next) => {
    const u = await users.service.query({ group: { $ne: 'spectator' } }, defaultPopulate, { createdAt: -1 }, true);
    res.json({ users: u, userId: req.session.osuId, username: req.session.username, group: res.locals.userRequest.group });
});

/* GET beatmaps listing. */
router.get('/beatmaps', async (req, res, next) => {
    const b = await beatmaps.service.query({}, beatmapPopulate, { status: -1 }, true);
    res.json({ beatmaps: b });
});

/* GET user's quests */
router.get('/findCurrentQuests/:id', async (req, res, next) => {
    const wipQuests = await quests.service.query({status: 'wip'}, questPopulate, { accepted: -1 }, true);
    let currentQuests = [];
    wipQuests.forEach(quest => {
        quest.currentParty.members.forEach(member => {
            if(member.id == req.params.id){
                currentQuests.push(quest);
            }
        })
    })
    res.json({ currentQuests });
});

/* GET users with sorting. */
router.get('/:sort', async (req, res, next) => {
    const sortBy = req.params.sort;
    res.json(await users.service.query({ group: { $ne: 'spectator' } }, defaultPopulate, sortBy, true));
});

/* POST switch user notifications */
router.post('/switchInvites', api.isNotSpectator, async (req, res) => {
    let u = await users.service.query({ _id: req.session.mongoId });
    await users.service.update(req.session.mongoId, { invites: !u.invites });
    u = await users.service.query({ _id: req.session.mongoId }, defaultPopulate);
    res.json(u);
});

module.exports = router;
