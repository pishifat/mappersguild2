const express = require('express');
const users = require('../models/user.js');

const router = express.Router();

/* GET faq */
router.get('/', async (req, res, next) => {
    const u = await users.service.query({ _id: req.session.mongoId });
    if (u) {
        res.render('faq', {
            title: 'Frequently Asked Questions',
            isFaq: true,
            loggedInAs: u.osuId,
            userTotalPoints: u.totalPoints,
        });
    } else {
        res.render('faq', { title: 'Frequently Asked Questions', isFaq: true });
    }
});

module.exports = router;
