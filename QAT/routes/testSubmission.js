const express = require('express');
const api = require('../models/api');
const testSubmission = require('../models/testSubmission');

const router = express.Router();

const defaultPopulate = [
    { populate: 'answers', display: 'question answer', model: testSubmission.Answer },
];

/* GET bn app page */
router.get('/', async (req, res, next) => {
    const test = await testSubmission.service.query({ applicant: req.session.qatMongoId, status: { $ne: 'finished' } }, defaultPopulate);
    console.log(test);
    
    if (!test || test.error) {
        return res.redirect('/qat');
    }

    res.render('testsubmission', {
        questions: test,
        title: 'Test Submission',
        script: '../js/testSubmission.js',
        layout: 'qatLayout'
    });
});

router.post('/generateTest', async (req, res, next) => {
    console.log('generating test');
    
    await testSubmission.service.create(req.session.qatMongoId, 'osu');
    
    res.redirect('/qat/testSubmission');
});

module.exports = router;
