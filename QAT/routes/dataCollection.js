const express = require('express');
const bnApps = require('../models/bnApp.js');
const evals = require('../models/evaluation.js');
const evalRounds = require('../models/evalRound.js');
const users = require('../models/qatUser.js');
const aiess = require('../models/aiess.js');
const api = require('../models/api.js');

const router = express.Router();

router.use(api.isLoggedIn);

/* GET eval archive page */
router.get('/', async (req, res, next) => {
    res.render('datacollection', { 
        title: 'Data Collection', 
        script: '../javascripts/dataCollection.js', 
        isDataCollection: true, 
        layout: 'qatlayout',
        isBnOrQat: res.locals.userRequest.group == 'bn' || res.locals.userRequest.group == 'qat',
        isQat: res.locals.userRequest.group == 'qat'
    });
});

//population
const defaultAppPopulate = [
    { populate: 'applicant', display: 'username osuId', model: users.QatUser },
    { populate: 'evaluations', display: 'evaluator behaviorComment moddingComment vote', model: evals.Evaluation },
    { innerPopulate: 'evaluations', model: evals.Evaluation, populate: { path: 'evaluator', select: 'username osuId', model: users.QatUser } },
];

const defaultBnPopulate = [
    { populate: 'bn', display: 'username osuId', model: users.QatUser },
    { populate: 'evaluations', display: 'evaluator behaviorComment moddingComment vote', model: evals.Evaluation },
    { innerPopulate: 'evaluations', model: evals.Evaluation, populate: { path: 'evaluator', select: 'username osuId', model: users.QatUser } },
];

/* GET applicant listing. */
router.get('/relevantInfo', async (req, res, next) => {
    let date = new Date();
    date.setDate(date.getDate() - 90);
    let dqs = await aiess.service.query({eventType: 'Disqualified', timestamp: { $gte: date }}, {}, {timestamp: 1}, true);
    let pops = await aiess.service.query({eventType: 'Popped', timestamp: { $gte: date }}, {}, {timestamp: 1}, true);
    res.json({ dqs: dqs, pops: pops });
});


/* POST search for user */
router.post('/search/', async (req, res) => {
    let u = await users.service.query({username: new RegExp('^' + req.body.username.trim() + '$', 'i')});
    if(!u){
        return res.json( { error: 'Cannot find user!'} );
    }
    let a = await bnApps.service.query({applicant: u.id, active: false}, defaultAppPopulate, {createdAt: 1}, true);
    let b = await evalRounds.service.query({bn: u.id, active: false}, defaultBnPopulate, {createdAt: 1}, true);
    res.json({a: a, b: b});
});



module.exports = router;
