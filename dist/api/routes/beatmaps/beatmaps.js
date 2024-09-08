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
        update = { $pull: { modders: req.session?.mongoId }, queuedForRank: false };
    }
    else {
        update = { $push: { modders: req.session?.mongoId }, queuedForRank: false };
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
    else if (await middlewares_1.isBn(req.session?.accessToken)) {
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
    const [beatmap, response] = await Promise.all([
        beatmap_1.BeatmapModel
            .findById(req.params.id)
            .defaultPopulate()
            .orFail(),
        osuApi_1.getClientCredentialsGrant(),
    ]);
    // check if token exists
    if (osuApi_1.isOsuResponseError(response)) {
        return res.json(helpers_1.defaultErrorMessage);
    }
    // set token
    const token = response.access_token;
    // check if url is valid
    if (!beatmap.url) {
        return res.json({ error: 'Need a beatmapset link to calculate points!' });
    }
    const beatmapsetId = helpers_1.findBeatmapsetId(beatmap.url);
    if (isNaN(beatmapsetId)) {
        return res.json({ error: 'Need a beatmapset link to calculate points!' });
    }
    // get osu-web beatmap info
    const bmInfo = await osuApi_1.getBeatmapsetV2Info(token, beatmapsetId);
    if (osuApi_1.isOsuResponseError(bmInfo)) {
        return res.json(helpers_1.defaultErrorMessage);
    }
    // sort tasks to expected difficulty scaling
    const sortOrder = Object.values(task_2.TaskName);
    beatmap.tasks.sort(function (a, b) {
        return sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name);
    });
    // set up task points info
    const tasksPointsArray = [];
    const length = helpers_1.getLongestBeatmapLength(bmInfo.beatmaps);
    const lengthNerf = points_1.getLengthNerf(length);
    const seconds = length % 60;
    const minutes = (length - seconds) / 60;
    const lengthDisplay = `${minutes}m${seconds}s`;
    let pointsInfo = `based on ${lengthDisplay} length and ${beatmap.tasks.length} difficulties`;
    const rankedDate = beatmap.status != 'Ranked' ? new Date() : bmInfo.ranked_date;
    let validBonus = true;
    let bonus = 0;
    let totalPoints = 0;
    // set up user points info
    const usersPointsArrays = [];
    const mappers = [];
    beatmap.tasks.forEach(task => {
        task.mappers.forEach(mapper => {
            if (!mappers.includes(mapper.username)) {
                mappers.push(mapper.username);
                usersPointsArrays.push([mapper.username, 0]);
            }
        });
    });
    // calculate points
    beatmap.tasks.forEach(task => {
        // difficulty-specific points
        const taskPoints = points_1.findDifficultyPoints(task.name, 1);
        if (beatmap.quest) {
            bonus = points_1.getQuestBonus(beatmap.quest.deadline, new Date(rankedDate), 1);
            validBonus = true;
        }
        else if (beatmap.mission) {
            bonus = 2;
            validBonus = true;
        }
        else if (beatmap.isShowcase) {
            bonus = 2;
            validBonus = true;
        }
        const finalPoints = ((taskPoints + bonus) * lengthNerf);
        totalPoints += finalPoints;
        tasksPointsArray.push(`${task.name}: ${finalPoints.toFixed(1)}`);
        // user-specific points
        task.mappers.forEach(mapper => {
            const userTaskPoints = points_1.findDifficultyPoints(task.name, task.mappers.length);
            usersPointsArrays.forEach(userArray => {
                if (userArray[0] == mapper.username) {
                    if (task.name == task_2.TaskName.Storyboard) {
                        userArray[1] += Math.round((userTaskPoints / task.mappers.length) * 10) / 10;
                    }
                    else {
                        userArray[1] += Math.round(((userTaskPoints + (bonus / task.mappers.length)) * lengthNerf) * 10) / 10;
                    }
                }
            });
        });
    });
    if (validBonus) {
        pointsInfo += ` + includes ${bonus == 1 ? bonus + ' quest bonus point' : bonus + ' quest bonus points'} per difficulty`;
    }
    // calculate bn points
    let bnPoints = Math.round(points_1.getLengthNerf((length * beatmap.tasks.length) / 1.5) * 10) / 10;
    if (bnPoints < 1) {
        bnPoints = 1;
    }
    res.json({ tasksPointsArray, usersPointsArrays, pointsInfo, totalPoints, bnPoints });
});
exports.default = beatmapsRouter;
