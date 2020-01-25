const express = require('express');
const logs = require('../models/log.js');
const api = require('../models/api.js');

const router = express.Router();

router.use(api.isLoggedIn);

/* GET logs */
router.get('/', async (req, res, next) => {
    const populate = [{ populate: 'user', display: 'username' }];

    res.render('logs', {
        title: 'Logs',
        script: '../js/logs.js',
        isLogs: true,
        logs: await logs.service.query(
            { category: { $ne: 'error' } },
            populate,
            { createdAt: -1 },
            true,
            100
        ),
        loggedInAs: req.session.osuId,
        isNotSpectator: res.locals.userRequest.group != 'spectator',
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});

router.get('/more/:skip', async (req, res, next) => {
    const populate = [{ populate: 'user', display: 'username' }];

    res.json(await logs.service.query({ category: { $ne: 'error' }}, populate, { createdAt: -1 }, true, 100, parseInt(req.params.skip)));
});

/* POST creates a test log */
router.post('/create', async (req, res, next) => {
    const log = await logs.service.create(
        req.session.mongoId,
        req.body.action,
        req.body.modified,
        req.body.category
    );

    if (log) {
        res.json(log);
    }
});

module.exports = router;