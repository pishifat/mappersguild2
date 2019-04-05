const express = require('express');
const config = require('../../config.json');
const crypto = require('crypto');
const api = require('../models/api.js');
const users = require('../models/user.js');

const router = express.Router();

/* GET bn app page */
router.get('/', async (req, res, next) => {
    res.render('bnapp', { title: 'bn app', isBnApp: true, layout: 'qatlayout' });
});

/* GET user's code to login */
router.get('/login', async (req, res, next) => {
    if (req.session.osuId && req.session.username) {
        const u = await users.service.query({ osuId: req.session.osuId });
        
        if (!u || u.error) {
            const user = await users.service.create(req.session.osuId, req.session.username);
            if (user && !user.error) {
                return next();
            } else {
                return res.status(500).render('error', { message: 'Something went wrong!' });
            }
        } else {
            req.session.mongoId = u._id;
            return next();
        }
    }

    if (!req.cookies._state) {
        crypto.randomBytes(48, function (err, buffer) {
            res.cookie('_state', buffer.toString('hex')); //, { httpOnly: true }
            res.redirect('/login');
        });
    } else {
        let hashedState = Buffer.from(req.cookies._state).toString('base64');
        res.redirect(`https://osu.ppy.sh/oauth/authorize?response_type=code&client_id=${config.qat.id}&redirect_uri=${encodeURIComponent(config.qat.redirect)}&state=${hashedState}&scope=identify`);
    }
}, api.isLoggedIn, (req, res) => {
    res.render('error', { message: 'redirected' });
});

/* GET user's token and user's info to login */
router.get('/callback', async (req, res) => {
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
        } else if (response.ranked_and_approved_beatmapset_count >= 50 && response.kudosu.total >= 0) {
            req.session.username = response.username;
            req.session.osuId = response.id;
            res.redirect('/login');
        } else { 
            res.render('error', { message: 'bottom text' });
        }
    }
});

module.exports = router;
