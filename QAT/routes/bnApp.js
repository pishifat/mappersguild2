const express = require('express');
const config = require('../../config.json');
const crypto = require('crypto');
const api = require('../models/api.js');
const bnApps = require('../models/bnApp.js');
const users = require('../models/qatUser.js');

const router = express.Router();

router.use(api.isLoggedIn);

/* GET bn app page */
router.get('/', async (req, res, next) => {
    let isBnOrQat;
    if (res.locals.userRequest.group == 'bn' || res.locals.userRequest.group == 'qat') {
        isBnOrQat = true;
    }
    res.render('bnapp', {
        title: 'bn app',
        script: '../js/bnApp.js',
        isBnApp: true,
        layout: 'qatlayout',
        loggedInAs: req.session.qatMongoId,
        isBnOrQat: isBnOrQat,
    });
});

/* POST a bn application */
router.post('/apply', async (req, res, next) => {
    if (req.session.qatMongoId) {
        let date = new Date();
        date.setDate(date.getDate() - 90);
        const currentBnApp = await bnApps.service.query({
            $and: [
                { applicant: req.session.qatMongoId },
                { mode: req.body.mode },
                { createdAt: { $gte: date } },
            ],
        });

        if (!currentBnApp || currentBnApp.error) {
            const newBnApp = await bnApps.service.create(
                req.session.qatMongoId,
                req.body.mode,
                req.body.mods
            );
            if (newBnApp && !newBnApp.error) {
                return res.json({});
            } else {
                return res.json({ error: 'Failed to process application!' });
            }
        } else {
            if (currentBnApp.active) {
                return res.json({ error: 'Your application is still being evaluated!' });
            } else {
                return res.json({
                    error: `Your previous application was rejected (check your osu! forum PMs for details). 
                        You may apply for this game mode again on 
                        ${new Date(currentBnApp.createdAt.setDate(currentBnApp.createdAt.getDate() + 90)).toString().slice(4, 15)}.`,
                });
            }
        }
    }
});

module.exports = router;
