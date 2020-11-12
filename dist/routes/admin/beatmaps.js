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
const featuredArtist_1 = require("../../models/featuredArtist");
const beatmap_2 = require("../../interfaces/beatmap/beatmap");
const quest_1 = require("../../models/quest");
const helpers_1 = require("../../helpers/helpers");
const points_1 = require("../../helpers/points");
const task_1 = require("../../models/beatmap/task");
const osuApi_1 = require("../../helpers/osuApi");
const discordApi_1 = require("../../helpers/discordApi");
const task_2 = require("../../interfaces/beatmap/task");
const user_1 = require("../../interfaces/user");
const user_2 = require("../../models/user");
const adminBeatmapsRouter = express_1.default.Router();
adminBeatmapsRouter.use(middlewares_1.isLoggedIn);
adminBeatmapsRouter.use(middlewares_1.isAdmin);
adminBeatmapsRouter.get('/', (req, res) => {
    var _a, _b;
    res.render('admin/beatmaps', {
        title: 'Beatmaps - Admin',
        script: 'adminBeatmaps.js',
        loggedInAs: (_a = req.session) === null || _a === void 0 ? void 0 : _a.osuId,
        userMongoId: (_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId,
        pointsInfo: res.locals.userRequest.pointsInfo,
    });
});
adminBeatmapsRouter.get('/load', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const beatmaps = yield beatmap_1.BeatmapModel
        .find({})
        .defaultPopulate()
        .sort({
        status: 1,
        mode: 1,
        createdAt: -1,
    });
    res.json(beatmaps);
}));
adminBeatmapsRouter.post('/:id/updateStatus', middlewares_1.isSuperAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let b = yield beatmap_1.BeatmapModel
        .findByIdAndUpdate(req.params.id, { status: req.body.status })
        .orFail();
    if (req.body.status == beatmap_2.BeatmapStatus.Done) {
        for (let i = 0; i < b.tasks.length; i++) {
            yield task_1.TaskModel.findByIdAndUpdate(b.tasks[i], { status: task_2.TaskStatus.Done });
        }
    }
    if (req.body.status == beatmap_2.BeatmapStatus.Ranked) {
        const osuId = helpers_1.findBeatmapsetId(b.url);
        const bmInfo = yield osuApi_1.beatmapsetInfo(osuId);
        if (osuApi_1.isOsuResponseError(bmInfo)) {
            return res.json(helpers_1.defaultErrorMessage);
        }
        b.length = bmInfo.hit_length;
        b.rankedDate = bmInfo.approved_date;
        yield b.save();
        b = yield beatmap_1.BeatmapModel
            .findById(req.params.id)
            .defaultPopulate()
            .orFail();
        for (const modder of b.modders) {
            points_1.updateUserPoints(modder.id);
        }
        points_1.updateUserPoints(b.host.id);
        const gdUsernames = [];
        const gdUsers = [];
        const modes = [];
        let storyboard;
        b.tasks.forEach((task) => {
            if (task.mode == 'sb' && task.mappers[0].id != b.host.id) {
                storyboard = task;
            }
            else if (task.mode != 'sb') {
                task.mappers.forEach(mapper => {
                    if (!gdUsernames.includes(mapper.username) && mapper.username != b.host.username) {
                        gdUsernames.push(mapper.username);
                        gdUsers.push(mapper);
                    }
                });
                if (!modes.includes(task.mode)) {
                    modes.push(task.mode);
                }
            }
        });
        let gdText = '';
        if (!gdUsers.length) {
            gdText = '\nNo guest difficulties';
        }
        else if (gdUsers.length > 1) {
            gdText = '\nGuest difficulties by ';
        }
        else if (gdUsers.length == 1) {
            gdText = '\nGuest difficulty by ';
        }
        if (gdUsers.length) {
            for (let i = 0; i < gdUsers.length; i++) {
                const user = gdUsers[i];
                gdText += `[**${user.username}**](https://osu.ppy.sh/users/${user.osuId})`;
                if (i + 1 < gdUsers.length) {
                    gdText += ', ';
                }
                points_1.updateUserPoints(user.id);
            }
        }
        let storyboardText = '';
        if (storyboard) {
            const storyboarder = storyboard.mappers[0];
            storyboardText = `\nStoryboard by [**${storyboarder.username}**](https://osu.ppy.sh/users/${storyboarder.osuId})`;
            points_1.updateUserPoints(storyboarder.id);
        }
        let showcaseText = '';
        if (b.isShowcase) {
            const artist = yield featuredArtist_1.FeaturedArtistModel.findOne({ songs: b.song._id });
            if (artist)
                showcaseText = `\n\nThis beatmap was created for [${b.song.artist}](https://osu.ppy.sh/beatmaps/artists/${artist.osuId})'s Featured Artist announcement!`;
        }
        const description = `💖 [**${b.song.artist} - ${b.song.title}**](${b.url}) [**${modes.join(', ')}**] has been ranked\n\nHosted by [**${b.host.username}**](https://osu.ppy.sh/users/${b.host.osuId})${gdText}${storyboardText}${showcaseText}`;
        discordApi_1.webhookPost([{
                color: discordApi_1.webhookColors.blue,
                description,
                thumbnail: {
                    url: `https://assets.ppy.sh/beatmaps/${osuId}/covers/list.jpg`,
                },
            }]);
    }
    res.json(req.body.status);
}));
adminBeatmapsRouter.post('/:id/tasks/:taskId/delete', middlewares_1.isSuperAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield Promise.all([
        beatmap_1.BeatmapModel
            .findByIdAndUpdate(req.params.id, {
            $pull: {
                tasks: req.params.taskId,
            },
        })
            .orFail(),
        task_1.TaskModel
            .findByIdAndRemove(req.params.taskId)
            .orFail(),
    ]);
    res.json({ success: 'ok' });
}));
adminBeatmapsRouter.post('/:id/modders/:modderId/delete', middlewares_1.isSuperAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield beatmap_1.BeatmapModel
        .findByIdAndUpdate(req.params.id, { $pull: { modders: req.params.modderId } })
        .orFail();
    res.json({ success: 'ok' });
}));
adminBeatmapsRouter.post('/:id/updateUrl', middlewares_1.isSuperAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield beatmap_1.BeatmapModel
        .findByIdAndUpdate(req.params.id, { url: req.body.url })
        .orFail();
    res.json(req.body.url);
}));
adminBeatmapsRouter.post('/:id/updateStoryboardQuality', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const task = yield task_1.TaskModel
        .findByIdAndUpdate(req.body.taskId, { sbQuality: req.body.storyboardQuality })
        .orFail();
    yield task.populate({
        path: 'mappers',
    }).execPopulate();
    res.json(task);
}));
adminBeatmapsRouter.post('/:id/updatePackId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield beatmap_1.BeatmapModel
        .findByIdAndUpdate(req.params.id, { packId: req.body.packId })
        .orFail();
    res.json(parseInt(req.body.packId, 10));
}));
adminBeatmapsRouter.post('/:id/updateIsShowcase', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield beatmap_1.BeatmapModel
        .findByIdAndUpdate(req.params.id, { isShowcase: req.body.isShowcase })
        .orFail();
    res.json(req.body.isShowcase);
}));
adminBeatmapsRouter.get('/loadNewsInfo/:date', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (isNaN(Date.parse(req.params.date))) {
        return res.json({ error: 'Invalid date' });
    }
    const date = new Date(req.params.date);
    const [b, q, u] = yield Promise.all([
        beatmap_1.BeatmapModel
            .find({
            rankedDate: { $gte: date },
            status: beatmap_2.BeatmapStatus.Ranked,
        })
            .defaultPopulate()
            .sort({ mode: 1, createdAt: -1 })
            .orFail(),
        quest_1.QuestModel
            .find({ completed: { $gte: date } })
            .defaultPopulate()
            .sort({ requiredMapsets: 1 })
            .orFail(),
        user_2.UserModel
            .find({ group: { $ne: user_1.UserGroup.Spectator } })
            .orFail(),
    ]);
    const maps = yield osuApi_1.getMaps(date);
    const externalBeatmaps = [];
    const osuIds = [];
    b.forEach(map => {
        if (map.url) {
            const osuId = helpers_1.findBeatmapsetId(map.url);
            if (!osuIds.includes(osuId)) {
                osuIds.push(osuId);
            }
        }
    });
    if (!osuApi_1.isOsuResponseError(maps)) {
        maps.forEach(map => {
            map.beatmapset_id = parseInt(map.beatmapset_id, 10);
            if (!osuIds.includes(map.beatmapset_id)) {
                osuIds.push(map.beatmapset_id);
                map.tags = map.tags.split(' ');
                if ((map.tags.includes('featured') && map.tags.includes('artist')) || map.tags.includes('fa')) {
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
    const users = [];
    for (const user of u) {
        user.hostCount = 0;
        user.taskCount = 0;
        for (const beatmap of b) {
            for (const task of beatmap.tasks) {
                for (const mapper of task.mappers) {
                    if (mapper.id == user.id) {
                        user.taskCount++;
                    }
                }
            }
            if (beatmap.host.id == user.id)
                user.hostCount++;
        }
        if (user.taskCount >= 10 || user.hostCount >= 3) {
            users.push({ username: user.username, osuId: user.osuId, taskCount: user.taskCount, hostCount: user.hostCount });
        }
    }
    users.sort(function (a, b) {
        if (a.hostCount < b.hostCount)
            return 1;
        if (a.hostCount > b.hostCount)
            return -1;
        return 0;
    });
    res.json({ beatmaps: b, quests: q, externalBeatmaps, users });
}));
adminBeatmapsRouter.get('/findBundledBeatmaps', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const easyTasks = yield task_1.TaskModel
        .find({ name: task_2.TaskName.Easy })
        .select('_id')
        .orFail();
    const easyBeatmaps = yield beatmap_1.BeatmapModel
        .find({
        tasks: {
            $in: easyTasks,
        },
        status: beatmap_2.BeatmapStatus.Ranked,
    })
        .defaultPopulate()
        .sortByLastest();
    res.json(easyBeatmaps);
}));
exports.default = adminBeatmapsRouter;
