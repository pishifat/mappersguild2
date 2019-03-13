const express = require('express');
const bnApps = require('../models/bnApp.js');
const evals = require('../models/evaluation.js');
const users = require('../models/qatUser.js');

const router = express.Router();

/* GET bn app page */
router.get('/', async (req, res, next) => {
    res.render('appeval', { title: 'bn app eval', script: '../javascripts/appEval.js', isAppEval: true, layout: 'qatlayout' });
});

//population doesnt work???
const defaultPopulate = [
    { populate: 'applicant', display: 'username osuId' },
    { populate: 'evaluations', display: 'evaluator behaviorComment moddingComment vote' }
];

/* GET applicant listing. */
router.get('/relevantInfo', async (req, res, next) => {
    let applications = await bnApps.service.query({}, {}, {createdAt: 1}, true );
    res.json({ applications: applications, evaluator: req.session.qatMongoId });
});


/* POST submit or edit eval */
router.post('/submitEval/:id', async (req, res) => {
    let ev = await evals.service.query({$and: [{ application: req.params.id }, {evaluator: req.session.qatMongoId}]});
    if(!ev){
        ev = await evals.service.createAppEval(req.session.qatMongoId, req.body.behaviorComment, req.body.moddingComment, req.body.vote, req.params.id);
        await bnApps.service.update(req.params.id, {$push: {evaluations: ev._id}});
    }else{
        await evals.service.update(ev._id, {behaviorComment: req.body.behaviorComment, moddingComment: req.body.moddingComment, vote: req.body.vote});
    }
    let a = await bnApps.service.query({ _id: req.params.id });

    res.json(a)
});

module.exports = router;
