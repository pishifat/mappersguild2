const express = require('express');
const beatmaps = require('../models/beatmap.js');
const api = require('../models/api.js');

const router = express.Router();

router.use(api.isLoggedIn);

const defaultPopulate = [
    { populate: 'host',  display: '_id osuId username' },
    { populate: 'bns',  display: '_id osuId username' },
    { populate: 'modders',  display: '_id osuId username' },
    { populate: 'quest',  display: '_id name art color' },
    { populate: 'song',  display: 'artist title' },
    { innerPopulate: 'tasks',  populate: { path: 'mappers' } },
];
const sort = {quest: -1, createdAt: -1};

/* GET maps page. */
router.get('/', async function(req, res) {
    res.render('beatmapsarchive', { title: 'Maps', script: '../javascripts/mapsarchive.js', isMaps: true, loggedInAs: req.session.osuId });
});

router.get("/relevantInfo", async (req, res) => {
    res.json(await beatmaps.service.query({status: "Ranked"}, defaultPopulate, sort, true));
});


module.exports = router;
