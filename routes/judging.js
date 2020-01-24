const express = require('express');
const users = require('../models/user.js');
const entries = require('../models/contest/entry.js');
const contests = require('../models/contest/contest.js');
const judgings = require('../models/contest/judging.js');
const api = require('../models/api.js');

const router = express.Router();

router.use(api.isLoggedIn);
router.use(api.isAdmin);

//population
const entryPopulate = [
    { innerPopulate: 'evaluations',  populate: { path: 'judge' } },
];

/* GET judging page. */
router.get('/', async (req, res, next) => {
    res.render('judging', {
        title: 'Judging',
        script: '../javascripts/judging.js',
        loggedInAs: req.session.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});

router.get('/relevantInfo', async (req, res, next) => {
    //todo: only load contest entries for active contest
    let e = await entries.service.query({}, entryPopulate, {name: 1}, true);
    let c = await contests.service.query({}, { isActive: true }, {name: 1}, true);
    res.json({entries: e, contests: c, userId: req.session.mongoId});
});

/* POST new contest */
router.post('/createContest', async (req, res) => {
    let c = await contests.service.create(req.body.name);
    res.json(c);
});

/* POST new contest entry */
router.post('/createEntry', async (req, res) => {
    let c = await contests.service.query({_id: req.body.contest});
    if(!c){
        return res.json({ error: 'Contest does not exist!' });
    }
    let osuId = parseInt(req.body.osuId);
    let u = await users.service.query({ osuId: osuId });
    if(!u || isNaN(osuId)){
        return res.json({ error: 'User does not exist!' });
    }
    let e = await entries.service.create(req.body.name, u._id);
    await contests.service.update(c.id, { $push: { entries: e } });
    res.json(e);
});

/* POST update entry comment */
router.post('/updateComment/:id', async (req, res) => {
    let e = await entries.service.query({_id: req.params.id}, entryPopulate);
    if(!e){
        return res.json({ error: 'Entry does not exist!' });
    }
    let userEvaluation;
    e.evaluations.forEach(evaluation => {
        if(evaluation.judge.id == req.session.mongoId){
            userEvaluation = evaluation;
        }
    });
    if(!userEvaluation){
        let j = await judgings.service.create(req.session.mongoId, req.body.comment);
        await entries.service.update(e.id, { $push: { evaluations: j } });

    }else{
        await judgings.service.update(userEvaluation.id, { comment: req.body.comment });
    }
    e = await entries.service.query({_id: req.params.id}, entryPopulate);
    res.json(e)
});

/* POST update entry vote */
router.post('/updateVote/:id', async (req, res) => {
    let vote = parseInt(req.body.vote);
    if(isNaN(vote)){
        return res.json({ error: 'NaN'});
    }
    let e = await entries.service.query({_id: req.params.id}, entryPopulate);
    if(!e){
        return res.json({ error: 'Entry does not exist!' });
    }
    let userEvaluation;
    e.evaluations.forEach(evaluation => {
        if(evaluation.judge.id == req.session.mongoId){
            userEvaluation = evaluation;
        }
    });
    if(!userEvaluation){
        let j = await judgings.service.create(req.session.mongoId, null, req.body.vote);
        await entries.service.update(e.id, { $push: { evaluations: j } });

    }else{
        await judgings.service.update(userEvaluation.id, { vote: req.body.vote });
    }
    e = await entries.service.query({_id: req.params.id}, entryPopulate);
    res.json(e)
});

/* POST update entry vote */
router.post('/addJudge/:id', async (req, res) => {
    let c = await contests.service.query({_id: req.params.id});
    if(!c){
        return res.json({ error: 'Contest does not exist!' });
    }
    let osuId = parseInt(req.body.osuId);
    let u = await users.service.query({ osuId: osuId });
    if(!u || isNaN(osuId)){
        return res.json({ error: 'User does not exist!' });
    }
    if(c.judges.includes(u.id)){
        return res.json({ error: 'User is already a judge!' });
    }
    await contests.service.update(c.id, { $push: { judges: u.id } });
    res.json(c);
});


module.exports = router;
