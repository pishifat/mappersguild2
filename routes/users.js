const express = require('express');
const users = require('../models/user.js');
const beatmaps = require('../models/beatmap.js');
const api = require('../models/api.js');

const router = express.Router();

router.use(api.isLoggedIn);

const defaultPopulate = [
    { populate: 'currentParty', display: 'name' },
    { populate: 'completedQuests', display: 'name completed' },
];
const mapPopulate = [
    { populate: 'song', display: 'artist title' },
    { populate: 'host', display: 'username osuId' },
    { innerPopulate: 'tasks', populate: { path: 'mappers' } },
];

/* GET page render. */
router.get('/', async (req, res, next) => {
    res.render('users', {
        title: 'Users',
        script: '../javascripts/users.js',
        isUsers: true,
        loggedInAs: req.session.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
        userParty: res.locals.userRequest.currentParty ? res.locals.userRequest.currentParty.name : null,
    });
});

/* GET users listing. */
router.get('/relevantInfo', async (req, res, next) => {
    const u = await users.service.query({ group: { $ne: 'hidden' } }, defaultPopulate, { createdAt: -1 }, true);
    res.json({ users: u, userId: req.session.osuId, username: req.session.username });
});

/* GET beatmaps listing. */
router.get('/beatmaps', async (req, res, next) => {
    const b = await beatmaps.service.query({}, mapPopulate, { status: -1 }, true);
    res.json({ beatmaps: b });
});

/* GET users with sorting. */
router.get('/:sort', async (req, res, next) => {
    const sortBy = req.params.sort;
    res.json(await users.service.query({ group: { $ne: 'hidden' } }, defaultPopulate, sortBy, true));
});

/* POST switch user notifications */
router.post('/switchInvites', async (req, res) => {
    let u = await users.service.query({ _id: req.session.mongoId });
    await users.service.update(req.session.mongoId, { invites: !u.invites });
    u = await users.service.query({ _id: req.session.mongoId }, defaultPopulate);
    res.json(u);
});

module.exports = router;
