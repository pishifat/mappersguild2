var express = require('express');
const config = require('../qatConfig.json');
const crypto = require('crypto');
var api = require('../models/api2.js');
var users = require('../models/user2.js')

var router = express.Router();

/* GET bn app page */
router.get('/', async (req, res, next) => {
    res.render('bnapp', { title: 'bn app', isBnApp: true, layout: 'qatlayout' });
});

/* GET user's code to login */
router.get('/login2', async (req, res, next) => {
    if (req.session.osuId && req.session.username) {
        const u = await users.service.query({ osuId: req.session.osuId });
        if (!u || u.error) {
            const user = await users.service.create(req.session.osuId, req.session.username);
        } else {
            req.session.mongoId = u._id;
            return next();
        }
    }

    if (!req.cookies._state) {
        crypto.randomBytes(48, function (err, buffer) {
            res.cookie('_state', buffer.toString('hex')); // , { httpOnly: true }
            res.redirect('/bnApp/login2');
        });
    } else {
        let hashedState = Buffer.from(req.cookies._state).toString('base64');
        res.redirect(`https://osu.ppy.sh/oauth/authorize?response_type=code&client_id=${config.id}&redirect_uri=${encodeURIComponent(config.redirect)}&state=${hashedState}&scope=identify`);
    }
}, api.isLoggedIn, (req, res) => {
    res.render('error', { message: 'redirected' });
});

/* GET user's token and user's info to login */
router.get('/callback2', async (req, res) => {
    if (!req.query.code || req.query.error) {
        return res.redirect('/'); 
    }

    const decodedState = Buffer.from(req.query.state, 'base64').toString('ascii');
    if (decodedState !== req.cookies._state) {
        res.clearCookie('_state');
        return res.status(403).render('error', { message: 'unauthorized' });
    }

    let response = await api.getToken(req.query.code);

    if (response.error) {
        res.status(500).render('error', { message: response.error });
    } else {
        // *1000 because maxAge is miliseconds, oauth is seconds
        req.session.cookie.maxAge = response.expires_in * 1000;
        req.session.accessToken = response.access_token;
        req.session.refreshToken = response.refresh_token;

        response = await api.getUserInfo(req.session.accessToken);

        if (response.error) {
            res.status(500).render('error');
        } else if (response.ranked_and_approved_beatmapset_count >= 100 && response.kudosu.total >= 0) {
            req.session.username = response.username;
            req.session.osuId = response.id;
            res.redirect('/bnApp/login2');
        } else { 
            res.render('error', { message: 'bottom text' });
        }
    }
});

module.exports = router;
