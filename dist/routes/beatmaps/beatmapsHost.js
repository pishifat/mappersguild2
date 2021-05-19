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
const log_1 = require("../../models/log");
const log_2 = require("../../interfaces/log");
const middlewares_1 = require("../../helpers/middlewares");
const middlewares_2 = require("./middlewares");
const user_1 = require("../../models/user");
const quest_1 = require("../../models/quest");
const beatmapsHostRouter = express_1.default.Router();
beatmapsHostRouter.use(middlewares_1.isLoggedIn);
beatmapsHostRouter.post('/:id/setMode', middlewares_2.isValidBeatmap, middlewares_2.isBeatmapHost, middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let b = res.locals.beatmap;
    if (req.body.mode != beatmap_2.BeatmapMode.Hybrid) {
        if (b.quest && !b.quest.modes.includes(req.body.mode)) {
            return res.json({ error: `The selected quest doesn't support beatmaps of this mode!` });
        }
        for (let i = 0; i < b.tasks.length; i++) {
            const task = b.tasks[i];
            task.mode = req.body.mode;
            yield task.save();
        }
    }
    b.mode = req.body.mode;
    yield b.save();
    b = yield beatmap_1.BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();
    res.json(b);
    if (b.status !== beatmap_2.BeatmapStatus.Secret) {
        log_1.LogModel.generate((_a = req.session) === null || _a === void 0 ? void 0 : _a.mongoId, `changed mode of "${b.song.artist} - ${b.song.title}" to "${req.body.mode}"`, log_2.LogCategory.Beatmap);
    }
}));
beatmapsHostRouter.post('/:id/setStatus', middlewares_2.isValidBeatmap, middlewares_2.isBeatmapHost, middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const validBeatmap = res.locals.beatmap;
    if (validBeatmap.status == beatmap_2.BeatmapStatus.Secret) {
        return res.json({ error: 'Cannot change status of secret map!' });
    }
    if (req.body.status == beatmap_2.BeatmapStatus.Done) {
        if (validBeatmap.tasks.length == 0) {
            return res.json({ error: `You can't mark an empty mapset as complete!` });
        }
        if (validBeatmap.tasks.length == 1 && validBeatmap.tasks[0].name == task_2.TaskName.Storyboard) {
            return res.json({ error: `You can't mark a mapset without difficulties as complete!` });
        }
        for (let i = 0; i < validBeatmap.tasks.length; i++) {
            const task = validBeatmap.tasks[i];
            task.status = task_2.TaskStatus.Done;
            yield task.save();
        }
        validBeatmap.tasksLocked = Object.values(task_2.TaskName);
        yield validBeatmap.save();
    }
    validBeatmap.status = req.body.status;
    yield validBeatmap.save();
    const updatedBeatmap = yield beatmap_1.BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();
    res.json(updatedBeatmap);
    log_1.LogModel.generate((_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId, `changed status of "${updatedBeatmap.song.artist} - ${updatedBeatmap.song.title}"`, log_2.LogCategory.Beatmap);
}));
beatmapsHostRouter.post('/:id/linkQuest', middlewares_2.isValidBeatmap, middlewares_2.isBeatmapHost, middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    let beatmap = res.locals.beatmap;
    const questId = req.body.questId;
    if (beatmap.status === beatmap_2.BeatmapStatus.Secret) {
        return res.json({ error: 'Cannot add quest to secret beatmap!' });
    }
    if (questId) {
        const quest = yield quest_1.QuestModel
            .findById(questId)
            .populate({
            path: 'parties',
            populate: { path: 'members' },
        })
            .orFail();
        for (const task of beatmap.tasks) {
            if (!quest.modes.includes(task.mode) && task.mode !== 'sb') {
                return res.json({ error: `Some of this mapset's difficulties are not the correct mode for this quest!` });
            }
            for (const mapper of task.mappers) {
                const user = yield user_1.UserModel
                    .findById(mapper._id)
                    .orFail();
                if (!((_c = quest.currentParty) === null || _c === void 0 ? void 0 : _c.members.some(m => m.id == user.id))) {
                    return res.json({ error: `Some of this mapset's mappers are not assigned to your quest!` });
                }
            }
        }
        beatmap.quest = quest;
    }
    else {
        beatmap.quest = undefined;
    }
    yield beatmap.save();
    beatmap = yield beatmap_1.BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();
    res.json(beatmap);
    log_1.LogModel.generate((_d = req.session) === null || _d === void 0 ? void 0 : _d.mongoId, `${req.body.questId.length ? 'linked quest to' : 'unlinked quest from'} "${beatmap.song.artist} - ${beatmap.song.title}"`, log_2.LogCategory.Beatmap);
}));
beatmapsHostRouter.post('/:id/setLink', middlewares_2.isValidBeatmap, middlewares_2.isBeatmapHost, middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    let url = req.body.url;
    if (!(url === null || url === void 0 ? void 0 : url.length)) {
        url = null;
    }
    const regexp = /^(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
    if (!regexp.test(url) && url) {
        return res.json({ error: 'Not a valid URL' });
    }
    let b = res.locals.beatmap;
    b.url = url;
    yield b.save();
    b = yield beatmap_1.BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();
    res.json(b);
    if (b.status !== beatmap_2.BeatmapStatus.Secret) {
        log_1.LogModel.generate((_e = req.session) === null || _e === void 0 ? void 0 : _e.mongoId, `edited link on "${b.song.artist} - ${b.song.title}"`, log_2.LogCategory.Beatmap);
    }
}));
beatmapsHostRouter.post('/:id/lockTask', middlewares_2.isValidBeatmap, middlewares_2.isBeatmapHost, middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    if (!req.body.task) {
        return res.json({ error: 'Not a valid task' });
    }
    let b = res.locals.beatmap;
    b.tasksLocked.push(req.body.task);
    yield b.save();
    b = yield beatmap_1.BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();
    res.json(b);
    if (b.status !== beatmap_2.BeatmapStatus.Secret) {
        log_1.LogModel.generate((_f = req.session) === null || _f === void 0 ? void 0 : _f.mongoId, `locked claims for "${req.body.task}" on "${b.song.artist} - ${b.song.title}"`, log_2.LogCategory.Beatmap);
    }
}));
beatmapsHostRouter.post('/:id/unlockTask', middlewares_2.isValidBeatmap, middlewares_2.isBeatmapHost, middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    yield beatmap_1.BeatmapModel.findByIdAndUpdate(req.params.id, {
        $pull: { tasksLocked: req.body.task },
    });
    const b = yield beatmap_1.BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();
    res.json(b);
    if (b.status !== beatmap_2.BeatmapStatus.Secret) {
        log_1.LogModel.generate((_g = req.session) === null || _g === void 0 ? void 0 : _g.mongoId, `unlocked claims for "${req.body.task}" on "${b.song.artist} - ${b.song.title}"`, log_2.LogCategory.Beatmap);
    }
}));
beatmapsHostRouter.post('/:id/delete', middlewares_2.isValidBeatmap, middlewares_2.isBeatmapHost, middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    const b = res.locals.beatmap;
    for (let i = 0; i < b.tasks.length; i++) {
        yield task_1.TaskModel.findByIdAndRemove(b.tasks[i]);
    }
    yield beatmap_1.BeatmapModel.findByIdAndRemove(req.params.id);
    res.json(b);
    if (b.status !== beatmap_2.BeatmapStatus.Secret) {
        log_1.LogModel.generate((_h = req.session) === null || _h === void 0 ? void 0 : _h.mongoId, `deleted "${b.song.artist} - ${b.song.title}"`, log_2.LogCategory.Beatmap);
    }
}));
exports.default = beatmapsHostRouter;
