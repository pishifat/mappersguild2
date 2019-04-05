const express = require('express');
const bnApps = require('../models/bnApp.js');
const evals = require('../models/evaluation.js');
const users = require('../models/qatUser.js');

const router = express.Router();

/* GET bn app page */
router.get('/', async (req, res, next) => {
    res.render('bneval', { title: 'current bn eval', script: '../javascripts/bnEval.js', isBnEval: true, layout: 'qatlayout' });
});

//population doesnt work???
const defaultPopulate = [
    { populate: 'applicant', display: 'username osuId', model: 'QatUser' },
    { populate: 'evaluations', display: 'evaluator behaviorComment moddingComment vote', model: 'Evaluation' }
];

/* GET applicant listing. */
router.get('/relevantInfo', async (req, res, next) => {
    //let bns = await users.service.query({probation: true}, defaultPopulate, {createdAt: 1}, true );
    res.json({ evaluator: req.session.qatMongoId });
});


/* POST submit or edit eval */
router.post('/submitEval/:id', async (req, res) => {
    if(req.body.evaluationId){
        await evals.service.update(req.body.evaluationId, {behaviorComment: req.body.behaviorComment, moddingComment: req.body.moddingComment, vote: req.body.vote});
    }else{
        let ev = await evals.service.create(req.session.qatMongoId, req.body.behaviorComment, req.body.moddingComment, req.body.vote);
        await bnApps.service.update(req.params.id, {$push: {evaluations: ev._id}});
    }
    let a = await bnApps.service.query({ _id: req.params.id }, defaultPopulate);

    res.json(a)
});

module.exports = router;
