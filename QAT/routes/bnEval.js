const express = require('express');
const evals = require('../models/evaluation.js');
const evalRounds = require('../models/evalRound.js');
const users = require('../models/qatUser.js');

const router = express.Router();

/* GET bn app page */
router.get('/', async (req, res, next) => {
    res.render('bneval', { title: 'current bn eval', script: '../javascripts/bnEval.js', isBnEval: true, layout: 'qatlayout' });
});

//population doesnt work???
const defaultPopulate = [
    { populate: 'bn', display: 'username osuId', model: 'QatUser' },
    { populate: 'evaluations', display: 'evaluator behaviorComment moddingComment vote', model: 'Evaluation' }
];

/* GET applicant listing. */
router.get('/relevantInfo', async (req, res, next) => {
    let allEvalRounds = await evalRounds.service.query({active: true}, defaultPopulate, {createdAt: 1}, true );
    res.json({ allEvalRounds: allEvalRounds, evaluator: req.session.qatMongoId });
});


async function createEvalRound(userId, mode, deadline){
    let er = await evalRounds.service.query({$and: [{bn: userId}, {mode: mode}, {active: true}]});
    if(!er){
        await evalRounds.service.create(userId, mode, deadline);
    }
}

/* POST submit or edit eval */
router.post('/addEvalRounds/', async (req, res) => {
    let bns;
    let qat;
    if(req.body.probation || req.body.bns){
        bns = await users.service.query(
            {$and: [
                {group: 'bn'},
                {$or: [
                    {modes: 
                        {$elemMatch: 
                            {$eq: req.body.osu && 'osu'},
                        },
                    },
                    {modes: 
                        {$elemMatch: 
                            {$eq: req.body.taiko && 'taiko'},
                        },
                    },
                    {modes: 
                        {$elemMatch: 
                            {$eq: req.body.catch && 'catch'},
                        },
                    },
                    {modes: 
                        {$elemMatch: 
                            {$eq: req.body.mania && 'mania'},
                        },
                    },
                ]},
                {$or: [ //this doesnt work yet
                    {probation: req.body.probation  ? true : false}, 
                    {group: (req.body.probation && req.body.bn) && 'bn'},
                ]},
                /*{$where: function() {
                    if(req.body.probation && !req.body.bn){
                        return this.probation;
                    }else if(!req.body.probation && req.body.bn){
                        return !this.probation;
                    }else{
                        return group == 'bn';
                    }
                }}*/
            ]}, {}, {}, true);
    }
    if(req.body.qat){
        qat = await users.service.query(
            {$and: [
                {group: 'qat'},
                {$or: [
                    {modes: 
                        {$elemMatch: 
                            {$eq: req.body.osu && 'osu'},
                        },
                    },
                    {modes: 
                        {$elemMatch: 
                            {$eq: req.body.taiko && 'taiko'},
                        },
                    },
                    {modes: 
                        {$elemMatch: 
                            {$eq: req.body.catch && 'catch'},
                        },
                    },
                    {modes: 
                        {$elemMatch: 
                            {$eq: req.body.mania && 'mania'},
                        },
                    },
                ]},
            ]}, {}, {}, true);
    }

    let failed = [];
    if(req.body.excludeUsers){
        let excludeUsers =  req.body.excludeUsers.split(',');
        for (let i = 0; i < excludeUsers.length; i++) {
            let u = await users.service.query({username: new RegExp('^' + excludeUsers[i].trim() + '$', 'i')});
            if(u){
                bns.forEach(function(bn, j) {
                    if(bn.id == u.id){
                        bns.splice(j, 1);
                    }
                });
                qat.forEach(function(bn, j) {
                    if(qat.id == u.id){
                        qat.splice(j, 1);
                    }
                });
            }else{
                failed.push(excludeUsers[i].trim());
            }
        }
    }
    if(req.body.includeUsers){
        let includeUsers =  req.body.includeUsers.split(',');
        for (let i = 0; i < includeUsers.length; i++) {
            let u = await users.service.query({username: new RegExp('^' + includeUsers[i].trim() + '$', 'i')});
            if(u){
                for (let j = 0; j < u.modes.length; j++) {
                    if(mode == "osu" && req.body.osu){
                        await createEvalRound(u.id, mode, req.body.deadline);
                    }
                    if(mode == "taiko" && req.body.taiko){
                        await createEvalRound(u.id, mode, req.body.deadline);
                    }
                    if(mode == "catch" && req.body.catch){
                        await createEvalRound(u.id, mode, req.body.deadline);
                    }
                    if(mode == "mania" && req.body.mania){
                        await createEvalRound(u.id, mode, req.body.deadline);
                    }  
                }
            }else{
                failed.push(includeUsers[i].trim());
            }
        }
    }

    if(bns){
        for (let i = 0; i < bns.length; i++) {
            bns[i].modes.forEach(async function(mode) {
                if(mode == "osu" && req.body.osu){
                    await createEvalRound(bns[i].id, mode, req.body.deadline);
                }
                if(mode == "taiko" && req.body.taiko){
                    await createEvalRound(bns[i].id, mode, req.body.deadline);
                }
                if(mode == "catch" && req.body.catch){
                    await createEvalRound(bns[i].id, mode, req.body.deadline);
                }
                if(mode == "mania" && req.body.mania){
                    await createEvalRound(bns[i].id, mode, req.body.deadline);
                }
            });
        }
    }
    if(qat){
        for (let i = 0; i < qat.length; i++) {
            qat[i].modes.forEach(async function(mode) {
                if(mode == "osu" && req.body.osu){
                    await createEvalRound(qat[i].id, mode, req.body.deadline);
                }
                if(mode == "taiko" && req.body.taiko){
                    await createEvalRound(qat[i].id, mode, req.body.deadline);
                }
                if(mode == "catch" && req.body.catch){
                    await createEvalRound(qat[i].id, mode, req.body.deadline);
                }
                if(mode == "mania" && req.body.mania){
                    await createEvalRound(qat[i].id, mode, req.body.deadline);
                }
            });
        }
    }
    let allEvalRounds = await evalRounds.service.query({active: true}, defaultPopulate, {createdAt: 1}, true);
    console.log(allEvalRounds)
    res.json({evalRounds: allEvalRounds, failed: failed})
});

/* POST submit or edit eval */
router.post('/submitEval/:id', async (req, res) => {
    if(req.body.evaluationId){
        await evals.service.update(req.body.evaluationId, {behaviorComment: req.body.behaviorComment, moddingComment: req.body.moddingComment, vote: req.body.vote});
    }else{
        let ev = await evals.service.create(req.session.qatMongoId, req.body.behaviorComment, req.body.moddingComment, req.body.vote);
        await evalRounds.service.update(req.params.id, {$push: {evaluations: ev._id}});
    }
    let er = await evalRounds.service.query({ _id: req.params.id }, defaultPopulate);

    res.json(er)
});

module.exports = router;
