var express = require('express');
var api = require('../models/api.js');

var router = express.Router();

router.use(api.isLoggedIn);

/* GET faq */
router.get('/', async (req, res, next) => {
	res.render('faq', { title: 'Frequently Asked Questions', isFaq: true, loggedInAs: req.session.username });
});

module.exports = router;
