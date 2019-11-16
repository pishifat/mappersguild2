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

/* GET featured artists */
router.get('/loadFeaturedArtists/', async (req, res) => {
    let fa = await featuredArtists.service.query({}, artistPopulate, {osuId: -1}, true);

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
