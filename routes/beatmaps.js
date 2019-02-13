const express = require('express');
const bm = require('../models/beatmap.js');
const task = require('../models/task.js');
const user = require('../models/user.js');
const quest = require('../models/quest.js');
const party = require('../models/party.js');
const logs = require('../models/log.js');
const featuredArtists = require('../models/featuredArtists.js');
const api = require('../models/api.js');

const router = express.Router();

router.use(api.isLoggedIn);

async function isBeatmapHost(req, res, next) {
    const response = await bm.service.query({ _id: req.params.mapId}, [{ populate: 'host',  display: 'osuId' }]);
    
    if (response && req.session.osuId == response.host.osuId) {
        next();
    } else {
        res.status(403).render('error', { message: 'unauthorized' });
    }
}

const defaultPopulate = [
    { populate: 'host',  display: '_id osuId username' },
    { populate: 'bns',  display: '_id osuId username' },
    { populate: 'modders',  display: '_id osuId username' },
    { populate: 'quest',  display: '_id name' },
    { populate: 'song',  display: 'artist title' },
    { innerPopulate: 'tasks',  populate: { path: 'mappers' } },
];

/* GET maps page. */
router.get('/', async function(req, res) {
    res.render('beatmaps', { title: 'Maps', script: '../javascripts/maps.js', isMaps: true, loggedInAs: req.session.username });
});


router.get("/relevantInfo", async (req, res, next) => {
    const questPopulate = [
        { innerPopulate: 'associatedMaps', populate: { path: 'host bns modders song tasks' } },
    ];
    const sort = {createdAt: -1};
    const [beatmaps, wipQuests, u, fa] = await Promise.all([
        bm.service.query({status: { $ne: 'Ranked'}}, defaultPopulate, sort, true),
        quest.service.query({status: 'wip'}, questPopulate, sort, true),
        user.service.query({osuId: req.session.osuId}),
        featuredArtists.service.query({}, {}, {}, true)
    ]);

    res.json({beatmaps: beatmaps, wipQuests: wipQuests, userId: u.osuId, fa: fa});
});

/* GET artists for new map entry */
router.get("/artists", async (req, res, next) => {
    
});

/* GET songs for new map entry */
router.get("/songs/:labelId", async (req, res, next) => {
    const populate = [{ populate: 'songs',  display: 'artist title' }];
    let fa = await featuredArtists.service.query({_id: req.params.labelId}, populate, {title: -1});
    res.json(fa.songs);
});

/* POST create new map */
router.post('/create', async (req, res) => {
    if (!req.body.song) {
        return res.json({ error: 'Missing song' });
    }

    if (req.body.tasks.length < 1) {
        return res.json({ error: 'Select at least one difficulty to map!' });
    }

    const userSearched = await user.service.query({osuId: req.session.osuId});
    if (userSearched.error) {
        return res.status(500).render('error');
    }

    let tasks = [];
    if (req.body.tasks) {
        tasks = req.body.tasks.split('|');
    }

    let realTasks = [];
    for (let i = 0; i < tasks.length; i++) {
        const t = await task.service.create({ name: tasks[i], mappers: userSearched._id });
        if (t.error) {
            return res.status(500).render('error');
        }
        realTasks.push(t._id);
    }

    let locks = [];
    if (req.body.tasksLocked) {
        locks = req.body.tasksLocked.split('|');
    }

    let song = await featuredArtists.service.querySong({_id: req.body.song});

    if(!song){
        return res.json({ error: 'song not in db' });
    }

    let b = await bm.service.create(userSearched._id, realTasks, locks, req.body.song );

    b = await bm.service.query({ _id: b._id }, defaultPopulate)

    res.json(b);

    logs.service.create(req.session.osuId, `created new map "${b.song.artist} - ${b.song.title}"`, b._id, 'beatmap' );
});

/* POST set game mode. */
router.post("/setMode/:id", async (req, res) => {
    let b = await bm.service.update(req.params.id, {mode: req.body.mode});
    b = await bm.service.query({_id: req.params.id}, defaultPopulate);
    res.json(b);

    logs.service.create(req.session.osuId, `changed mode of "${b.song.artist} - ${b.song.title}" to "${req.body.mode}"`, b._id, 'beatmap' );
});

/* POST transfer host */
router.post("/transferHost/:mapId", async (req, res) => {
    let u;
    try {
        u = await user.service.query({ username: new RegExp("^"+req.body.user+"$", "i") })
    } catch(error) {
        return res.json({ error: error._message });
    }
    if (!u) {
        return res.json({ error: 'Cannot find user!' });
    }
    if(u.osuId == req.session.osuId){
        return res.json({ error: 'Choose someone other than yourself!'})
    }
    let beatmap = await bm.service.update({_id: req.params.mapId}, {host: u._id});
    
    if(!beatmap){
        return res.json({ error: 'Something went wrong!' });
    }

    if(beatmap.quest){
        return res.json({ error: "Disconnect your map from its quest before transferring host!" });
    }

    const isAlreadyModder = await bm.service.query({ _id: req.params.mapId, modders: u._id });
    if (isAlreadyModder) {
        let update = { $pull: { modders: u._id } };
        beatmap = await bm.service.update(req.params.mapId, update);
    }

    const isAlreadyBn = await bm.service.query({ _id: req.params.mapId, bns: u._id });
    if (isAlreadyBn) {
        update = { $pull: { bns: u._id } };
        beatmap = await bm.service.update(req.params.mapId, update);
    }
    let b = await bm.service.query({_id: req.params.mapId}, defaultPopulate);
    res.json(b);

    logs.service.create(req.session.osuId, `transferred host on "${b.song.artist} - ${b.song.title}"`, b._id, 'beatmap' );
});

/* POST create task from extended view. */
router.post("/addTask/:mapId", async (req, res) => {
    const u = await user.service.query({osuId: req.session.osuId});
    let b = await bm.service.query({_id: req.params.mapId}, defaultPopulate);
    if(b.quest){
        let p = await party.service.query({currentQuest: b.quest});
        let valid = false;
        for (let i = 0; i < p.members.length; i++) {
            if(p.members[i].toString() == u._id.toString()){
                valid = true;
                break;
            }
        }
        if(!valid){
            return res.json({error: "This mapset is part of a quest, so only members of the host's party can add difficulties."})
        }
    }

    if(b.tasks.length > 20){
        return res.json({error: "This mapset has too many difficulties!"})
    }

    if(b.tasksLocked && !isBeatmapHost){
        let locked = false;
        b.tasksLocked.forEach(task => {
            if(req.body.difficulty == task){
               locked = true;
            }
        });
        if(locked){
            return res.json({error: "This task is locked by the mapset host"})
        }
    }
    if(req.body.difficulty == "Storyboard"){
        let sb = false;
        b.tasks.forEach(task => {
            if(task.name == "Storyboard"){
                sb = true;
            }
        })
        if(sb){
            return res.json({error: "There can only be one storyboard on a mapset!"});
        }
    }

    const t = await task.service.create({ name: req.body.difficulty, mappers: u._id });
    if (t.error) {
        return res.json(t.error);
    } 

    b = await bm.service.update(req.params.mapId, { $push: {tasks: t._id } });
    if (b.error) {
        return res.json(b.error);
    }

    b = await bm.service.query({_id: req.params.mapId}, defaultPopulate);

    res.json(b);

    logs.service.create(req.session.osuId, `added "${req.body.difficulty}" difficulty to "${b.song.artist} - ${b.song.title}"`, b._id, 'beatmap' );
});

/* POST delete task from extended view. */
router.post("/removeTask/:id", async (req, res) => {
    let t = await task.service.query({_id: req.params.id});
    let b = await bm.service.update(req.body.beatmapId, { $pull: { tasks: t._id } });
    await task.service.remove(req.params.id);

    b = await bm.service.query({_id: req.body.beatmapId}, defaultPopulate);

    res.json(b);

    logs.service.create(req.session.osuId, `removed "${t.name}" from "${b.song.artist} - ${b.song.title}"`, b._id, 'beatmap' );
});

/* POST add collab user to task. */
router.post("/task/:taskId/addCollab", async (req, res) => {
    let u;
    try {
        u = await user.service.query({ username: new RegExp("^"+req.body.user+"$", "i") });
    } catch(error) {
        return res.json({ error: error._message });
    }
    if (!u) {
        return res.json({ error: 'Cannot find user!' });
    }
    if (req.session.username == u.username) {
        return res.json({ error: 'Cannot collaborate with yourself!' });
    }

    let b = await bm.service.query({ tasks: req.params.taskId });
    if(b.quest){
        let p = await party.service.query({currentQuest: b.quest});
        let valid = false;
        for (let i = 0; i < p.members.length; i++) {
            if(p.members[i].toString() == u._id.toString()){
                valid = true;
                break;
            }
        }
        if(!valid){
            return res.json({error: "This mapset is part of a quest, so only members of the host's party can collaborate."})
        }
    }

    let t = await task.service.query({ _id: req.params.taskId, mappers: u._id });
    if (t.length != 0) {
        return res.json({ error: 'You cannot add the same user twice!' });
    }
    t = await task.service.update(req.params.taskId, { $push: { mappers: u._id } });
    b = await bm.service.query({ tasks: t._id }, defaultPopulate);

    res.json(b);

    logs.service.create(req.session.osuId, `added "${u.username}" as collab mapper to "${t.name}" on "${b.song.artist} - ${b.song.title}"`, b._id, 'beatmap' );
});

/* POST remove collab user from task. */
router.post("/task/:taskId/removeCollab", async (req, res) => {
    let u;
    try {
        u = await user.service.query({ username: new RegExp("^"+req.body.user+"$", "i") });
    } catch(error) {
        return res.json({ error: error._message });
    }
    if (!u) {
        return res.json({ error: 'Cannot find user!' });
    }
    if (req.session.username == u.username) {
        return res.json({ error: 'Cannot remove yourself!' });
    }
    
    let t = await task.service.update(req.params.taskId, { $pull: { mappers: u._id } });

    let b = await bm.service.query({ tasks: t._id }, defaultPopulate);
    res.json(b);

    logs.service.create(req.session.osuId, `removed "${u.username}" from collab mapper of "${t.name}" on "${b.song.artist} - ${b.song.title}"`, b._id, 'beatmap' );
});

/* POST set status of the beatmapset from extended view. */
router.post('/setStatus/:mapId', isBeatmapHost, async (req, res) => {
    let b = await bm.service.query({_id: req.params.mapId}, defaultPopulate);
    if(req.body.status == "Done"){
        if(b.tasks.length == 0){
            return res.json({error: "You can't mark an empty mapset as complete!"});
        }
        if(b.tasks.length == 1 && b.tasks[0].name == "Storyboard"){
            return res.json({error: "You can't mark an empty mapset as complete!"});
        }
        for (let i = 0; i < b.tasks.length; i++) {
            await task.service.update(b.tasks[i].id, {status: "Done"});
        }
        await bm.service.update(req.params.mapId, { tasksLocked: ["Easy", "Normal", "Hard", "Insane", "Expert", "Storyboard"]});
    }
    b = await bm.service.update(req.params.mapId, { status: req.body.status });
    
    b = await bm.service.query({_id: req.params.mapId}, defaultPopulate);
    res.json(b);

    logs.service.create(req.session.osuId, `changed status of "${b.song.artist} - ${b.song.title}"`, b._id, 'beatmap' );
});

/* POST set status of the task selected from extended view. */
router.post('/setTaskStatus/:taskId', async (req, res) => {
    let t = await task.service.update(req.params.taskId, { status: req.body.status });
    let b = await bm.service.query({ tasks: t._id }, defaultPopulate);
    res.json(b);
    
    logs.service.create(req.session.osuId, `changed status of "${t.name}" on "${b.song.artist} - ${b.song.title}"`, b._id, 'beatmap' );
});

/* POST quest to map */
router.post('/setQuest/:mapId', isBeatmapHost, async (req, res) => {
    let q;
    let u = await user.service.query({osuId: req.session.osuId});
    let p = await party.service.query({_id: u.currentParty});
    if(p){
        q = p.currentQuest;
    }
    
    if(!q || !u){
        return res.json({error: "You're not assigned to a quest!"});
    }
    let b = await bm.service.query({ _id: req.params.mapId }, defaultPopulate);

    let invalid = false;
    for (let i = 0; i < b.tasks.length; i++) {
        for (let j = 0; j < b.tasks[i].mappers.length; j++) {
            let u = await user.service.query({_id: b.tasks[i].mappers[j]._id});
            if(!u.currentParty || u.currentParty.toString() != p._id.toString()){
                invalid = true;
            }
        }
    }
    if(invalid){
        return res.json({error: "Some of this mapset's mappers are not assigned to your quest!"});
    }
    
    await bm.service.update(req.params.mapId, { quest: q });
    b = await bm.service.query({ _id: req.params.mapId }, defaultPopulate);
    
    res.json(b);

    logs.service.create(req.session.osuId, `linked quest to "${b.song.artist} - ${b.song.title}"`, b._id, 'beatmap' );
});

/* POST remove quest from map */
router.post('/unsetQuest/:mapId', isBeatmapHost, async (req, res) => {
    let b = await bm.service.update(req.params.mapId, { quest: undefined });
    b = await bm.service.query({ _id: req.params.mapId }, defaultPopulate)
    res.json(b);
    logs.service.create(req.session.osuId, `unlinked quest from "${b.song.artist} - ${b.song.title}"`, b._id, 'beatmap' );
});

/* POST modder from extended view, returns new modders list. */
router.post("/updateModder/:mapId", async (req, res) => {
    const u = await user.service.query({osuId: req.session.osuId});
    const isAlreadyModder = await bm.service.query({ _id: req.params.mapId, modders: u._id });
    let update;
    if (!isAlreadyModder) {
        update = { $push: { modders: u._id } };
    } else {
        update = { $pull: { modders: u._id } };
    }

    await bm.service.update(req.params.mapId, update);
    let b = await bm.service.query({ _id: req.params.mapId }, defaultPopulate);
    res.json(b);

    if(isAlreadyModder){
        logs.service.create(req.session.osuId, `removed from modder list on "${b.song.artist} - ${b.song.title}"`, b._id, 'beatmap' );
    }else{
        logs.service.create(req.session.osuId, `added to modder list on "${b.song.artist} - ${b.song.title}"`, b._id, 'beatmap' );
    }
    
});

/* POST bn from extended view, returns new bns list. */
router.post("/updateBn/:mapId", api.isBn, async (req, res) => {
    const u = await user.service.query({osuId: req.session.osuId});
    const isAlreadyBn = await bm.service.query({ _id: req.params.mapId, bns: u._id });
    let update;
    if (!isAlreadyBn) {
        update = { $push: { bns: u._id } };
    } else {
        update = { $pull: { bns: u._id } };
    }

    await bm.service.update(req.params.mapId, update);
    let b = await bm.service.query({ _id: req.params.mapId }, defaultPopulate);
    res.json(b);

    if(isAlreadyBn){
        logs.service.create(req.session.osuId, `removed from Beatmap Nominator list on "${b.song.artist} - ${b.song.title}"`, b._id, 'beatmap' );
    }else{
        logs.service.create(req.session.osuId, `added to Beatmap Nominator list on "${b.song.artist} - ${b.song.title}"`, b._id, 'beatmap' );
    }
});

/* POST edit link from extended view. */
router.post("/setLink/:mapId", isBeatmapHost, async (req, res) => {
    let url = req.body.url;
    if (url.length == 0) {
        url = undefined;
    }
    let regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    if(!(regexp.test(url))){
        return res.json({error: "Not a valid URL"})
    }

    let b = await bm.service.update(req.params.mapId, { url: url });
    b = await bm.service.query({_id: req.params.mapId}, defaultPopulate);
    res.json(b);

    logs.service.create(req.session.osuId, `edited link on "${b.song.artist} - ${b.song.title}"`, b._id, 'beatmap' );
});

/* POST locks task from extended view. */
router.post("/lockTask/:mapId", isBeatmapHost, async (req, res) => {
    let b = await bm.service.update(
        req.params.mapId, 
        { $push: { tasksLocked: req.body.difficulty } }
    );

    b = await bm.service.query({_id: req.params.mapId}, defaultPopulate);
    res.json(b);

    logs.service.create(req.session.osuId, `locked claims for "${req.body.difficulty}" on "${b.song.artist} - ${b.song.title}"`, b._id, 'beatmap' );
});

/* POST unlocks task from extended view. */
router.post("/unlockTask/:mapId", isBeatmapHost, async (req, res) => {
    let b = await bm.service.update(
        req.params.mapId, 
        { $pull: { tasksLocked: req.body.difficulty } }
    );

    b = await bm.service.query({_id: req.params.mapId}, defaultPopulate);
    res.json(b);

    logs.service.create(req.session.osuId, `unlocked claims for "${req.body.difficulty}" on "${b.song.artist} - ${b.song.title}"`, b._id, 'beatmap' );
});

/* POST delete map */
router.post("/delete/:mapId", isBeatmapHost, async (req, res) => {
    let b = await bm.service.remove(req.params.mapId);
    res.json(b);
    logs.service.create(req.session.osuId, `deleted "${b.song.artist} - ${b.song.title}"`, b._id, 'beatmap' );
});


/* GET map for extended admin view (temporary). */
router.get("/beatmap/:mapId", async (req, res) => {
    const params = { _id: req.params.mapId };
    const populate = [
        { populate: 'host',  display: '_id osuId username' },
        { populate: 'bns',  display: '_id osuId username' },
        { populate: 'modders',  display: '_id osuId username' },
        { populate: 'quest',  display: '_id name' },
        { populate: 'song',  display: 'artist title' },
        { innerPopulate: 'tasks',  populate: { path: 'mappers' } },
    ];
    const sort = {createdAt: 1};
    const beatmap = await bm.service.query(params, populate, sort);

    res.json(beatmap);
});

module.exports = router;
