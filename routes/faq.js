var express = require('express');
var users = require('../models/user.js');

var router = express.Router();

/* GET faq */
router.get('/', async (req, res, next) => {
    const u = await users.service.query({ _id: req.session.mongoId }, [{ populate: 'currentParty', display: 'name' }]);
    if (u) {
        res.render('faq', {
            title: 'Frequently Asked Questions',
            isFaq: true,
            loggedInAs: u.osuId,
            userTotalPoints: u.totalPoints,
            userParty: u.currentParty ? u.currentParty.name : null,
        });
    } else {
        res.render('faq', { title: 'Frequently Asked Questions', isFaq: true });
    }
});

module.exports = router;
