"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const beatmap_1 = require("../../models/beatmap/beatmap");
const beatmap_2 = require("../../../interfaces/beatmap/beatmap");
const task_1 = require("../../models/beatmap/task");
const task_2 = require("../../../interfaces/beatmap/task");
const log_1 = require("../../models/log");
const user_1 = require("../../models/user");
const log_2 = require("../../../interfaces/log");
const middlewares_1 = require("../../helpers/middlewares");
const points_1 = require("../../helpers/points");
const helpers_1 = require("../../helpers/helpers");
const osuApi_1 = require("../../helpers/osuApi");
const middlewares_2 = require("./middlewares");
const beatmapsRouter = express_1.default.Router();
beatmapsRouter.use(middlewares_1.isLoggedIn);
/* GET info for page load */
beatmapsRouter.get('/relevantInfo', async (req, res) => {
    const hostBeatmaps = await beatmap_1.BeatmapModel
        .find({
        host: req.session?.mongoId,
        $or: [
            { mode: res.locals.userRequest.mainMode },
            { mode: 'hybrid' },
        ],
    })
        .defaultPopulate()
        .sortByLatest();
    res.json({
        beatmaps: hostBeatmaps,
        mainMode: res.locals.userRequest.mainMode,
    });
});
/* GET map load from URL */
beatmapsRouter.get('/searchOnLoad/:id', async (req, res) => {
    const urlBeatmap = await beatmap_1.BeatmapModel.findOne({ _id: req.params.id }).defaultPopulate();
    if (!urlBeatmap) {
        return res.json({ error: 'Beatmap ID does not exist!' });
    }
    res.json(urlBeatmap);
});
/* GET guest difficulty related beatmaps */
beatmapsRouter.get('/guestBeatmaps', async (req, res) => {
    const ownTasks = await task_1.TaskModel
        .find({ mappers: req.session?.mongoId })
        .select('_id');
    const userBeatmaps = await beatmap_1.BeatmapModel
        .find({
        $or: [
            {
                tasks: {
                    $in: ownTasks,
                },
            },
            {
                host: req.session?.mongoId,
            },
        ],
    })
        .defaultPopulate()
        .sortByLatest();
    res.json({ userBeatmaps });
});
/* GET mode-specific beatmaps */
beatmapsRouter.get('/search', async (req, res) => {
    if (!req.query.mode || !req.query.limit) {
        return res.json({ error: 'Missing mode filter...' });
    }
    const mode = req.query.mode;
    const limit = req.query.limit && parseInt(req.query.limit.toString(), 10);
    const status = req.query.status;
    const quest = req.query.quest;
    const search = req.query.search;
    const allBeatmapsQuery = beatmap_1.BeatmapModel.find({
        host: { $ne: req.session?.mongoId },
    });
    if (mode != 'any') {
        allBeatmapsQuery.or([
            { mode },
            { mode: beatmap_2.BeatmapMode.Hybrid },
        ]);
    }
    if (status)
        allBeatmapsQuery.where('status', status);
    if (quest)
        allBeatmapsQuery.exists('quest', false);
    // this actually returns every map, pretty dumb, need to fix somehow
    if (!search && limit)
        allBeatmapsQuery.limit(limit);
    let allBeatmaps = await allBeatmapsQuery.defaultPopulate().sortByLatest();
    if (search) {
        const tags = search
            .toLowerCase()
            .trim()
            .split(' ')
            .filter(t => t.length);
        allBeatmaps = allBeatmaps.filter(b => {
            let searchableTags = b.song.artist + ' ' + b.song.title + ' ' + b.host.username;
            b.tasks.forEach(task => {
                task.mappers.forEach(mapper => {
                    searchableTags += ' ' + mapper.username;
                });
            });
            searchableTags = searchableTags.toLowerCase();
            return tags.some(t => searchableTags.includes(t));
        });
    }
    res.json({ allBeatmaps });
});
/* POST create new map */
beatmapsRouter.post('/create', async (req, res) => {
    // quick validation
    if (!req.body.song) {
        return res.json({ error: 'Missing song!' });
    }
    if (req.body.tasks.length < 1) {
        return res.json({ error: 'Select at least one difficulty to map!' });
    }
    const difficulties = ['Easy', 'Normal', 'Hard', 'Insane', 'Expert'];
    let hasNoDifficulties = true;
    for (const task of req.body.tasks) {
        if (difficulties.includes(task.name)) {
            hasNoDifficulties = false;
        }
    }
    if (hasNoDifficulties) {
        return res.json({ error: 'Select at least one difficulty to map!' });
    }
    const hitsoundTask = req.body.tasks.find(t => t.name == 'Hitsounds');
    if (hitsoundTask && req.body.mode == 'taiko') {
        return res.json({ error: '"Hitsounds" are not applicable to osu!taiko' });
    }
    // validation done
    const tasks = req.body.tasks;
    const createdTasks = [];
    for (const task of tasks) {
        const t = new task_1.TaskModel();
        t.name = task.name;
        t.mappers = task.mappers.map(u => u.id);
        t.mode = task.name == 'Storyboard' ? 'sb' : task.name == 'Hitsounds' ? 'hs' : req.body.mode == 'hybrid' && task.mode ? task.mode : req.body.mode;
        t.status = task.status;
        await t.save();
        createdTasks.push(t._id);
    }
    let locks = [];
    if (req.body.tasksLocked && req.body.tasksLocked.length) {
        locks = req.body.tasksLocked;
    }
    const newBeatmap = new beatmap_1.BeatmapModel();
    newBeatmap.host = req.session?.mongoId;
    newBeatmap.tasks = createdTasks;
    newBeatmap.tasksLocked = locks;
    newBeatmap.song = req.body.song;
    newBeatmap.mode = req.body.mode;
    newBeatmap.status = beatmap_2.BeatmapStatus.WIP;
    await newBeatmap.save();
    if (!newBeatmap) {
        return res.json(helpers_1.defaultErrorMessage);
    }
    const b = await beatmap_1.BeatmapModel
        .findById(newBeatmap._id)
        .defaultPopulate()
        .orFail();
    res.json(b);
    log_1.LogModel.generate(req.session?.mongoId, `created new map "${b.song.artist} - ${b.song.title}"`, log_2.LogCategory.Beatmap);
});
/* POST validate users from user input */
beatmapsRouter.get('/validateUsers/:userInput', async (req, res) => {
    const userInput = req.params.userInput;
    const usersSplit = userInput.split(',');
    if (!usersSplit.length) {
        return res.json({ error: 'No mapper input' });
    }
    const finalUsers = [];
    for (const user of usersSplit) {
        const validUser = await user_1.UserModel
            .findOne()
            .byUsernameOrOsuId(user);
        if (!validUser) {
            return res.json({ error: `"${user}" doesn't match an existing user.` });
        }
        finalUsers.push(validUser);
    }
    res.json(finalUsers);
});
/* POST modder from extended view, returns new modders list. */
beatmapsRouter.post('/:id/updateModder', async (req, res) => {
    const isAlreadyModder = await beatmap_1.BeatmapModel.findOne({
        _id: req.params.id,
        modders: req.session?.mongoId,
    });
    let update;
    if (isAlreadyModder) {
        update = { $pull: { modders: req.session?.mongoId } };
    }
    else {
        update = { $push: { modders: req.session?.mongoId } };
    }
    let b = await beatmap_1.BeatmapModel
        .findById(req.params.id)
        .orFail();
    if (b.status == beatmap_2.BeatmapStatus.Ranked) {
        return res.json({ error: 'Mapset ranked' });
    }
    await beatmap_1.BeatmapModel.findByIdAndUpdate(req.params.id, update);
    b = await beatmap_1.BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();
    res.json(b);
    if (isAlreadyModder) {
        log_1.LogModel.generate(req.session?.mongoId, `removed from modder list on "${b.song.artist} - ${b.song.title}"`, log_2.LogCategory.Beatmap);
    }
    else {
        log_1.LogModel.generate(req.session?.mongoId, `modded "${b.song.artist} - ${b.song.title}"`, log_2.LogCategory.Beatmap);
    }
});
/* POST bn from extended view, returns new bns list. */
beatmapsRouter.post('/:id/updateBn', middlewares_2.isValidBeatmap, async (req, res) => {
    const b = res.locals.beatmap;
    const isAlreadyBn = await beatmap_1.BeatmapModel.findOne({
        _id: req.params.id,
        bns: req.session?.mongoId,
    });
    let update;
    if (isAlreadyBn) {
        update = { $pull: { bns: req.session?.mongoId } };
    }
    else if (await (0, middlewares_1.isBn)(req.session?.accessToken)) {
        let hasTask = false;
        b.tasks.forEach(task => {
            task.mappers.forEach(mapper => {
                if (mapper.id == req.session?.mongoId) {
                    hasTask = true;
                }
            });
        });
        if (hasTask) {
            return res.json({ error: `You can't nominate a mapset you've done a task for!` });
        }
        update = { $push: { bns: req.session?.mongoId } };
    }
    else {
        return res.json(helpers_1.defaultErrorMessage);
    }
    await beatmap_1.BeatmapModel.findByIdAndUpdate(req.params.id, update);
    const updatedBeatmap = await beatmap_1.BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();
    res.json(updatedBeatmap);
    if (isAlreadyBn) {
        log_1.LogModel.generate(req.session?.mongoId, `removed from Beatmap Nominator list on "${updatedBeatmap.song.artist} - ${updatedBeatmap.song.title}"`, log_2.LogCategory.Beatmap);
    }
    else {
        log_1.LogModel.generate(req.session?.mongoId, `added to Beatmap Nominator list on "${updatedBeatmap.song.artist} - ${updatedBeatmap.song.title}"`, log_2.LogCategory.Beatmap);
    }
});
/* GET calculate points for a given beatmap */
beatmapsRouter.get('/:id/findPoints', async (req, res) => {
    const beatmap = await beatmap_1.BeatmapModel
        .findById(req.params.id)
        .populate(points_1.taskPointsPopulate)
        .populate({ path: 'bns', select: '_id osuId username' })
        .orFail();
    let length = beatmap.length;
    let rankedDate = beatmap.rankedDate;
    // length and rankedDate are only saved after rank. temporarily fetch from api if needed
    if (beatmap.status !== beatmap_2.BeatmapStatus.Ranked || !length || !rankedDate) {
        const beatmapsetId = beatmap.url ? (0, helpers_1.findBeatmapsetId)(beatmap.url) : NaN;
        if (isNaN(beatmapsetId)) {
            return res.json({ error: 'Need a beatmapset link to calculate points!' });
        }
        const response = await (0, osuApi_1.getClientCredentialsGrant)();
        if ((0, osuApi_1.isOsuResponseError)(response)) {
            return res.json(helpers_1.defaultErrorMessage);
        }
        const bmInfo = await (0, osuApi_1.getBeatmapsetV2Info)(response.access_token, beatmapsetId);
        if ((0, osuApi_1.isOsuResponseError)(bmInfo)) {
            return res.json(helpers_1.defaultErrorMessage);
        }
        length = (0, helpers_1.getLongestBeatmapLength)(bmInfo.beatmaps);
        rankedDate = bmInfo.ranked_date ? new Date(bmInfo.ranked_date) : new Date(); // unranked maps are calculated as if they were ranked today
    }
    const lengthNerf = (0, points_1.getLengthNerf)(length);
    // mission winners aren't known until the mission closes. assume map is winner if pending
    const missionPending = beatmap.mission && !beatmap.mission.closingAnnounced;
    const isMissionWinner = missionPending || beatmap.mission?.winningBeatmaps.some(b => b.id == beatmap.id);
    // other ranked mapsets of the same song (for storyboard/skin/hitsound repeats)
    const sameSongBeatmaps = await beatmap_1.BeatmapModel
        .find({
        _id: { $ne: beatmap._id },
        song: beatmap.song,
        status: beatmap_2.BeatmapStatus.Ranked,
    })
        .populate({ path: 'tasks', populate: { path: 'mappers', select: '_id' } });
    // user points relative to this map
    const users = new Map();
    function addPoints(user, points, source) {
        const userPoints = users.get(user.id) || { username: user.username, points: 0, sources: [] };
        userPoints.points += points;
        userPoints.sources.push(`${source}: ${Math.round(points * 10) / 10}`);
        users.set(user.id, userPoints);
    }
    // every type of points earned on this map (left column)
    const sources = [];
    // host
    addPoints(beatmap.host, 3, 'Host');
    sources.push({ name: 'Host', points: 3 });
    // tasks
    const sortOrder = Object.values(task_2.TaskName);
    const sortedTasks = [...beatmap.tasks].sort((a, b) => sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name));
    for (const task of sortedTasks) {
        let taskTotal = 0;
        // quest/mission/showcase bonuses
        let bonus = 0;
        if (beatmap.quest) {
            bonus = (0, points_1.getQuestBonus)(beatmap.quest.deadline, rankedDate, task.mappers.length);
        }
        else if (beatmap.mission) {
            bonus = isMissionWinner ? 2 / task.mappers.length : 0;
        }
        else if (beatmap.isShowcase) {
            bonus = 2 / task.mappers.length;
        }
        for (const mapper of task.mappers) {
            let repeats = 1;
            if (task.name === task_2.TaskName.Storyboard || task.name === task_2.TaskName.Skin || task.name === task_2.TaskName.Hitsounds) {
                repeats += sameSongBeatmaps.filter(b => b.tasks.some(t => t.name == task.name && t.mappers.some(m => m.id == mapper.id))).length;
            }
            const points = (0, points_1.findTaskPoints)(task.name, task.mappers.length, lengthNerf, bonus, repeats);
            taskTotal += points;
            addPoints(mapper, points, task.name);
        }
        sources.push({ name: task.name, points: Math.round(taskTotal * 10) / 10 });
    }
    // quest/mission rewards (only counted once per quest/mission for each user)
    const rewardedMappers = new Set();
    const questPoints = beatmap.quest ? (0, points_1.findQuestPoints)(beatmap.quest.deadline, beatmap.quest.completed || rankedDate, rankedDate) : 0;
    const missionPoints = beatmap.mission && isMissionWinner ? (0, points_1.findMissionPoints)(beatmap.mission.tier) : 0;
    for (const task of sortedTasks) {
        for (const mapper of task.mappers) {
            if (rewardedMappers.has(mapper.id))
                continue;
            if (questPoints) {
                rewardedMappers.add(mapper.id);
                addPoints(mapper, questPoints, 'Quest reward');
            }
            else if (missionPoints && task.name !== task_2.TaskName.Hitsounds && task.name !== task_2.TaskName.Storyboard && task.name !== task_2.TaskName.Skin) {
                rewardedMappers.add(mapper.id);
                addPoints(mapper, missionPoints, 'Mission reward');
            }
        }
    }
    if (rewardedMappers.size) {
        sources.push({ name: questPoints ? 'Quest reward (per mapper)' : 'Mission reward (per mapper)', points: questPoints || missionPoints });
    }
    // modders + nominators
    const modders = beatmap.modders.filter(modder => !beatmap.bns.some(bn => bn.id == modder.id));
    for (const modder of modders) {
        addPoints(modder, 1, 'Mod');
    }
    if (modders.length) {
        sources.push({ name: 'Mod (per modder)', points: 1 });
    }
    const nominatorPoints = (0, points_1.findNominatorPoints)(length, beatmap.tasks.length);
    for (const bn of beatmap.bns) {
        addPoints(bn, nominatorPoints, 'Nomination');
    }
    if (beatmap.bns.length) {
        sources.push({ name: 'Nomination (per BN)', points: Math.round(nominatorPoints * 10) / 10 });
    }
    // the text
    const seconds = length % 60;
    const minutes = (length - seconds) / 60;
    let pointsInfo = `based on ${minutes}m${seconds}s length`;
    if (beatmap.quest) {
        pointsInfo += `, including ~${(0, points_1.getQuestBonus)(beatmap.quest.deadline, rankedDate, 1)} quest bonus points per difficulty`;
    }
    else if (beatmap.mission) {
        pointsInfo += missionPending ? ', including ~2 mission bonus points per difficulty (assuming winner)' : '';
    }
    else if (beatmap.isShowcase) {
        pointsInfo += ', including ~2 showcase bonus points per difficulty';
    }
    const usersPoints = [];
    for (const userPoints of users.values()) {
        usersPoints.push({ ...userPoints, points: Math.round(userPoints.points * 10) / 10 });
    }
    res.json({
        sources,
        usersPoints,
        pointsInfo,
    });
});
exports.default = beatmapsRouter;
