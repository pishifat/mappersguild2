const express = require('express');
const bnApps = require('../models/bnApp.js');
const evals = require('../models/evaluation.js');
const users = require('../models/qatUser.js');
const api = require('../models/api.js');

const router = express.Router();

router.use(api.isLoggedIn);

/* GET bn app page */
router.get('/', async (req, res, next) => {
    res.render('appeval', { title: 'bn app eval', script: '../javascripts/appEval.js', isAppEval: true, layout: 'qatlayout' });
});

//population
const defaultPopulate = [
    { populate: 'applicant', display: 'username osuId', model: users.QatUser },
    { populate: 'evaluations', display: 'evaluator behaviorComment moddingComment vote', model: evals.Evaluation }
];

const defaultDiscussPopulate = [
    { populate: 'applicant', display: 'username osuId', model: users.QatUser },
    { populate: 'evaluations', display: 'evaluator behaviorComment moddingComment vote', model: evals.Evaluation },
    { innerPopulate: 'evaluations', model: evals.Evaluation, populate: { path: 'evaluator', select: 'username osuId', model: users.QatUser } },
];

/* GET applicant listing. */
router.get('/relevantInfo', async (req, res, next) => {
    const [a, da] = await Promise.all([
        await bnApps.service.query({active: true, discussion: false}, defaultPopulate, {createdAt: 1}, true ),
        await bnApps.service.query({active: true, discussion: true}, defaultDiscussPopulate, {createdAt: 1}, true ),
    ]);
    res.json({ a: a, da: da, evaluator: req.session.qatMongoId });
});


/* POST submit or edit eval */
router.post('/submitEval/:id', async (req, res) => {
    if(req.body.evaluationId){
        await evals.service.update(req.body.evaluationId, {behaviorComment: req.body.behaviorComment, moddingComment: req.body.moddingComment, vote: req.body.vote});
    }else{
        let ev = await evals.service.create(req.session.qatMongoId, req.body.behaviorComment, req.body.moddingComment, req.body.vote);
        a = await bnApps.service.update(req.params.id, {$push: {evaluations: ev._id}});
    }
    if(req.body.discussion){
        res.json(await bnApps.service.query({ _id: req.params.id }, defaultDiscussPopulate));
    }else{
        res.json(await bnApps.service.query({ _id: req.params.id }, defaultPopulate));
    }
});

module.exports = router;
