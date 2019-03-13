const express = require('express');
const api = require('../models/api.js');
const bnApps = require('../models/bnApp.js');
const evals = require('../models/evaluation.js');
const users = require('../models/qatUser.js');

const router = express.Router();

/* GET bn app page */
router.get('/', async (req, res, next) => {
    res.render('qatusers', { title: 'bn/qat listing', script: '../javascripts/qatUsers.js', isQatUsers: true, layout: 'qatlayout' });
});

//population doesnt work???
const defaultPopulate = [
    { populate: 'applicant', display: 'username osuId' },
    { populate: 'evaluations', display: 'evaluator behaviorComment moddingComment vote' }
];

/* GET applicant listing. */
router.get('/relevantInfo', async (req, res, next) => {
    let u = await users.service.query({}, {}, {createdAt: 1}, true );
    res.json({ users: u, userId: req.session.qatMongoId, userGroup: req.session.qatGroup });
});


/* POST submit or edit eval */
router.post('/switchMediator/:id', api.isLoggedIn, async (req, res) => {
    let u = await users.service.update(req.session.qatMongoId, { vetoMediator: !res.locals.userRequest.vetoMediator });
    res.json(u);
});

module.exports = router;
