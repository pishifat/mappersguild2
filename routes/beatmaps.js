const express = require('express');
const beatmaps = require('../models/beatmap.js');
const tasks = require('../models/task.js');
const users = require('../models/user.js');
const parties = require('../models/party.js');
const notifications = require('../models/notification.js');
const invites = require('../models/invite.js');
const logs = require('../models/log.js');
const featuredArtists = require('../models/featuredArtists.js');
const api = require('../models/api.js');

const router = express.Router();

router.use(api.isLoggedIn);

//used in addtask, requesttask, addcollab
async function addTaskChecks(userId, b, newDiff, isHost) {
    if (b.tasks.length > 20 && newDiff) {
        return { error: 'This mapset has too many difficulties!' };
    }
    if (newDiff == 'Storyboard') {
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
    if (b.quest) {
        let p = await parties.service.query({ currentQuest: b.quest, members: userId });
        if (!p) {
            return {
                error:
                    "This mapset is part of a quest, so only members of the host's party can add difficulties!",
            };
        }
    }
    const isAlreadyBn = await beatmaps.service.query({ _id: b._id, bns: userId });
    if (isAlreadyBn) {
        return { error: 'Cannot create a difficulty while in BN list!' };
    }
    if (b.tasksLocked && !isHost && newDiff) {
        let locked = false;
        b.tasksLocked.forEach(task => {
            if (newDiff == task) {
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

//query populations
const defaultPopulate = [
    { populate: 'host', display: '_id osuId username' },
    { populate: 'bns', display: '_id osuId username' },
    { populate: 'modders', display: '_id osuId username' },
    { populate: 'quest', display: '_id name art color' },
    { populate: 'song', display: 'artist title' },
    { innerPopulate: 'tasks', populate: { path: 'mappers' } },
];

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
    const u = await users.service.query({ username: new RegExp('^' + req.body.user + '$', 'i') });

    if (!u) {
        return res.json({ error: inviteError + 'Cannot find user!' });
    }

    if (u.osuId == req.session.osuId) {
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
        script: '../javascripts/maps.js',
        isMaps: true,
        loggedInAs: req.session.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
        userParty: res.locals.userRequest.currentParty ? res.locals.userRequest.currentParty.name : null,
    });
});

router.get('/relevantInfo', async (req, res, next) => {
    const bms = await beatmaps.service.query(
            { status: { $ne: 'Ranked' } },
            defaultPopulate,
            { quest: -1, status: 1, updatedAt: -1 },
            true
        );
    res.json({ beatmaps: bms, userId: req.session.osuId });
});

/* GET artists for new map entry */
router.get('/artists/', async (req, res, next) => {
    let fa = await featuredArtists.service.query({}, {}, {}, true);
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

/* POST create new map */
router.post('/create', async (req, res) => {
    if (req.body.song == 'none') {
        return res.json({ error: 'Missing song!' });
    }
    if (req.body.tasks.length < 1) {
        return res.json({ error: 'Select at least one difficulty to map!' });
    }
    let newTasks = req.body.tasks.split('|');
    let realTasks = [];
    for (let i = 0; i < newTasks.length; i++) {
        const t = await tasks.service.create({ name: newTasks[i], mappers: req.session.mongoId });
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
router.post('/addTask/:mapId', isValidBeatmap, async (req, res) => {
    let b = res.locals.beatmap;
    const isHost = b.host.id == req.session.mongoId;
    const valid = await addTaskChecks(
        req.session.mongoId,
        b,
        req.body.difficulty,
        isHost
    );

    if (valid.error) {
        return res.json(valid);
    }

    const t = await tasks.service.create({
        name: req.body.difficulty,
        mappers: req.session.mongoId,
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
router.post('/removeTask/:id', async (req, res) => {
    let b = await beatmaps.service.query({ _id: req.body.beatmapId });
    if (b.status == 'Ranked') {
        return res.json({ error: 'Mapset ranked' });
    }
    let t = await tasks.service.query({ _id: req.params.id });
    if (t.mappers.indexOf(req.session.mongoId) < 0) {
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
router.post('/task/:taskId/addCollab', isValidUser, async (req, res) => {
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
    valid = await addTaskChecks(u.id, b);
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
        b.id
    );
});

/* POST remove collab user from task. */
router.post('/task/:taskId/removeCollab', async (req, res) => {
    let u = await users.service.query({ username: new RegExp('^' + req.body.user + '$', 'i') });
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
router.post('/setTaskStatus/:taskId', async (req, res) => {
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
router.post('/updateModder/:mapId', async (req, res) => {
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
router.post('/updateBn/:mapId', api.isBn, isValidBeatmap, async (req, res) => {
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
router.post('/setMode/:mapId', isValidBeatmap, isBeatmapHost, async (req, res) => {
    let b = await beatmaps.service.update(req.params.mapId, { mode: req.body.mode });
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
router.post('/setStatus/:mapId', isValidBeatmap, isBeatmapHost, async (req, res) => {
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

/* POST transfer host */
router.post('/transferHost/:mapId', isValidUser, isValidBeatmap, isBeatmapHost, async (req, res) => {
    let b = res.locals.beatmap;
    let u = res.locals.user;

    if (b.quest) {
        let p = await parties.service.query({ currentQuest: b.quest, members: u._id });
        if (!p) {
            return res.json({
                error:
                    inviteError +
                    'This mapset is part of a quest, so only members of your party can host.',
            });
        }
    }

    let valid = await inviteChecks(u, req.session.mongoId);
    if (valid.error) {
        return res.json(valid);
    }

    res.json(b);

    invites.service.createMapInvite(
        u.id,
        req.session.mongoId,
        b.id,
        `wants you to host their mapset of`,
        'host',
        b.id
    );
});

/* POST request added task*/
router.post('/requestTask/:mapId', isValidUser, isValidBeatmap, isBeatmapHost, async (req, res) => {
    const u = res.locals.user;
    let b = res.locals.beatmap;

    let valid = await inviteChecks(u, req.session.mongoId);
    if (valid.error) {
        return res.json(valid);
    }
    valid = await addTaskChecks(u.id, b, req.body.difficulty, true);
    if (valid.error) {
        return res.json(valid);
    }
    res.json(b);

    invites.service.createMapInvite(
        u.id,
        req.session.mongoId,
        b.id,
        `wants you to create the difficulty ${req.body.difficulty} for their mapset of`,
        'create a difficulty',
        b.id,
        req.body.difficulty
    );
});

/* POST quest to map */
router.post('/setQuest/:mapId', isValidBeatmap, isBeatmapHost, async (req, res) => {
    let u = await users.service.query({ _id: req.session.mongoId });
    let p = await parties.service.query({ _id: u.currentParty });
    if (!p || !p.currentQuest) {
        return res.json({ error: "You're not assigned to a quest!" });
    }
    let b = res.locals.beatmap;
    let invalid = false;
    for (let i = 0; i < b.tasks.length; i++) {
        for (let j = 0; j < b.tasks[i].mappers.length; j++) {
            let u = await users.service.query({ _id: b.tasks[i].mappers[j]._id });
            if (!u.currentParty || u.currentParty != p.id) {
                invalid = true;
            }
        }
    }
    if (invalid) {
        return res.json({ error: "Some of this mapset's mappers are not assigned to your quest!" });
    }
    await beatmaps.service.update(req.params.mapId, { quest: p.currentQuest });
    b = await beatmaps.service.query({ _id: req.params.mapId }, defaultPopulate);
    res.json(b);

    logs.service.create(
        req.session.mongoId,
        `linked quest to "${b.song.artist} - ${b.song.title}"`,
        b._id,
        'beatmap'
    );
});

/* POST remove quest from map */
router.post('/unsetQuest/:mapId', isValidBeatmap, isBeatmapHost, async (req, res) => {
    let b = res.locals.beatmap;
    await beatmaps.service.update(req.params.mapId, { quest: undefined });
    b = await beatmaps.service.query({ _id: req.params.mapId }, defaultPopulate);
    res.json(b);
    logs.service.create(
        req.session.mongoId,
        `unlinked quest from "${b.song.artist} - ${b.song.title}"`,
        b._id,
        'beatmap'
    );
});

/* POST edit link from extended view. */
router.post('/setLink/:mapId', isValidBeatmap, isBeatmapHost, async (req, res) => {
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
router.post('/lockTask/:mapId', isValidBeatmap, isBeatmapHost, async (req, res) => {
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
router.post('/unlockTask/:mapId', isValidBeatmap, isBeatmapHost, async (req, res) => {
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
router.post('/delete/:mapId', isValidBeatmap, isBeatmapHost, async (req, res) => {
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
