const express = require('express');
const api = require('../models/api.js');
const users = require('../models/qatUser.js');

const router = express.Router();

router.use(api.isLoggedIn);

/* GET bn app page */
router.get('/', async (req, res, next) => {
    res.render('qatusers', { 
        title: 'BN/QAT Listing', 
        script: '../javascripts/qatUsers.js', 
        isQatUsers: true, 
        layout: 'qatlayout',
        isBnOrQat: res.locals.userRequest.group == 'bn' || res.locals.userRequest.group == 'qat',
        isQat: res.locals.userRequest.group == 'qat' });
});

//population doesnt work???
const defaultPopulate = [
    { populate: 'applicant', display: 'username osuId' },
    { populate: 'evaluations', display: 'evaluator behaviorComment moddingComment vote' }
];

/* GET applicant listing. */
router.get('/relevantInfo', async (req, res, next) => {
    let u = await users.service.query({$or: [{group: 'qat'}, {group: 'bn'}]}, {}, {createdAt: 1}, true );
    res.json({ users: u, userId: req.session.qatMongoId, userGroup: req.session.qatGroup });
});


/* POST submit or edit eval */
router.post('/switchMediator/', api.isLoggedIn, async (req, res) => {
    let u = await users.service.update(req.session.qatMongoId, { vetoMediator: !res.locals.userRequest.vetoMediator });
    res.json(u);
});

/* POST switch usergroup */
router.post('/switchGroup/:id', api.isLoggedIn, async (req, res) => {
    let u = await users.service.update(req.params.id, { group: req.body.group });
    u = await users.service.update(req.params.id, {probation: []});
    res.json(u);
});

module.exports = router;
