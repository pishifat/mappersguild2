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
const mapPopulate = [
	{ populate: 'song',  display: 'artist title' },
	{ populate: 'host',  display: 'username osuId' },
	{ innerPopulate: 'tasks',  populate: { path: 'mappers' } },
	];

/* GET page render. */
router.get('/', async (req, res, next) => {
  	res.render('users', { title: 'Users', script: '../javascripts/users.js', isUsers: true, loggedInAs: req.session.username });
});

/* GET users listing. */
router.get('/relevantInfo', async (req, res, next) => {
	const [u, b] = await Promise.all([
		users.service.query({ group: { $ne: 'hidden' }}, defaultPopulate, {}, true),
		beatmaps.service.query({}, mapPopulate, {status: -1}, true)
	])
 	res.json({users: u, userId: req.session.osuId, beatmaps: b});
});

/* GET users with sorting. */
router.get("/:sort", async (req, res, next) => {
  const sortBy = req.params.sort;
  res.json(await users.service.query({ group: { $ne: 'hidden' }}, defaultPopulate, sortBy, true));
});

/* POST switch user notifications */
router.post('/switchInvites', async (req, res) => {
	let u = await users.service.query({_id: req.session.mongoId});
	await users.service.update(req.session.mongoId, {invites: !u.invites});
	u = await users.service.query({_id: req.session.mongoId}, defaultPopulate);
    res.json(u);
});

module.exports = router;
