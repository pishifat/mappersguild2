const express = require('express');
const entries = require('../models/contest/entry.js');
const contests = require('../models/contest/contest.js');
const api = require('../models/api.js');

const router = express.Router();

router.use(api.isLoggedIn);
router.use(api.isAdmin);

//population
const defaultPopulate = [
    { populate: 'songs', display: 'artist title' },
    { populate: 'assignedUser', display: 'username osuId' },
]

/* GET parties page. */
router.get('/', async (req, res, next) => {
    res.render('judging', {
        title: 'Judging',
        script: '../javascripts/judging.js',
        loggedInAs: req.session.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});

router.get('/relevantInfo', async (req, res, next) => {
    let e = await entries.service.query({}, defaultPopulate, {entryName: 1}, true);
    res.json({entries: e, userId: req.session.mongoId});
});

/* POST new artist. */
router.post('/createContest', async (req, res) => {
    let c = await contests.service.create(req.body.name);
    res.json(c);
});


module.exports = router;
