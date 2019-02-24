var express = require('express');
var quests = require('../models/quest.js');
var api = require('../models/api.js');

var router = express.Router();

router.use(api.isLoggedIn);

const defaultPopulate = [
    { populate: 'assignedParty',  display: 'name' },
    { populate: 'completedMembers',  display: 'username osuId' },
    { populate: 'associatedMaps',  display: 'url' },
    { innerPopulate: 'associatedMaps',  populate: { path: 'song host' } }
];

/* GET quests page. */
router.get('/', async (req, res, next) => {
    res.render('questsarchive', { title: 'Quests', script: '../javascripts/questsarchive.js', isQuests: true, loggedInAs: req.session.osuId });
});

router.get("/quests", async (req, res, next) => {
    res.json(await quests.service.query({status: "done"}, defaultPopulate, {completed: -1}, true));
});

module.exports = router;
