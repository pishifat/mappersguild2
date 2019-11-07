const express = require('express');
const beatmaps = require('../models/beatmap.js');
const api = require('../models/api.js');

const router = express.Router();

router.use(api.isLoggedIn);

const defaultPopulate = [
    { populate: 'host', display: '_id osuId username' },
    { populate: 'bns', display: '_id osuId username' },
    { populate: 'modders', display: '_id osuId username' },
    { populate: 'quest', display: '_id name art color' },
    { populate: 'song', display: 'artist title' },
    { innerPopulate: 'tasks', populate: { path: 'mappers' } },
];
const sort = { quest: -1, createdAt: -1 };

/* GET maps page. */
router.get('/', async function(req, res) {
    res.render('beatmapsarchive', {
        title: 'Maps',
        subTitle: 'Ranked',
        script: '../javascripts/mapsarchive.js',
        isMaps: true,
        loggedInAs: req.session.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});

router.get('/relevantInfo', async (req, res) => {
    /*let date = new Date('September 23, 2019 00:00:00');
    let bmes = await beatmaps.service.query({ status: 'Ranked', updatedAt: {$gte: date} }, defaultPopulate, sort, true);
    bmes.forEach(bm => {
        console.log(bm.url);
        console.log(bm.song.artist);
        console.log(bm.song.title);
        console.log(bm.quest ? bm.quest.name : 'no quest');
        console.log(bm.host.username);
        console.log(bm.mode);
        console.log(bm.updatedAt);
        console.log('')
    });*/
    let bms = await beatmaps.service.query({ status: 'Ranked' }, defaultPopulate, sort, true);
    res.json({beatmaps: bms, username: req.session.username});
});

module.exports = router;
