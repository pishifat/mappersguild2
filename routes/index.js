const express = require('express');
const config = require('../config.json');
const crypto = require('crypto');
const api = require('../models/api.js');
const users = require('../models/user');
const logs = require('../models/log');

const router = express.Router();

/* GET landing page. */
router.get('/', async (req, res, next) => {
    if (req.session.osuId) {
        const u = await users.service.query({ _id: req.session.mongoId });
        
        if (u && !u.error && u.group != 'hidden') {
            return next();
        }
    }
    res.render('index', { title: `Mappers' Guild`, isIndex: true });
}, api.isLoggedIn, (req, res) => {
    res.render('index', { title: `Mappers' Guild`, isIndex: true, loggedInAs: req.session.osuId });
});

/* GET user's code to login */
router.get('/login', async (req, res, next) => {
    if (req.session.osuId && req.session.username) {
        const u = await users.service.query({ osuId: req.session.osuId });
        if (!u || u.error) {
            const user = await users.service.create(req.session.osuId, req.session.username);
            
            if (user && !user.error) {
                req.session.mongoId = user._id;
                logs.service.create(req.session.osuId, `joined the Mappers' Guild`, user._id, 'user');
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
            res.cookie('_state', buffer.toString('hex')); // , { httpOnly: true }
            res.redirect('/login');
        });
    } else {
        let hashedState = Buffer.from(req.cookies._state).toString('base64');
        res.redirect(`https://osu.ppy.sh/oauth/authorize?response_type=code&client_id=${config.id}&redirect_uri=${encodeURIComponent(config.redirect)}&state=${hashedState}&scope=identify`);
    }
}, api.isLoggedIn, (req, res) => {
    res.redirect('/faq'); 
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
        } else if (response.ranked_and_approved_beatmapset_count >= 3 && response.kudosu.total >= 0) {
            req.session.username = response.username;
            req.session.osuId = response.id;
            res.redirect('/login');
        } else { 
            let u = await users.service.query({ osuId: response.id });
            if(u){ //exception for the old mg users who dont meet requirements
                req.session.username = response.username;
                req.session.osuId = response.id;
                res.redirect('/login');
            }else{
                res.status(403).render('error', { message: 'You did not meet the requirements!' });
            }
        }
    }
});

module.exports = router;
