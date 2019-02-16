const express = require('express');
const users = require('../models/user.js');
const beatmaps = require('../models/beatmap.js');
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
router.get('/users', async (req, res, next) => {
	u = await users.service.query({ group: { $ne: 'hidden' }}, defaultPopulate, {}, true),
 	res.json({users: u});
});

/* GET maps listing for extended info */
router.get('/beatmaps', async (req, res, next) => {
 	const mapPopulate = [
		{ populate: 'song',  display: 'artist title' },
		{ populate: 'host',  display: 'username osuId' },
		{ innerPopulate: 'tasks',  populate: { path: 'mappers' } },
  	];
	b = await beatmaps.service.query({}, mapPopulate, {status: -1}, true);
 	res.json({beatmaps: b});
});

/* GET users with sorting. */
router.get("/:sort", async (req, res, next) => {
  const sortBy = req.params.sort;
  res.json(await users.service.query({ group: { $ne: 'hidden' }}, defaultPopulate, sortBy, true));
});


module.exports = router;
