"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const beatmap_1 = require("../../models/beatmap/beatmap");
const beatmap_2 = require("../../interfaces/beatmap/beatmap");
const task_1 = require("../../models/beatmap/task");
const task_2 = require("../../interfaces/beatmap/task");
const notification_1 = require("../../models/notification");
const log_1 = require("../../models/log");
const log_2 = require("../../interfaces/log");
const middlewares_1 = require("../../helpers/middlewares");
const points_1 = require("../../helpers/points");
const helpers_1 = require("../../helpers/helpers");
const osuApi_1 = require("../../helpers/osuApi");
const middlewares_2 = require("./middlewares");
const beatmapsRouter = express_1.default.Router();
beatmapsRouter.use(middlewares_1.isLoggedIn);
beatmapsRouter.get('/relevantInfo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const hostBeatmaps = yield beatmap_1.BeatmapModel
        .find({
        host: (_a = req.session) === null || _a === void 0 ? void 0 : _a.mongoId,
        mode: res.locals.userRequest.mainMode,
        status: { $ne: beatmap_2.BeatmapStatus.Secret },
    })
        .defaultPopulate()
        .sortByLastest();
    res.json({
        beatmaps: hostBeatmaps,
        mainMode: res.locals.userRequest.mainMode,
    });
}));
beatmapsRouter.get('/searchOnLoad/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const urlBeatmap = yield beatmap_1.BeatmapModel.findOne({ _id: req.params.id, status: { $ne: beatmap_2.BeatmapStatus.Secret } }).defaultPopulate();
    if (!urlBeatmap) {
        return res.json({ error: 'Beatmap ID does not exist!' });
    }
    res.json(urlBeatmap);
}));
beatmapsRouter.get('/guestBeatmaps', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const ownTasks = yield task_1.TaskModel
        .find({ mappers: (_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId })
        .select('_id');
    const userBeatmaps = yield beatmap_1.BeatmapModel
        .find({
        status: { $ne: beatmap_2.BeatmapStatus.Secret },
        $or: [
            {
                tasks: {
                    $in: ownTasks,
                },
            },
            {
                host: (_c = req.session) === null || _c === void 0 ? void 0 : _c.mongoId,
            },
        ],
    })
        .defaultPopulate()
        .sortByLastest();
    res.json({ userBeatmaps });
}));
beatmapsRouter.get('/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    if (!req.query.mode || !req.query.limit) {
        return res.json({ error: 'Missing mode filter...' });
    }
    const mode = req.query.mode;
    const limit = req.query.limit && parseInt(req.query.limit.toString(), 10);
    const status = req.query.status;
    const quest = req.query.quest;
    const search = req.query.search;
    const allBeatmapsQuery = beatmap_1.BeatmapModel.find({
        host: { $ne: (_d = req.session) === null || _d === void 0 ? void 0 : _d.mongoId },
        status: { $ne: beatmap_2.BeatmapStatus.Secret },
    });
    if (mode != 'any') {
        allBeatmapsQuery.or([
            { mode },
            { mode: beatmap_2.BeatmapMode.Hybrid },
        ]);
    }
    if (status && status !== beatmap_2.BeatmapStatus.Secret)
        allBeatmapsQuery.where('status', status);
    if (quest)
        allBeatmapsQuery.exists('quest', false);
    if (!search && limit)
        allBeatmapsQuery.limit(limit);
    let allBeatmaps = yield allBeatmapsQuery.defaultPopulate().sortByLastest();
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
}));
beatmapsRouter.post('/create', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f, _g;
    if (!req.body.song) {
        return res.json({ error: 'Missing song!' });
    }
    if (req.body.tasks.length < 1) {
        return res.json({ error: 'Select at least one difficulty to map!' });
    }
    const tasks = req.body.tasks;
    const createdTasks = [];
    for (let i = 0; i < tasks.length; i++) {
        const t = new task_1.TaskModel();
        t.name = tasks[i];
        t.mappers = (_e = req.session) === null || _e === void 0 ? void 0 : _e.mongoId;
        t.mode = req.body.mode;
        yield t.save();
        createdTasks.push(t._id);
    }
    let locks = [];
    if (req.body.tasksLocked) {
        locks = req.body.tasksLocked;
    }
    const newBeatmap = new beatmap_1.BeatmapModel();
    newBeatmap.host = (_f = req.session) === null || _f === void 0 ? void 0 : _f.mongoId;
    newBeatmap.tasks = createdTasks;
    newBeatmap.tasksLocked = locks;
    newBeatmap.song = req.body.song;
    newBeatmap.mode = req.body.mode;
    newBeatmap.status = req.body.status;
    yield newBeatmap.save();
    if (!newBeatmap) {
        return res.json(helpers_1.defaultErrorMessage);
    }
    const b = yield beatmap_1.BeatmapModel
        .findById(newBeatmap._id)
        .defaultPopulate()
        .orFail();
    res.json(b);
    if (newBeatmap.status == beatmap_2.BeatmapStatus.WIP) {
        log_1.LogModel.generate((_g = req.session) === null || _g === void 0 ? void 0 : _g.mongoId, `created new map "${b.song.artist} - ${b.song.title}"`, log_2.LogCategory.Beatmap);
    }
}));
beatmapsRouter.post('/:id/updateModder', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _h, _j, _k, _l, _m, _o, _p;
    const isAlreadyModder = yield beatmap_1.BeatmapModel.findOne({
        _id: req.params.id,
        modders: (_h = req.session) === null || _h === void 0 ? void 0 : _h.mongoId,
    });
    let update;
    if (isAlreadyModder) {
        update = { $pull: { modders: (_j = req.session) === null || _j === void 0 ? void 0 : _j.mongoId }, queuedForRank: false };
    }
    else {
        update = { $push: { modders: (_k = req.session) === null || _k === void 0 ? void 0 : _k.mongoId }, queuedForRank: false };
    }
    let b = yield beatmap_1.BeatmapModel
        .findById(req.params.id)
        .orFail();
    if (b.status == beatmap_2.BeatmapStatus.Ranked) {
        return res.json({ error: 'Mapset ranked' });
    }
    yield beatmap_1.BeatmapModel.findByIdAndUpdate(req.params.id, update);
    b = yield beatmap_1.BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();
    res.json(b);
    if (b.status !== beatmap_2.BeatmapStatus.Secret) {
        if (isAlreadyModder) {
            log_1.LogModel.generate((_l = req.session) === null || _l === void 0 ? void 0 : _l.mongoId, `removed from modder list on "${b.song.artist} - ${b.song.title}"`, log_2.LogCategory.Beatmap);
            notification_1.NotificationModel.generate(b._id, `removed themself from the modder list of your mapset`, b.host._id, (_m = req.session) === null || _m === void 0 ? void 0 : _m.mongoId, b._id);
        }
        else {
            log_1.LogModel.generate((_o = req.session) === null || _o === void 0 ? void 0 : _o.mongoId, `modded "${b.song.artist} - ${b.song.title}"`, log_2.LogCategory.Beatmap);
            notification_1.NotificationModel.generate(b._id, `modded your mapset`, b.host._id, (_p = req.session) === null || _p === void 0 ? void 0 : _p.mongoId, b._id);
        }
    }
}));
beatmapsRouter.post('/:id/updateBn', middlewares_1.isNotSpectator, middlewares_2.isValidBeatmap, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _q, _r, _s, _t, _u, _v, _w, _x;
    const b = res.locals.beatmap;
    const isAlreadyBn = yield beatmap_1.BeatmapModel.findOne({
        _id: req.params.id,
        bns: (_q = req.session) === null || _q === void 0 ? void 0 : _q.mongoId,
    });
    let update;
    if (isAlreadyBn) {
        update = { $pull: { bns: (_r = req.session) === null || _r === void 0 ? void 0 : _r.mongoId } };
    }
    else if (middlewares_1.isBn((_s = req.session) === null || _s === void 0 ? void 0 : _s.accessToken)) {
        let hasTask = false;
        b.tasks.forEach(task => {
            task.mappers.forEach(mapper => {
                var _a;
                if (mapper.id == ((_a = req.session) === null || _a === void 0 ? void 0 : _a.mongoId)) {
                    hasTask = true;
                }
            });
        });
        if (hasTask) {
            return res.json({ error: `You can't nominate a mapset you've done a task for!` });
        }
        update = { $push: { bns: (_t = req.session) === null || _t === void 0 ? void 0 : _t.mongoId } };
    }
    else {
        return res.json(helpers_1.defaultErrorMessage);
    }
    yield beatmap_1.BeatmapModel.findByIdAndUpdate(req.params.id, update);
    const updatedBeatmap = yield beatmap_1.BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();
    res.json(updatedBeatmap);
    if (updatedBeatmap.status !== beatmap_2.BeatmapStatus.Secret) {
        if (isAlreadyBn) {
            log_1.LogModel.generate((_u = req.session) === null || _u === void 0 ? void 0 : _u.mongoId, `removed from Beatmap Nominator list on "${updatedBeatmap.song.artist} - ${updatedBeatmap.song.title}"`, log_2.LogCategory.Beatmap);
            notification_1.NotificationModel.generate(updatedBeatmap._id, `removed themself from the Beatmap Nominator list on your mapset`, updatedBeatmap.host._id, (_v = req.session) === null || _v === void 0 ? void 0 : _v.mongoId, updatedBeatmap._id);
        }
        else {
            log_1.LogModel.generate((_w = req.session) === null || _w === void 0 ? void 0 : _w.mongoId, `added to Beatmap Nominator list on "${updatedBeatmap.song.artist} - ${updatedBeatmap.song.title}"`, log_2.LogCategory.Beatmap);
            notification_1.NotificationModel.generate(updatedBeatmap._id, `added themself to the Beatmap Nominator list on your mapset`, updatedBeatmap.host._id, (_x = req.session) === null || _x === void 0 ? void 0 : _x.mongoId, updatedBeatmap._id);
        }
    }
}));
beatmapsRouter.get('/:id/findPoints', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const beatmap = yield beatmap_1.BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();
    if (!beatmap.url) {
        return res.json({ error: 'Need a beatmapset link to calculate points!' });
    }
    const beatmapsetId = helpers_1.findBeatmapsetId(beatmap.url);
    if (isNaN(beatmapsetId)) {
        return res.json({ error: 'Need a beatmapset link to calculate points!' });
    }
    const bmInfo = yield osuApi_1.beatmapsetInfo(beatmapsetId);
    if (osuApi_1.isOsuResponseError(bmInfo)) {
        return res.json({ error: helpers_1.defaultErrorMessage });
    }
    const sortOrder = Object.values(task_2.TaskName);
    beatmap.tasks.sort(function (a, b) {
        return sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name);
    });
    const tasksPointsArray = [];
    const lengthNerf = points_1.getLengthNerf(bmInfo.hit_length);
    const seconds = bmInfo.hit_length % 60;
    const minutes = (bmInfo.hit_length - seconds) / 60;
    const lengthDisplay = `${minutes}m${seconds}s`;
    let pointsInfo = `based on ${lengthDisplay} length`;
    const rankedDate = beatmap.status != 'Ranked' ? new Date() : bmInfo.approved_date;
    let validQuest = false;
    let questBonus = 0;
    let totalPoints = 0;
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
    beatmap.tasks.forEach(task => {
        if (task.name != task_2.TaskName.Storyboard) {
            const taskPoints = points_1.findDifficultyPoints(task.name, 1);
            if (beatmap.quest) {
                questBonus = points_1.getQuestBonus(beatmap.quest.deadline, rankedDate, 1);
                validQuest = true;
            }
            const finalPoints = ((taskPoints + questBonus) * lengthNerf);
            totalPoints += finalPoints;
            tasksPointsArray.push(`${task.name}: ${finalPoints.toFixed(1)}`);
            task.mappers.forEach(mapper => {
                const userTaskPoints = points_1.findDifficultyPoints(task.name, task.mappers.length);
                usersPointsArrays.forEach(userArray => {
                    if (userArray[0] == mapper.username) {
                        userArray[1] += Math.round(((userTaskPoints + (questBonus / task.mappers.length)) * lengthNerf) * 10) / 10;
                    }
                });
            });
        }
        else {
            tasksPointsArray.push(`${task.name}: TBD`);
        }
    });
    if (validQuest) {
        pointsInfo += ` + includes ${questBonus == 1 ? questBonus + ' quest bonus point' : questBonus + ' quest bonus points'} per difficulty`;
    }
    res.json({ tasksPointsArray, usersPointsArrays, pointsInfo, totalPoints });
}));
exports.default = beatmapsRouter;
