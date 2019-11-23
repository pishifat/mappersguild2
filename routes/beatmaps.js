const express = require('express');
const beatmaps = require('../models/beatmap.js');
const tasks = require('../models/task.js');
const users = require('../models/user.js');
const parties = require('../models/party.js');
const quests = require('../models/quest.js');
const notifications = require('../models/notification.js');
const invites = require('../models/invite.js');
const logs = require('../models/log.js');
const featuredArtists = require('../models/featuredArtists.js');
const api = require('../models/api.js');

const router = express.Router();

router.use(api.isLoggedIn);

//query populations
const defaultPopulate = [
    { populate: 'host', display: '_id osuId username' },
    { populate: 'bns', display: '_id osuId username' },
    { populate: 'modders', display: '_id osuId username' },
    { populate: 'quest', display: '_id name art color modes' },
    { populate: 'song', display: 'artist title' },
    { innerPopulate: 'tasks', populate: { path: 'mappers' } },
];

const questPopulate = [
    { innerPopulate: 'parties',  populate: { path: 'members leader' } },
    { innerPopulate: 'currentParty',  populate: { path: 'members leader' } },
    { populate: 'completedMembers',  display: 'username osuId rank' },
    { innerPopulate: 'associatedMaps',  populate: { path: 'song host' } }
];

//used in addtask, requesttask, addcollab
async function addTaskChecks(userId, b, taskName, taskMode, isHost) {
    if(!isHost) isHost = (b.host._id.toString() == req.session.mongoId);
    if (b.tasks.length > 20 && taskName) {
        return { error: 'This mapset has too many difficulties!' };
    }
    if (taskName == 'Storyboard') {
        let sb = false;
        b.tasks.forEach(task => {
            if (task.name == 'Storyboard') {
                sb = true;
            }
        });
        if (sb) {
            return { error: 'There can only be one storyboard on a mapset!' };
        }
    }
    if (b.quest && taskName != 'Storyboard') {
        let q = await quests.service.query({ _id: b.quest }, questPopulate);
        let validMapper = false;
        q.currentParty.members.forEach(member => {
            if(member.id == userId){
                validMapper = true;
            }
        });
        if (!validMapper) {
            return { error: "This mapset is part of a quest, so only members of the quest's current party can add difficulties!" };
        }
        if(taskMode && !b.quest.modes.includes(taskMode)){
            return { error: "The selected quest doesn't support beatmaps of this mode!" };
        }
    }
    const isAlreadyBn = await beatmaps.service.query({ _id: b._id, bns: userId });
    if (isAlreadyBn) {
        return { error: 'Cannot create a difficulty while in BN list!' };
    }
    if (b.tasksLocked && !isHost && taskName) {
        let locked = false;
        b.tasksLocked.forEach(task => {
            if (taskName == task) {
                locked = true;
            }
        });
        if (locked) {
            return { error: 'This task is locked by the mapset host!' };
        }
    }
    return true;
}

let inviteError = 'Invite not sent: ';
async function inviteChecks(u, senderId) {
    if (!u.invites) {
        return { error: inviteError + 'User has invites disabled!' };
    }
    let recipientInvites = await invites.service.query(
        { recipient: u._id, visible: true },
        {},
        {},
        true
    );
    if (recipientInvites.length > 2) {
        return { error: inviteError + 'User has too many pending invites!' };
    }
    let senderInvite = await invites.service.query({
        recipient: u._id,
        sender: senderId,
        visible: true,
    });
    if (senderInvite) {
        return {
            error:
                inviteError +
                'Wait for the user to reply to your previous invite before sending another!',
        };
    }
    return true;
}


//#region middlewares
async function isValidBeatmap(req, res, next) {
    const b = await beatmaps.service.query({ _id: req.params.mapId }, defaultPopulate);

    if (!b || b.error) {
        return res.json({ error: 'Something went wrong!' });
    }

    if (b.status == 'Ranked') {
        return res.json({ error: 'Mapset ranked' });
    }

    res.locals.beatmap = b;
    next();
}

async function isBeatmapHost(req, res, next) {
    if (req.session.mongoId != res.locals.beatmap.host.id) {
        return res.json({ error: 'You are not mapset host!' });
    }
    next();
}

async function isValidUser(req, res, next) {
    let u;
    if(req.body.user.indexOf("[") >= 0 || req.body.user.indexOf("]") >= 0){
        u = await users.service.query({ username: new RegExp('^\\' + req.body.user + '$', 'i') });
    }else{
        u = await users.service.query({ username: new RegExp('^' + req.body.user + '$', 'i') });
    }
        
    if (!u) {
        return res.json({ error: inviteError + 'Cannot find user!' });
    }

    if (u.osuId == req.session.osuId && req.session.osuId != 3178418) {
        return res.json({ error: inviteError + 'Choose someone other than yourself!' });
    }

    res.locals.user = u;
    next();
}

//#endregion

/* GET maps page. */
router.get('/', async function(req, res) {
    res.render('beatmaps', {
        title: 'Maps',
        subTitle: 'WIP/Pending',
        script: '../javascripts/maps.js',
        isMaps: true,
        loggedInAs: req.session.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});

router.get('/relevantInfo', async (req, res, next) => {
    const bms = await beatmaps.service.query(
            { status: { $ne: 'Ranked' } },
            defaultPopulate,
            { quest: -1, status: 1, updatedAt: -1 },
            true
        );
    res.json({ beatmaps: bms, userId: req.session.osuId, username: req.session.username, group: res.locals.userRequest.group });
});

/* GET artists for new map entry */
router.get('/artists/', async (req, res, next) => {
    let fa = await featuredArtists.service.query({osuId: {$exists: true}}, {}, {}, true);
    res.json(fa);
});

/* GET songs for new map entry */
router.get('/songs/:labelId', async (req, res, next) => {
    let fa = await featuredArtists.service.query(
        { _id: req.params.labelId },
        [{ populate: 'songs', display: 'artist title' }],
        { title: -1 }
    );
    res.json(fa.songs);
});

/* GET quests for linking quest to beatmap */
router.get('/findUserQuests/', async (req, res, next) => {
    let p = await parties.service.query({ members: req.session.mongoId }, {}, {}, true);
    let q = await quests.service.query({ status: 'wip' }, {}, {}, true);
    let userQuests = [];
    q.forEach(quest => {
        p.forEach(party => {
            if(quest.currentParty.toString() == party.id){
                userQuests.push(quest);
            }
        });
    });
    
    res.json({userQuests});
});

/* POST create new map */
router.post('/create', api.isNotSpectator, async (req, res) => {
    if (req.body.song == 'none') {
        return res.json({ error: 'Missing song!' });
    }
    if (req.body.tasks.length < 1) {
        return res.json({ error: 'Select at least one difficulty to map!' });
    }
    let newTasks = req.body.tasks.split('|');
    let realTasks = [];
    for (let i = 0; i < newTasks.length; i++) {
        const t = await tasks.service.create({ name: newTasks[i], mappers: req.session.mongoId, mode: req.body.mode });
        if (!t) {
            return res.json({ error: 'Missing task!' });
        }
        realTasks.push(t._id);
    }
    let locks = [];
    if (req.body.tasksLocked) {
        locks = req.body.tasksLocked.split('|');
    }
    let b = await beatmaps.service.create(req.session.mongoId, realTasks, locks, req.body.song, req.body.mode);
    b = await beatmaps.service.query({ _id: b._id }, defaultPopulate);
    res.json(b);

    logs.service.create(
        req.session.mongoId,
        `created new map "${b.song.artist} - ${b.song.title}"`,
        b._id,
        'beatmap'
    );
});

/* POST create task from extended view. */
router.post('/addTask/:mapId', api.isNotSpectator, isValidBeatmap, async (req, res) => {
    let b = res.locals.beatmap;
    const isHost = b.host.id == req.session.mongoId;
    const valid = await addTaskChecks(
        req.session.mongoId,
        b,
        req.body.difficulty,
        req.body.mode,
        isHost
    );

    if (valid.error) {
        return res.json(valid);
    }
    let mode = req.body.mode;
    if(!mode){
        mode = b.mode;
    }
    if(req.body.difficulty == "Storyboard"){
        mode = 'sb';
    }

    const t = await tasks.service.create({
        name: req.body.difficulty,
        mappers: req.session.mongoId,
        mode: mode
    });
    
    await beatmaps.service.update(req.params.mapId, { $push: { tasks: t._id } });
    b = await beatmaps.service.query({ _id: req.params.mapId }, defaultPopulate);
    
    res.json(b);

    logs.service.create(
        req.session.mongoId,
        `added "${req.body.difficulty}" difficulty to "${b.song.artist} - ${b.song.title}"`,
        b._id,
        'beatmap'
    );
    if (!isHost) {
        notifications.service.create(
            b.id,
            `added "${req.body.difficulty}" difficulty to your mapset`,
            b.host.id,
            req.session.mongoId,
            b.id
        );
    }
});


/* POST delete task from extended view. */
router.post('/removeTask/:id', api.isNotSpectator, async (req, res) => {
    let b = await beatmaps.service.query({ _id: req.body.beatmapId });
    if (b.status == 'Ranked') {
        return res.json({ error: 'Mapset ranked' });
    }
    let t = await tasks.service.query({ _id: req.params.id });
    if (t.mappers.indexOf(req.session.mongoId) < 0 && b.host != req.session.mongoId) {
        return res.json({ error: 'Not mapper' });
    }
    b = await beatmaps.service.update(req.body.beatmapId, { $pull: { tasks: t._id } });
    await tasks.service.remove(req.params.id);
    b = await beatmaps.service.query({ _id: req.body.beatmapId }, defaultPopulate);
    res.json(b);

    logs.service.create(
        req.session.mongoId,
        `removed "${t.name}" from "${b.song.artist} - ${b.song.title}"`,
        b._id,
        'beatmap'
    );
    if (b.host.id != req.session.mongoId) {
        notifications.service.create(
            b.id,
            `removed task "${t.name}" from your mapset`,
            b.host.id,
            req.session.mongoId,
            b.id
        );
    }
});

/* POST invite collab user to task. */
router.post('/task/:taskId/addCollab', api.isNotSpectator, isValidUser, async (req, res) => {
    let u = res.locals.user;
    let valid = await inviteChecks(u, req.session.mongoId);
    if (valid.error) {
        return res.json(valid);
    }
    let t = await tasks.service.query({ _id: req.params.taskId, mappers: u._id });
    if (t.length != 0) {
        return res.json({ error: inviteError + 'User is already a collaborator' });
    }
    let b = await beatmaps.service.query({ tasks: req.params.taskId }, defaultPopulate);
    if(!req.body.mode) {
        req.body.mode = b.mode;
    }
    valid = await addTaskChecks(u.id, b, req.body.difficulty, req.body.mode);
    if (valid.error) {
        return res.json(valid);
    }
    if (b.status == 'Ranked') {
        return res.json({ error: 'Mapset ranked' });
    }
    t = await tasks.service.query({ _id: req.params.taskId });
    res.json(b);

    invites.service.createMapInvite(
        u.id,
        req.session.mongoId,
        req.params.taskId,
        `wants to collaborate with you on the "${t.name}" difficulty of`,
        'collaborate in a difficulty',
        b.id,
        req.body.difficulty,
        req.body.mode
    );
});

/* POST remove collab user from task. */
router.post('/task/:taskId/removeCollab', api.isNotSpectator, async (req, res) => {
    let u;
    if(req.body.user.indexOf("[") >= 0 || req.body.user.indexOf("]") >= 0){
        u = await users.service.query({ username: new RegExp('^\\' + req.body.user + '$', 'i') });
    }else{
        u = await users.service.query({ username: new RegExp('^' + req.body.user + '$', 'i') });
    }
    if (!u) {
        return res.json({ error: 'Cannot find user!' });
    }
    let b = await beatmaps.service.query({ tasks: t._id });
    if (b.status == 'Ranked') {
        return res.json({ error: 'Mapset ranked' });
    }
    let t = await tasks.service.query({ _id: req.params.taskId });
    if (t.mappers.indexOf(req.session.mongoId) < 0) {
        return res.json({ error: 'Not mapper' });
    }
    t = await tasks.service.update(req.params.taskId, { $pull: { mappers: u._id } });
    b = await beatmaps.service.query({ _id: b._id }, defaultPopulate);
    res.json(b);

    logs.service.create(
        req.session.mongoId,
        `removed "${u.username}" from collab mapper of "${t.name}" on "${b.song.artist} - ${
            b.song.title
        }"`,
        b._id,
        'beatmap'
    );
});

/* POST set status of the task selected from extended view. */
router.post('/setTaskStatus/:taskId', api.isNotSpectator, async (req, res) => {
    let t = await tasks.service.query({ _id: req.params.taskId });
    let b = await beatmaps.service.query({ tasks: t._id }, defaultPopulate);
    if (t.mappers.indexOf(req.session.mongoId) < 0 && req.session.mongoId != b.host.id) {
        return res.json({ error: 'Not mapper' });
    }
    if (b.status == 'Ranked') {
        return res.json({ error: 'Mapset ranked' });
    }
    t = await tasks.service.update(req.params.taskId, { status: req.body.status });
    b = await beatmaps.service.query({ _id: b._id }, defaultPopulate);
    res.json(b);

    logs.service.create(
        req.session.mongoId,
        `changed status of "${t.name}" on "${b.song.artist} - ${b.song.title}"`,
        b._id,
        'beatmap'
    );
    if (b.host.id != req.session.mongoId) {
        notifications.service.create(
            b.id,
            `changed status of "${t.name}" on your mapset`,
            b.host.id,
            req.session.mongoId,
            b.id
        );
    }
});

/* POST modder from extended view, returns new modders list. */
router.post('/updateModder/:mapId', api.isNotSpectator, async (req, res) => {
    const isAlreadyModder = await beatmaps.service.query({
        _id: req.params.mapId,
        modders: req.session.mongoId,
    });
    let update;
    if (!isAlreadyModder) {
        update = { $push: { modders: req.session.mongoId } };
    } else {
        update = { $pull: { modders: req.session.mongoId } };
    }
    let b = await beatmaps.service.query({ _id: req.params.mapId });
    if (b.status == 'Ranked') {
        return res.json({ error: 'Mapset ranked' });
    }
    await beatmaps.service.update(req.params.mapId, update);
    b = await beatmaps.service.query({ _id: req.params.mapId }, defaultPopulate);
    res.json(b);

    if (isAlreadyModder) {
        logs.service.create(
            req.session.mongoId,
            `removed from modder list on "${b.song.artist} - ${b.song.title}"`,
            b._id,
            'beatmap'
        );
        notifications.service.create(
            b.id,
            `removed themself from the modder list of your mapset`,
            b.host.id,
            req.session.mongoId,
            b.id
        );
    } else {
        logs.service.create(
            req.session.mongoId,
            `modded "${b.song.artist} - ${b.song.title}"`,
            b._id,
            'beatmap'
        );
        notifications.service.create(
            b.id,
            `modded your mapset`,
            b.host.id,
            req.session.mongoId,
            b.id
        );
    }
});

/* POST bn from extended view, returns new bns list. */
router.post('/updateBn/:mapId', api.isNotSpectator, api.isBn, isValidBeatmap, async (req, res) => {
    let b = res.locals.beatmap;
    const isAlreadyBn = await beatmaps.service.query({
        _id: req.params.mapId,
        bns: req.session.mongoId,
    });
    let update;
    if (!isAlreadyBn) {
        let hasTask = false;
        b.tasks.forEach(task => {
            task.mappers.forEach(mapper => {
                if (mapper.id == req.session.mongoId) {
                    hasTask = true;
                }
            });
        });
        if (hasTask) {
            return res.json({ error: "You can't nominate a mapset you've done a task for!" });
        }
        update = { $push: { bns: req.session.mongoId } };
    } else {
        update = { $pull: { bns: req.session.mongoId } };
    }

    await beatmaps.service.update(req.params.mapId, update);
    b = await beatmaps.service.query({ _id: req.params.mapId }, defaultPopulate);
    res.json(b);

    if (isAlreadyBn) {
        logs.service.create(
            req.session.mongoId,
            `removed from Beatmap Nominator list on "${b.song.artist} - ${b.song.title}"`,
            b._id,
            'beatmap'
        );
        notifications.service.create(
            b.id,
            `removed themself from the Beatmap Nominator list on your mapset`,
            b.host.id,
            req.session.mongoId,
            b.id
        );
    } else {
        logs.service.create(
            req.session.mongoId,
            `added to Beatmap Nominator list on "${b.song.artist} - ${b.song.title}"`,
            b._id,
            'beatmap'
        );
        notifications.service.create(
            b.id,
            `added themself to the Beatmap Nominator list on your mapset`,
            b.host.id,
            req.session.mongoId,
            b.id
        );
    }
});

//#region Host exclusive routes

/* POST set game mode. */
router.post('/setMode/:mapId', api.isNotSpectator, isValidBeatmap, isBeatmapHost, async (req, res) => {
    let b = await beatmaps.service.query({ _id: req.params.mapId }, defaultPopulate);
    if(req.body.mode != 'hybrid'){
        if(b.quest && !b.quest.modes.includes(req.body.mode)){
            return res.json({ error: "The selected quest doesn't support beatmaps of this mode!" });
        }
        for (let i = 0; i < b.tasks.length; i++) {
            const task = b.tasks[i];
            await tasks.service.update(task.id, { mode: req.body.mode });
        }
    }
    await beatmaps.service.update(req.params.mapId, { mode: req.body.mode });
    b = await beatmaps.service.query({ _id: req.params.mapId }, defaultPopulate);
    res.json(b);

    logs.service.create(
        req.session.mongoId,
        `changed mode of "${b.song.artist} - ${b.song.title}" to "${req.body.mode}"`,
        b._id,
        'beatmap'
    );
});

/* POST set status of the beatmapset from extended view. */
router.post('/setStatus/:mapId', api.isNotSpectator, isValidBeatmap, isBeatmapHost, async (req, res) => {
    let b = res.locals.beatmap;

    if (req.body.status == 'Done') {
        if (b.tasks.length == 0) {
            return res.json({ error: "You can't mark an empty mapset as complete!" });
        }
        if (b.tasks.length == 1 && b.tasks[0].name == 'Storyboard') {
            return res.json({ error: "You can't mark a mapset without difficulties as complete!" });
        }
        for (let i = 0; i < b.tasks.length; i++) {
            await tasks.service.update(b.tasks[i].id, { status: 'Done' });
        }
        await beatmaps.service.update(req.params.mapId, {
            tasksLocked: ['Easy', 'Normal', 'Hard', 'Insane', 'Expert', 'Storyboard'],
        });
    }

    await beatmaps.service.update(req.params.mapId, { status: req.body.status });
    b = await beatmaps.service.query({ _id: req.params.mapId }, defaultPopulate);
    res.json(b);

    logs.service.create(
        req.session.mongoId,
        `changed status of "${b.song.artist} - ${b.song.title}"`,
        b._id,
        'beatmap'
    );
});

/* POST request added task*/
router.post('/requestTask/:mapId', api.isNotSpectator, isValidUser, isValidBeatmap, isBeatmapHost, async (req, res) => {
    const u = res.locals.user;
    let b = res.locals.beatmap;

    let valid = await inviteChecks(u, req.session.mongoId);
    if (valid.error) {
        return res.json(valid);
    }
    valid = await addTaskChecks(u.id, b, req.body.difficulty, req.body.mode, true);
    if (valid.error) {
        return res.json(valid);
    }
    res.json(b);

    invites.service.createMapInvite(
        u.id,
        req.session.mongoId,
        b.id,
        `wants you to create the ${req.body.difficulty != "Storyboard" ? req.body.mode + " difficulty" : "task"} ${req.body.difficulty} for their mapset of`,
        'create a difficulty',
        b.id,
        req.body.difficulty,
        req.body.mode
    );
});

/* POST quest to map */
router.post('/saveQuest/:mapId', api.isNotSpectator, isValidBeatmap, isBeatmapHost, async (req, res) => {
    let b = res.locals.beatmap;
    if(req.body.questId.length){
        let q = await quests.service.query({ _id: req.body.questId}, [{ populate: 'currentParty',  display: 'members' }]);
        let invalidMapper = false;
        let invalidMode = false;
        for (let i = 0; i < b.tasks.length; i++) {
            let task = b.tasks[i];
            if(q.modes.indexOf(task.mode) < 0){
                invalidMode = true;
            }
            for (let j = 0; j < task.mappers.length; j++) {
                let u = await users.service.query({ _id: task.mappers[j]._id });
                if (q.currentParty.members.indexOf(u._id) < 0) {
                    invalidMapper = true;
                }
            }
        }
        if (invalidMapper) {
            return res.json({ error: "Some of this mapset's mappers are not assigned to your quest!" });
        }
        if (invalidMode) {
            return res.json({ error: "Some of this mapset's difficulties are not the correct mode for this quest!" });
        }
    }else{
        await beatmaps.service.update(req.params.mapId, { quest: null });
    }
    
    await beatmaps.service.update(req.params.mapId, { quest: req.body.questId });
    b = await beatmaps.service.query({ _id: req.params.mapId }, defaultPopulate);
    res.json(b);

    logs.service.create(
        req.session.mongoId,
        `${req.body.questId.length ? 'linked quest to' : 'unlinked quest from'} "${b.song.artist} - ${b.song.title}"`,
        b._id,
        'beatmap'
    );
});

/* POST edit link from extended view. */
router.post('/setLink/:mapId', api.isNotSpectator, isValidBeatmap, isBeatmapHost, async (req, res) => {
    let url = req.body.url;
    if (url.length == 0) {
        url = undefined;
    }
    let regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    if (!regexp.test(url)) {
        return res.json({ error: 'Not a valid URL' });
    }
    let b = res.locals.beatmap;
    await beatmaps.service.update(req.params.mapId, { url: url });
    b = await beatmaps.service.query({ _id: req.params.mapId }, defaultPopulate);
    res.json(b);

    logs.service.create(
        req.session.mongoId,
        `edited link on "${b.song.artist} - ${b.song.title}"`,
        b._id,
        'beatmap'
    );
});

/* POST locks task from extended view. */
router.post('/lockTask/:mapId', api.isNotSpectator, isValidBeatmap, isBeatmapHost, async (req, res) => {
    let b = res.locals.beatmap;
    await beatmaps.service.update(req.params.mapId, {
        $push: { tasksLocked: req.body.difficulty },
    });
    b = await beatmaps.service.query({ _id: req.params.mapId }, defaultPopulate);
    res.json(b);

    logs.service.create(
        req.session.mongoId,
        `locked claims for "${req.body.difficulty}" on "${b.song.artist} - ${b.song.title}"`,
        b._id,
        'beatmap'
    );
});

/* POST unlocks task from extended view. */
router.post('/unlockTask/:mapId', api.isNotSpectator, isValidBeatmap, isBeatmapHost, async (req, res) => {
    let b = res.locals.beatmap;
    await beatmaps.service.update(req.params.mapId, {
        $pull: { tasksLocked: req.body.difficulty },
    });
    b = await beatmaps.service.query({ _id: req.params.mapId }, defaultPopulate);
    res.json(b);

    logs.service.create(
        req.session.mongoId,
        `unlocked claims for "${req.body.difficulty}" on "${b.song.artist} - ${b.song.title}"`,
        b._id,
        'beatmap'
    );
});

/* POST delete map */
router.post('/delete/:mapId', api.isNotSpectator, isValidBeatmap, isBeatmapHost, async (req, res) => {
    let b = res.locals.beatmap;
    for (let i = 0; i < b.tasks.length; i++) {
        await tasks.service.remove(b.tasks[i]);
    }
    await beatmaps.service.remove(req.params.mapId);
    res.json(b);

    logs.service.create(
        req.session.mongoId,
        `deleted "${b.song.artist} - ${b.song.title}"`,
        b._id,
        'beatmap'
    );
});

//#endregion

module.exports = router;
