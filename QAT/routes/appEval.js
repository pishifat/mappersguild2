const express = require('express');
const bnApps = require('../models/bnApp.js');

const router = express.Router();

/* GET bn app page */
router.get('/', async (req, res, next) => {
    res.render('appeval', { title: 'bn app eval', script: '../javascripts/appEval.js', isAppEval: true, layout: 'qatlayout' });
});

/* GET applicant listing. */
router.get('/relevantInfo', async (req, res, next) => {
    const [applicants] = await Promise.all([
        bnApps.service.query(
            {},
            {},
            {createdAt: 1},
            true
        )
    ]);
    res.json({ applicants: applicants });
});

module.exports = router;
