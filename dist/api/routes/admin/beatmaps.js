"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../../helpers/middlewares");
const beatmap_1 = require("../../models/beatmap/beatmap");
const beatmap_2 = require("../../../interfaces/beatmap/beatmap");
const helpers_1 = require("../../helpers/helpers");
const task_1 = require("../../models/beatmap/task");
const osuApi_1 = require("../../helpers/osuApi");
const task_2 = require("../../../interfaces/beatmap/task");
const user_1 = require("../../models/user");
const featuredSong_1 = require("../../models/featuredSong");
const osuBot_1 = require("../../helpers/osuBot");
const helpers_2 = require("../../helpers/helpers");
const adminBeatmapsRouter = express_1.default.Router();
adminBeatmapsRouter.use(middlewares_1.isLoggedIn);
adminBeatmapsRouter.use(middlewares_1.isAdmin);
/* GET beatmaps */
adminBeatmapsRouter.get('/load', async (req, res) => {
    const beatmaps = await beatmap_1.BeatmapModel
        .find({})
        .defaultPopulate()
        .sort({
        status: 1,
        mode: 1,
        createdAt: -1,
    });
    res.json(beatmaps);
});
/* POST update map status */
adminBeatmapsRouter.post('/:id/updateStatus', middlewares_1.isSuperAdmin, async (req, res) => {
    const b = await beatmap_1.BeatmapModel
        .findByIdAndUpdate(req.params.id, { status: req.body.status })
        .orFail();
    if (req.body.status == beatmap_2.BeatmapStatus.Done) {
        // set all tasks as Done
        for (let i = 0; i < b.tasks.length; i++) {
            await task_1.TaskModel.findByIdAndUpdate(b.tasks[i], { status: task_2.TaskStatus.Done });
        }
    }
    if (req.body.status == beatmap_2.BeatmapStatus.Ranked) {
        // fetch osu api's beatmap data
        const osuId = (0, helpers_1.findBeatmapsetId)(b.url);
        const response = await (0, osuApi_1.getClientCredentialsGrant)();
        await (0, helpers_1.sleep)(500);
        if (!(0, osuApi_1.isOsuResponseError)(response)) {
            const token = response.access_token;
            const bmInfo = await (0, osuApi_1.getBeatmapsetV2Info)(token, osuId);
            await (0, helpers_1.sleep)(500);
            if (!(0, osuApi_1.isOsuResponseError)(bmInfo)) {
                await (0, helpers_1.setBeatmapStatusRanked)(b.id, bmInfo, token);
            }
        }
    }
    else {
        b.queuedForRank = false;
        await b.save();
    }
    res.json(req.body.status);
});
/* POST delete task */
adminBeatmapsRouter.post('/:id/tasks/:taskId/delete', middlewares_1.isSuperAdmin, async (req, res) => {
    await Promise.all([
        beatmap_1.BeatmapModel
            .findByIdAndUpdate(req.params.id, {
            $pull: {
                tasks: req.params.taskId,
            },
        })
            .orFail(),
        task_1.TaskModel
            .findByIdAndDelete(req.params.taskId)
            .orFail(),
    ]);
    res.json({ success: 'ok' });
});
/* POST delete modder */
adminBeatmapsRouter.post('/:id/modders/:modderId/delete', middlewares_1.isSuperAdmin, async (req, res) => {
    await beatmap_1.BeatmapModel
        .findByIdAndUpdate(req.params.id, { $pull: { modders: req.params.modderId } })
        .orFail();
    res.json({ success: 'ok' });
});
/* POST update map url */
adminBeatmapsRouter.post('/:id/updateUrl', middlewares_1.isSuperAdmin, async (req, res) => {
    await beatmap_1.BeatmapModel
        .findByIdAndUpdate(req.params.id, { url: req.body.url })
        .orFail();
    res.json(req.body.url);
});
/* POST update isShowcase */
adminBeatmapsRouter.post('/:id/updateIsShowcase', middlewares_1.isSuperAdmin, async (req, res) => {
    await beatmap_1.BeatmapModel
        .findByIdAndUpdate(req.params.id, { isShowcase: req.body.isShowcase })
        .orFail();
    res.json(req.body.isShowcase);
});
/* POST update queuedForRank */
adminBeatmapsRouter.post('/:id/updateQueuedForRank', middlewares_1.isSuperAdmin, async (req, res) => {
    await beatmap_1.BeatmapModel
        .findByIdAndUpdate(req.params.id, { queuedForRank: req.body.queuedForRank })
        .orFail();
    res.json(req.body.queuedForRank);
});
/* POST update skipWebhook */
adminBeatmapsRouter.post('/:id/updateSkipWebhook', middlewares_1.isSuperAdmin, async (req, res) => {
    await beatmap_1.BeatmapModel
        .findByIdAndUpdate(req.params.id, { skipWebhook: req.body.skipWebhook })
        .orFail();
    res.json(req.body.skipWebhook);
});
/* POST reject mapset from earning points */
adminBeatmapsRouter.post('/:id/rejectMapset', middlewares_1.isSuperAdmin, async (req, res) => {
    const beatmap = await beatmap_1.BeatmapModel
        .findByIdAndUpdate(req.params.id, { status: beatmap_2.BeatmapStatus.WIP })
        .defaultPopulate()
        .orFail();
    const channel = {
        name: `MG - Mapset error`,
        description: `One of your Mappers' Guild beatmaps encountered a problem with points processing. You may need to make adjustments before points can be earned.`,
    };
    let message = `hello! your beatmap of [${beatmap.song.artist} - ${beatmap.song.title}](https://mappersguild.com/beatmaps?id=${beatmap.id}) isn't eligible to earn points for the following reason:\n\n- `;
    const inputMessages = req.body.messages.trim();
    message += inputMessages;
    if (req.body.isResolvable) {
        message += `\n\nwhen the issue is resolved, mark the mapset as \`Done\` to re-attempt points processing!`;
        message += `\n\nthank you!!`;
    }
    else {
        message += `\n\nsorry :(`;
        beatmap.invalidForPoints = true;
        beatmap.invalidReason = inputMessages;
        await beatmap.save();
    }
    const announcement = await (0, osuBot_1.sendAnnouncement)([beatmap.host.osuId], channel, message);
    if (announcement !== true) {
        return res.json({ error: announcement.error ? announcement.error : `Messages were not sent.` });
    }
    res.json(beatmap.status);
});
/* GET news info */
adminBeatmapsRouter.get('/loadNewsInfo/:date', async (req, res) => {
    if (isNaN(Date.parse(req.params.date))) {
        return res.json({ error: 'Invalid date' });
    }
    const date = new Date(req.params.date);
    const response = await (0, osuApi_1.getClientCredentialsGrant)();
    if (!(0, osuApi_1.isOsuResponseError)(response)) {
        const token = response.access_token;
        const b = await beatmap_1.BeatmapModel
            .find({
            rankedDate: { $gte: date },
            status: beatmap_2.BeatmapStatus.Ranked,
        })
            .defaultPopulate()
            .sort({ mode: 1, createdAt: -1 })
            .orFail();
        const u = await user_1.UserModel
            .find({
            $or: [
                { osuPoints: { $gt: 0 } },
                { taikoPoints: { $gt: 0 } },
                { catchPoints: { $gt: 0 } },
                { maniaPoints: { $gt: 0 } },
                { storyboardPoints: { $gt: 0 } },
                { hitsoundPoints: { $gt: 0 } },
                { modPoints: { $gt: 0 } },
                { contestParticipantPoints: { $gt: 0 } },
                { contestJudgePoints: { $gt: 0 } },
                { contestScreenerPoints: { $gt: 0 } },
            ],
        })
            .orFail();
        const users = [];
        for (const user of u) {
            user.hostCount = 0;
            user.taskCount = 0;
            const modes = [];
            for (const beatmap of b) {
                for (const task of beatmap.tasks) {
                    for (const mapper of task.mappers) {
                        if (mapper.id == user.id) {
                            user.taskCount++;
                            modes.push(task.mode);
                        }
                    }
                }
                if (beatmap.host.id == user.id)
                    user.hostCount++;
            }
            if (user.taskCount >= 10 || user.hostCount >= 5) {
                const userInfo = await (0, osuApi_1.getUserInfoFromId)(token, user.osuId);
                if (!(0, osuApi_1.isOsuResponseError)(userInfo)) {
                    await (0, helpers_1.sleep)(250);
                    users.push({ username: user.username, flag: `::{ flag=${userInfo.country_code} }::`, osuId: user.osuId, taskCount: user.taskCount, hostCount: user.hostCount, modes: [...new Set(modes)] });
                }
            }
        }
        users.sort(function (a, b) {
            if (a.taskCount < b.taskCount)
                return 1;
            if (a.taskCount > b.taskCount)
                return -1;
            return 0;
        });
        res.json({ users });
    }
});
/* GET bundled beatmaps */
adminBeatmapsRouter.get('/findBundledBeatmaps', async (req, res) => {
    const [easyTasks, normalTasks, hardTasks, insaneTasks] = await Promise.all([
        task_1.TaskModel
            .find({ name: task_2.TaskName.Easy })
            .select('_id')
            .orFail(),
        task_1.TaskModel
            .find({ name: task_2.TaskName.Normal })
            .select('_id')
            .orFail(),
        task_1.TaskModel
            .find({ name: task_2.TaskName.Hard })
            .select('_id')
            .orFail(),
        task_1.TaskModel
            .find({ name: task_2.TaskName.Insane })
            .select('_id')
            .orFail(),
    ]);
    const spreadBeatmaps = await beatmap_1.BeatmapModel
        .find({
        $and: [
            { tasks: { $in: easyTasks } },
            { tasks: { $in: normalTasks } },
            { tasks: { $in: hardTasks } },
            { tasks: { $in: insaneTasks } },
            { length: { $gt: 90 } },
            { length: { $lt: 240 } },
        ],
        status: beatmap_2.BeatmapStatus.Ranked,
    })
        .defaultPopulate()
        .sortByLatest();
    res.json(spreadBeatmaps);
});
/* POST toggle isBundled */
adminBeatmapsRouter.post('/:id/toggleIsBundled', async (req, res) => {
    res.json(await beatmap_1.BeatmapModel.findByIdAndUpdate(req.params.id, { isBundled: !req.body.isBundled }).defaultPopulate().orFail());
});
/* GET compare MG metadata/difficulties with osu! API response */
adminBeatmapsRouter.get('/:id/verify', async (req, res) => {
    const beatmap = await beatmap_1.BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();
    if (!beatmap.url || !beatmap.url.includes('osu.ppy.sh/beatmapsets/')) {
        return res.json({ error: 'Invalid osu! url' });
    }
    const response = await (0, osuApi_1.getClientCredentialsGrant)();
    if ((0, osuApi_1.isOsuResponseError)(response)) {
        return res.json(helpers_2.defaultErrorMessage);
    }
    const bmInfo = await (0, osuApi_1.getBeatmapsetV2Info)(response.access_token, (0, helpers_1.findBeatmapsetId)(beatmap.url));
    if ((0, osuApi_1.isOsuResponseError)(bmInfo)) {
        return res.json(helpers_2.defaultErrorMessage);
    }
    // metadata check
    const metadata = {
        osu: `${bmInfo.artist} - ${bmInfo.title}`,
        mg: `${beatmap.song.artist} - ${beatmap.song.title}`,
        match: bmInfo.artist === beatmap.song.artist && bmInfo.title === beatmap.song.title,
    };
    // diffs check
    const difficulties = bmInfo.beatmaps
        .filter(difficulty => !difficulty.deleted_at)
        .map(difficulty => ({ ...difficulty, mode: difficulty.mode === 'fruits' ? task_2.TaskMode.Catch : difficulty.mode }));
    // only difficulties (ENHIX) are returned by osu! API. hs/sb/skin need to be manually checked
    const autoCheckNames = [task_2.TaskName.Easy, task_2.TaskName.Normal, task_2.TaskName.Hard, task_2.TaskName.Insane, task_2.TaskName.Expert];
    const manualCheckNames = [task_2.TaskName.Hitsounds, task_2.TaskName.Storyboard, task_2.TaskName.Skin];
    const autoCheckTasks = beatmap.tasks.filter(task => autoCheckNames.includes(task.name));
    const manualCheckTasks = beatmap.tasks.filter(task => manualCheckNames.includes(task.name));
    const mgMappers = [];
    for (const task of autoCheckTasks) {
        for (const mapper of task.mappers) {
            mgMappers.push(mapper.osuId);
        }
    }
    const osuMappers = [];
    for (const difficulty of difficulties) {
        for (const owner of difficulty.owners) {
            osuMappers.push(owner.id);
        }
    }
    // if every mapper osuId appears the same number of times in both arrays, the difficulties match. probably...
    const difficultiesMatch = mgMappers.sort().join() === osuMappers.sort().join();
    // host hitsounds are most likely legit, so no need to flag for manual check
    const isHostHitsounds = task => task.name === task_2.TaskName.Hitsounds && task.mappers.every(mapper => mapper.id === beatmap.host.id);
    const manual = manualCheckTasks.filter(task => !isHostHitsounds(task)).map(task => ({
        name: task.name,
        mode: task.mode,
        mappers: task.mappers.map(mapper => ({ username: mapper.username, osuId: mapper.osuId })),
    }));
    res.json({ metadata, difficultiesMatch, manual });
});
/* POST sync MG song artist/title with osu! map's (romanized) artist/title */
adminBeatmapsRouter.post('/:id/syncMetadata', middlewares_1.isSuperAdmin, async (req, res) => {
    const beatmap = await beatmap_1.BeatmapModel.findById(req.params.id).orFail();
    const response = await (0, osuApi_1.getClientCredentialsGrant)();
    if ((0, osuApi_1.isOsuResponseError)(response)) {
        return res.json(helpers_2.defaultErrorMessage);
    }
    const bmInfo = await (0, osuApi_1.getBeatmapsetV2Info)(response.access_token, (0, helpers_1.findBeatmapsetId)(beatmap.url));
    if ((0, osuApi_1.isOsuResponseError)(bmInfo)) {
        return res.json(helpers_2.defaultErrorMessage);
    }
    await featuredSong_1.FeaturedSongModel
        .findByIdAndUpdate(beatmap.song, { artist: bmInfo.artist, title: bmInfo.title })
        .orFail();
    res.json({ artist: bmInfo.artist, title: bmInfo.title });
});
/* POST search beatmap through osu api */
adminBeatmapsRouter.post('/searchBeatmap', async (req, res) => {
    const osuId = parseInt(req.body.osuId);
    if (isNaN(osuId)) {
        return res.json({ error: 'invalid osu id' });
    }
    const response = await (0, osuApi_1.getClientCredentialsGrant)();
    if ((0, osuApi_1.isOsuResponseError)(response)) {
        return res.json(helpers_2.defaultErrorMessage);
    }
    const token = response.access_token;
    const userInfo = await (0, osuApi_1.getBeatmapsetV2Info)(token, osuId);
    if ((0, osuApi_1.isOsuResponseError)(userInfo)) {
        return res.json(helpers_2.defaultErrorMessage);
    }
    res.json(userInfo);
});
exports.default = adminBeatmapsRouter;
