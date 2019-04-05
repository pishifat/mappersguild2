const express = require('express');
const config = require('../../config.json');
const crypto = require('crypto');
const api = require('../models/api.js');
const bnApps = require('../models/bnApp.js');

const router = express.Router();

/* GET bn app page */
router.get('/', async (req, res, next) => {
    res.render('bnapp', { title: 'bn app', script: '../js/bnApp.js', isBnApp: true, layout: 'qatlayout', loggedInAs: req.session.mongoId });
});

/* POST a bn application */
router.post('/apply', api.isLoggedIn, async (req, res, next) => {
    if (req.session.mongoId) {
        let date = new Date();
        date.setDate( date.getDate() - 90 );
        const u = await bnApps.service.query({ $and: [{ osuId: req.session.osuId }, { mode: req.body.mode }, { createdAt: { $gte: date } }] });
        //if req.session.usergroup == qat/bn, query for bn of req.body.mode, then error if returned
        if (!u || u.error) {
            const user = await bnApps.service.create(req.session.osuId, req.session.username, req.body.mode, req.body.mods);
            if (user && !user.error) {
                return res.json({});
            } else {
                return res.json( { error: "Failed to process application!"} );
            }
        } else {
            if(!u.consensus){
                return res.json( { error: 'Your application is still being evaluated!'} );
            }else{
                return res.json( { error: `You may apply for this game mode again on ${new Date(u.createdAt.setDate (u.createdAt.getDate() + 90)).toString().slice(4,15)}.` } );
            }
        }
    }
}, api.isLoggedIn, (req, res) => {
    res.render('error', { message: 'redirected', layout: 'qatlayout'});
});

/* GET 'login' to get user's info */
router.get('/login', async (req, res, next) => {
    if (req.session.osuId && req.session.username) {
        const u = await users.service.query({ osuId: req.session.osuId });
        if (!u || u.error) {
            const user = await users.service.create(req.session.osuId, req.session.username);
            
            if (user && !user.error) {
                req.session.mongoId = user._id;
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
            res.cookie('_state', buffer.toString('hex'), { httpOnly: true });
            res.redirect('/login');
        });
    } else {
        let hashedState = Buffer.from(req.cookies._state).toString('base64');
        res.redirect(`https://osu.ppy.sh/oauth/authorize?response_type=code&client_id=${config.id}&redirect_uri=${encodeURIComponent(config.redirect)}&state=${hashedState}&scope=identify`);
    }
}, api.isLoggedIn, (req, res) => {
    res.render('error', { message: 'redirected', layout: 'qatlayout'});
});

/* GET user's token and user's info to login */
router.get('/callback', async (req, res) => {
    console.log('callback')
    if (!req.query.code || req.query.error) {
        return res.redirect('/qat'); 
    }

    const decodedState = Buffer.from(req.query.state, 'base64').toString('ascii');
    if (decodedState !== req.cookies._state) {
        res.clearCookie('_state');
        return res.status(403).render('error', { message: 'unauthorized' });
    }

    req.clearCookie('_state');
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
        } else if (response.ranked_and_approved_beatmapset_count >= 64 && response.kudosu.total >= 0) { //also check if user is qat/bn
            req.session.username = response.username;
            req.session.osuId = response.id;
            res.redirect('/apply');
        } else { 
            res.render('error', { message: 'bottom text' });
        }
    }
});

module.exports = router;
