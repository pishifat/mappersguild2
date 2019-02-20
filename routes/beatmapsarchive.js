const express = require('express');
const beatmaps = require('../models/beatmap.js');
const quests = require('../models/quest.js');
const api = require('../models/api.js');

const router = express.Router();

router.use(api.isLoggedIn);

const defaultPopulate = [
    { populate: 'host',  display: '_id osuId username' },
    { populate: 'bns',  display: '_id osuId username' },
    { populate: 'modders',  display: '_id osuId username' },
    { populate: 'quest',  display: '_id name' },
    { populate: 'song',  display: 'artist title' },
    { innerPopulate: 'tasks',  populate: { path: 'mappers' } },
];
const questPopulate = [
    { innerPopulate: 'associatedMaps', populate: { path: 'host bns modders song tasks' } },
];
const sort = {createdAt: -1};

/* GET maps page. */
router.get('/', async function(req, res) {
    res.render('beatmapsarchive', { title: 'Maps', script: '../javascripts/mapsarchive.js', isMaps: true, loggedInAs: req.session.username });
});


router.get("/relevantInfo", async (req, res, next) => {
    const [bms, qs] = await Promise.all([
    beatmaps.service.query({status: "Ranked"}, defaultPopulate, sort, true),
    quests.service.query({status: { $ne: 'open'}}, questPopulate, sort, true)
    ]);

    res.json({beatmaps: bms, quests: qs});
});


module.exports = router;
