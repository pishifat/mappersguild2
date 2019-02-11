const express = require('express');
const bm = require('../models/beatmap.js');
const quest = require('../models/quest.js');
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

/* GET maps page. */
router.get('/', async function(req, res) {
    res.render('ranked', { title: 'Maps', script: '../javascripts/ranked.js', isMaps: true, loggedInAs: req.session.username });
});


router.get("/relevantInfo", async (req, res, next) => {
    const questPopulate = [{populate: 'associatedMaps', display: 'artist'}];
    const sort = {createdAt: -1};
    const [beatmaps, completeQuests] = await Promise.all([
    bm.service.query({status: "Ranked"}, defaultPopulate, sort, true),
    quest.service.query({status: "done"}, questPopulate, sort, true)
    ]);

    res.json({beatmaps: beatmaps, completeQuests: completeQuests});
});


module.exports = router;
