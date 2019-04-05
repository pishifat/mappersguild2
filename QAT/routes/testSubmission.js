const express = require('express');
const api = require('../models/api');
const testSubmission = require('../models/testSubmission');

const router = express.Router();

const defaultPopulate = [
    { populate: 'answers', display: 'question answer', model: testSubmission.Answer },
];

/* GET bn app page */
router.get('/', async (req, res, next) => {
    const test = await testSubmission.service.query({ _id: req.session.qatMongoId, status: { $ne: 'finished' } }, defaultPopulate);
    if (!test || test.error) {
        return res.redirect('/qat');
    }

    res.render('vetoes', {
        questions: test,
        title: 'vetoes',
        script: '../js/testSubmission.js',
        isBnOrQat: res.locals.userRequest.group == 'qat' || res.locals.userRequest.group == 'bn',
        isQat: res.locals.userRequest.group == 'qat'
    });
});

module.exports = router;
