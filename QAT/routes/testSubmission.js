const express = require('express');
const api = require('../models/api');
const testSubmission = require('../models/testSubmission');
const users = require('../models/qatUser');
const questions = require('../models/question');
const options = require('../models/option');

const router = express.Router();

const defaultPopulate = [
    { populate: 'applicant', display: 'username', model: users.QatUser },
    { populate: 'answers', display: 'question optionChose', model: testSubmission.TestAnswer },
    { innerPopulate: 'answers', model: testSubmission.TestAnswer, populate: { 
            path: 'question', model: questions.Question, populate: {
                path: 'options', model: options.Option
            }
        } 
    },
];

/* GET test page */
router.get('/', async (req, res, next) => {
    res.render('testsubmission', {
        title: 'Test Submission',
        script: '../javascripts/testSubmission.js',
        layout: 'qatLayout'
    });
});

/* GET test by user */
router.get('/relevantInfo', async (req, res, next) => {
    const test = await testSubmission.service.query({ 
        applicant: req.session.qatMongoId, 
        status: { $ne: 'finished' },
    }, defaultPopulate, { 'answers.question.category': 1 });
    console.log(test);
    
    if (!test || test.error) {
        return res.redirect('/qat');
    }

    return res.json({ test: test });
});

router.post('/generateTest', async (req, res, next) => {
    await testSubmission.service.create(req.session.qatMongoId, 'osu');
    
    res.redirect('/qat/testSubmission');
});

module.exports = router;
