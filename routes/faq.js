var express = require('express');
var api = require('../models/api.js');

var router = express.Router();

router.use(api.isLoggedIn);

/* GET faq */
router.get('/', async (req, res, next) => {
	if(req.session.osuId){
		res.render('faq', { title: 'Frequently Asked Questions', isFaq: true, loggedInAs: req.session.osuId });
	}else{
		res.render('faq', { title: 'Frequently Asked Questions', isFaq: true });
	}
	
});

module.exports = router;
