const express = require('express');
const api = require('../models/api.js');
const reports = require('../models/report.js');
const users = require('../models/qatUser.js');

const router = express.Router();

/* GET reports page */
router.get('/', async (req, res, next) => {
    res.render('reports', { title: 'report a bn/qat', script: '../js/reports.js', isReports: true, layout: 'qatlayout' });
});


/* POST submit or edit eval */
router.post('/submitReport/', api.isLoggedIn, async (req, res) => {
    let u = await users.service.query({username: new RegExp('^' + req.body.username.trim() + '$', 'i')});
    if(!u){
        return res.json({ error: "Cannot find user! Make sure you spelled it correctly" })
    }
    await reports.service.create(req.session.qatUsername, req.session.qatOsuId, u.id, req.body.reason);
    res.json({});
});

module.exports = router;
