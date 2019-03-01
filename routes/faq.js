var express = require('express');
var api = require('../models/api.js');

var router = express.Router();

/* GET faq */
router.get('/', async (req, res, next) => {
	const u = await users.service.query({ _id: req.session.mongoId });
	if(u){
		res.render('faq', { title: 'Frequently Asked Questions', isFaq: true, loggedInAs: u.osuId });
	}else{
		res.render('faq', { title: 'Frequently Asked Questions', isFaq: true });
	}
	
});

module.exports = router;
