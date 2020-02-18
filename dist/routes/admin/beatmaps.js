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
const middlewares_1 = require("../../helpers/middlewares");
const beatmap_1 = require("../../models/beatmap/beatmap");
const beatmap_2 = require("../../interfaces/beatmap/beatmap");
const quest_1 = require("../../models/quest");
const helpers_1 = require("../../helpers/helpers");
const task_1 = require("../../models/beatmap/task");
const osuApi_1 = require("../../helpers/osuApi");
const discordApi_1 = require("../../helpers/discordApi");
const adminBeatmapsRouter = express_1.default.Router();
adminBeatmapsRouter.use(middlewares_1.isLoggedIn);
adminBeatmapsRouter.use(middlewares_1.isAdmin);
adminBeatmapsRouter.get('/', (req, res) => {
    var _a;
    res.render('admin/beatmaps', {
        title: 'Beatmaps - Admin',
        script: 'adminBeatmaps.js',
        loggedInAs: (_a = req.session) === null || _a === void 0 ? void 0 : _a.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});
adminBeatmapsRouter.get('/load', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const beatmaps = yield beatmap_1.BeatmapService.queryAll({
        defaultPopulate: true,
        sort: {
            status: 1,
            mode: 1,
            createdAt: -1,
        },
    });
    res.json(beatmaps);
}));
adminBeatmapsRouter.post('/:id/updateStatus', middlewares_1.isSuperAdmin, helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let b = yield beatmap_1.BeatmapService.updateOrFail(req.params.id, { status: req.body.status });
    if (req.body.status == beatmap_2.BeatmapStatus.Done) {
        for (let i = 0; i < b.tasks.length; i++) {
            yield task_1.TaskService.update(b.tasks[i], { status: beatmap_2.BeatmapStatus.Done });
        }
    }
    if (req.body.status == beatmap_2.BeatmapStatus.Ranked) {
        const indexStart = b.url.indexOf('beatmapsets/') + 'beatmapsets/'.length;
        const indexEnd = b.url.indexOf('#');
        let bmId = '';
        if (indexEnd !== -1) {
            bmId = b.url.slice(indexStart, indexEnd);
        }
        else {
            bmId = b.url.slice(indexStart);
        }
        const bmInfo = yield osuApi_1.beatmapsetInfo(parseInt(bmId, 10));
        if (osuApi_1.isOsuResponseError(bmInfo)) {
            return res.json(helpers_1.defaultErrorMessage);
        }
        b.length = bmInfo.hit_length;
        yield beatmap_1.BeatmapService.saveOrFail(b);
        b = yield beatmap_1.BeatmapService.queryByIdOrFail(req.params.id, { defaultPopulate: true });
        const gdUsernames = [];
        b.tasks.forEach((task) => {
            task.mappers.forEach(mapper => {
                if (gdUsernames.indexOf(mapper.username) == -1 && mapper.username != b.host.username) {
                    gdUsernames.push(mapper.username);
                }
            });
        });
        let gdText = '';
        if (!gdUsernames.length) {
            gdText = 'No guest difficulties';
        }
        else if (gdUsernames.length > 1) {
            gdText = 'Guest difficulties: ';
        }
        else if (gdUsernames.length == 1) {
            gdText = 'Guest difficulty: ';
        }
        if (gdUsernames.length) {
            gdText += gdUsernames.join(', ');
        }
        discordApi_1.webhookPost([{
                author: {
                    name: `Ranked: ${b.song.artist} - ${b.song.title}`,
                    url: b.url,
                    icon_url: 'https://a.ppy.sh/' + b.host.osuId,
                },
                thumbnail: {
                    url: `https://assets.ppy.sh/beatmaps/${bmId}/covers/list.jpg`,
                },
                color: 10221039,
                fields: [
                    {
                        name: `Host: ${b.host.username}`,
                        value: gdText,
                    },
                ],
            }]);
    }
    res.json(req.body.status);
})));
adminBeatmapsRouter.post('/:id/tasks/:taskId/delete', middlewares_1.isSuperAdmin, helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield Promise.all([
        beatmap_1.BeatmapService.updateOrFail(req.params.id, {
            $pull: {
                tasks: req.params.taskId,
            },
        }),
        task_1.TaskService.removeOrFail(req.params.taskId),
    ]);
    res.json({ success: 'ok' });
})));
adminBeatmapsRouter.post('/:id/modders/:modderId/delete', middlewares_1.isSuperAdmin, helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield beatmap_1.BeatmapService.updateOrFail(req.params.id, { $pull: { modders: req.params.modderId } });
    res.json({ success: 'ok' });
})));
adminBeatmapsRouter.post('/:id/updateUrl', middlewares_1.isSuperAdmin, helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield beatmap_1.BeatmapService.updateOrFail(req.params.id, { url: req.body.url });
    res.json(req.body.url);
})));
adminBeatmapsRouter.post('/:id/updateStoryboardQuality', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const task = yield task_1.TaskService.updateOrFail(req.body.taskId, { sbQuality: req.body.storyboardQuality });
    yield task.populate({
        path: 'mappers',
    }).execPopulate();
    res.json(task);
})));
adminBeatmapsRouter.post('/:id/updatePackId', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield beatmap_1.BeatmapService.updateOrFail(req.params.id, { packId: req.body.packId });
    res.json(parseInt(req.body.packId, 10));
})));
adminBeatmapsRouter.get('/loadNewsInfo/:date', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (isNaN(Date.parse(req.params.date))) {
        return res.json({ error: 'Invalid date' });
    }
    const date = new Date(req.params.date);
    const [b, q] = yield Promise.all([
        beatmap_1.BeatmapService.queryAllOrFail({
            query: {
                updatedAt: { $gte: date },
                status: beatmap_2.BeatmapStatus.Ranked,
            },
            defaultPopulate: true,
            sort: { mode: 1, createdAt: -1 },
        }),
        quest_1.QuestService.queryAllOrFail({
            query: { completed: { $gte: date } },
            defaultPopulate: true,
            sort: { name: 1 },
        }),
    ]);
    const maps = yield osuApi_1.getMaps(date);
    const osuIds = [];
    const externalBeatmaps = [];
    b.forEach(map => {
        if (map.url) {
            const indexStart = map.url.indexOf('beatmapsets/') + 'beatmapsets/'.length;
            const indexEnd = map.url.indexOf('#');
            let bmId = '';
            if (indexEnd !== -1) {
                bmId = map.url.slice(indexStart, indexEnd);
            }
            else {
                bmId = map.url.slice(indexStart);
            }
            const osuId = parseInt(bmId, 10);
            if (osuIds.indexOf(osuId) == -1) {
                osuIds.push(osuId);
            }
        }
    });
    if (!osuApi_1.isOsuResponseError(maps)) {
        maps.forEach(map => {
            map.beatmapset_id = parseInt(map.beatmapset_id, 10);
            if (osuIds.indexOf(map.beatmapset_id) == -1) {
                osuIds.push(map.beatmapset_id);
                if (map.tags.includes('featured artist') || map.tags.includes(' fa ')) {
                    externalBeatmaps.push({
                        osuId: map.beatmapset_id,
                        artist: map.artist,
                        title: map.title,
                        creator: map.creator,
                        creatorOsuId: map.creator_id
                    });
                }
            }
        });
    }
    res.json({ beatmaps: b, quests: q, externalBeatmaps });
})));
exports.default = adminBeatmapsRouter;
