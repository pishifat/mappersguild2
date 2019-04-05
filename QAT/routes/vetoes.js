const express = require('express');
const api = require('../models/api.js');
const vetoes = require('../models/veto.js');

const router = express.Router();

const defaultPopulate = [
    { populate: 'applicant', display: 'username osuId' },
    { populate: 'evaluations', display: 'evaluator behaviorComment moddingComment vote' },
];

router.use(api.isLoggedIn);
router.use(api.isBnOrQat);

/* GET bn app page */
router.get('/', async (req, res, next) => {
    res.render('vetoes', {
        title: 'vetoes',
        script: '../javascripts/vetoes.js',
        isVetoes: true,
        layout: 'qatlayout',
        isBnOrQat: true,
        isQat: res.locals.userRequest.group == 'qat'
    });
});

/* GET applicant listing. */
router.get('/relevantInfo', async (req, res, next) => {
    let v = await vetoes.service.query({}, {}, { createdAt: 1 }, true);
    res.json({ vetoes: v, userId: req.session.qatMongoId, userGroup: req.session.qatGroup });
});

/* POST create a new veto. */
router.post('/submit', async (req, res, next) => {
    let v = await vetoes.service.create(
        req.session.qatMongoId,
        req.body.beatmapLink,
        req.body.reasonLink,
        req.body.mode
    );
    res.json(v);
});

module.exports = router;
