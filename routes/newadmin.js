const express = require('express');
const beatmaps = require('../models/beatmap.js');
const tasks = require('../models/task.js');
const quests = require('../models/quest.js');
const parties = require('../models/party.js');
const users = require('../models/user.js');
const logs = require('../models/log.js');
const featuredArtists = require('../models/featuredArtists.js');
const api = require('../models/api.js');

const router = express.Router();

router.use(api.isLoggedIn);
router.use(api.isAdmin);

//population
const mapPopulate = [
    { populate: 'host',  display: '_id osuId username' },
    { populate: 'bns',  display: '_id osuId username' },
    { populate: 'modders',  display: '_id osuId username' },
    { populate: 'quest',  display: '_id name' },
    { populate: 'song',  display: 'artist title' },
    { innerPopulate: 'tasks',  populate: { path: 'mappers' } },
];

const artistPopulate = [
    { populate: 'songs',  display: 'artist title' }
];

/* GET admin page */
router.get('/', async (req, res, next) => {
    res.render('newadmin', { 
        title: 'New Admin', 
        script: '../javascripts/newadmin.js', 
        loggedInAs: req.session.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});

/* GET relevant info for page load */
router.get('/relevantInfo/', async (req, res) => {
    res.json({});
});

/* GET beatmaps */
router.get('/loadBeatmaps/', async (req, res) => {
    let b = await beatmaps.service.query({}, mapPopulate, {status: 1, mode: 1, createdAt: -1}, true);
    res.json({b});
});

/* GET quests */
router.get('/loadQuests/', async (req, res) => {
    let q = await quests.service.query({}, {}, {name: 1}, true);
    res.json({q});
});

/* GET users */
router.get('/loadUsers/', async (req, res) => {
    let u = await users.service.query({}, {}, {username: 1}, true);
    res.json({u});
});

/* POST update user penatly points */
router.post('/updatePenaltyPoints/:id', async (req, res) => {
    await users.service.update(req.params.id, {penaltyPoints: req.body.penaltyPoints});
    let user = await users.service.query({_id: req.params.id});
    res.json(user);

    logs.service.create(req.session.mongoId, `edited penalty points of "${user.username}" to ${req.body.penaltyPoints}`, req.params.id, 'user' );
    
});

/* GET featured artists */
router.get('/loadFeaturedArtists/', async (req, res) => {
    let fa = await featuredArtists.service.query({}, artistPopulate, {osuId: 1, label: 1}, true);
    res.json({fa});
});

/* GET errors */
router.get('/loadErrors/', async (req, res) => {
    let e = await logs.service.query(
        { category: 'error' }, 
        [{ populate: 'user', display: 'username' }], 
        { createdAt: -1 }, 
        true,
        100
    );
    res.json({e});
});


module.exports = router;
