const express = require('express');
const api = require('../models/api.js');
const questions = require('../models/question.js');
const options = require('../models/option.js');
const users = require('../models/qatUser.js');

const router = express.Router();

router.use(api.isLoggedIn);

/* GET bn app page */
router.get('/', async (req, res, next) => {
    res.render('managetest', { 
        title: 'Manage RC Test', 
        script: '../javascripts/manageTest.js', 
        isManageTest: true, 
        layout: 'qatlayout',
        isBnOrQat: res.locals.userRequest.group == 'bn' || res.locals.userRequest.group == 'qat',
        isQat: res.locals.userRequest.group == 'qat' });
});

//population
const defaultPopulate = [
    { populate: 'options', display: 'content score', model: options.Option },

];

/* GET applicant listing. */
router.get('/load/:type', async (req, res, next) => {
    let q = await questions.service.query({category: req.params.type}, defaultPopulate, {}, true);
    res.json(q);
});


/* POST add question */
router.post('/addQuestion/', async (req, res) => {
    let q = await questions.service.create(req.body.category, req.body.newQuestion, req.body.questionType);
    res.json(q);
});

/* POST edit question */
router.post('/updateQuestion/:id', async (req, res) => {
    let q = await questions.service.update(req.params.id, {content: req.body.newQuestion, questionType: req.body.questionType});
    res.json(q);
});

/* POST add option */
router.post('/addOption/:id', async (req, res) => {
    let o = await options.service.create(req.body.option, req.body.score);
    if(!o){
        return res.json({error: 'Something went wrong!'});
    }
    let q = await questions.service.update(req.params.id, {$push: {options: o.id}});
    q = await questions.service.query({_id: req.params.id}, defaultPopulate);
    res.json(q);
});

module.exports = router;
