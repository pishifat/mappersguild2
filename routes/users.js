const express = require('express');
const users = require('../models/user.js');
const bm = require('../models/beatmap.js');
const api = require('../models/api.js');

const router = express.Router();

router.use(api.isLoggedIn);

const defaultPopulate = [
  { populate: 'currentParty',  display: 'name' },
  { populate: 'completedQuests',  display: 'name' },
];

/* GET page render. */
router.get('/', async (req, res, next) => {
  res.render('users', { title: 'Users', script: '../javascripts/users.js', isUsers: true, loggedInAs: req.session.username });
});

/* GET users listing. */
router.get('/relevantInfo', async (req, res, next) => {
  const mapPopulate = [
    { populate: 'song',  display: 'artist title' },
    { populate: 'host',  display: 'username osuId' },
    { innerPopulate: 'tasks',  populate: { path: 'mappers' } },
  ];

  const [u, b] = await Promise.all([
    users.service.query({ group: { $ne: 'hidden' }}, defaultPopulate, {}, true),
    bm.service.query({}, mapPopulate, {status: -1}, true)
    ]);
  res.json({users: u, beatmaps: b});
});

/* GET user for extended view. */
router.get("/user/:id", async (req, res, next) => {
  res.json(await users.service.query({osuId: req.params.id}, defaultPopulate));
});

/* GET users with sorting. */
router.get("/:sort", async (req, res, next) => {
  const sortBy = req.params.sort;
  res.json(await users.service.query({ group: { $ne: 'hidden' }}, defaultPopulate, sortBy, true));
});


module.exports = router;
