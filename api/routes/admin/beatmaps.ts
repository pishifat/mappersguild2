import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';
import { BeatmapModel } from '../../models/beatmap/beatmap';
import { BeatmapStatus } from '../../../interfaces/beatmap/beatmap';
import { QuestModel } from '../../models/quest';
import { findBeatmapsetId, defaultErrorMessage, setBeatmapStatusRanked } from '../../helpers/helpers';
import { TaskModel } from '../../models/beatmap/task';
import { beatmapsetInfo, isOsuResponseError } from '../../helpers/osuApi';
import { TaskName, TaskStatus, TaskMode } from '../../../interfaces/beatmap/task';
import { User, UserGroup } from '../../../interfaces/user';
import { UserModel } from '../../models/user';
import { sendMessages } from '../../helpers/osuBot';

const adminBeatmapsRouter = express.Router();

adminBeatmapsRouter.use(isLoggedIn);
adminBeatmapsRouter.use(isAdmin);

/* GET beatmaps */
adminBeatmapsRouter.get('/load', async (req, res) => {
    const beatmaps = await BeatmapModel
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
adminBeatmapsRouter.post('/:id/updateStatus', isSuperAdmin, async (req, res) => {
    const b = await BeatmapModel
        .findByIdAndUpdate(req.params.id, { status: req.body.status })
        .orFail();

    if (req.body.status == BeatmapStatus.Done) {
        // set all tasks as Done
        for (let i = 0; i < b.tasks.length; i++) {
            await TaskModel.findByIdAndUpdate(b.tasks[i], { status: TaskStatus.Done });
        }
    }

    if (req.body.status == BeatmapStatus.Ranked) {
        // fetch osu api's beatmap data
        const osuId = findBeatmapsetId(b.url);

        const bmInfo = await beatmapsetInfo(osuId);

        if (isOsuResponseError(bmInfo)) {
            return res.json(defaultErrorMessage);
        }

        await setBeatmapStatusRanked(b.id, bmInfo);
    } else {
        b.queuedForRank = false;
        await b.save();
    }

    res.json(req.body.status);
});

/* POST delete task */
adminBeatmapsRouter.post('/:id/tasks/:taskId/delete', isSuperAdmin, async (req, res) => {
    await Promise.all([
        BeatmapModel
            .findByIdAndUpdate(req.params.id, {
                $pull: {
                    tasks: req.params.taskId,
                },
            })
            .orFail(),
        TaskModel
            .findByIdAndRemove(req.params.taskId)
            .orFail(),
    ]);

    res.json({ success: 'ok' });
});

/* POST delete modder */
adminBeatmapsRouter.post('/:id/modders/:modderId/delete', isSuperAdmin, async (req, res) => {
    await BeatmapModel
        .findByIdAndUpdate(req.params.id, { $pull: { modders: req.params.modderId } })
        .orFail();

    res.json({ success: 'ok' });
});

/* POST update map url */
adminBeatmapsRouter.post('/:id/updateUrl', isSuperAdmin, async (req, res) => {
    await BeatmapModel
        .findByIdAndUpdate(req.params.id, { url: req.body.url })
        .orFail();

    res.json(req.body.url);
});



// ---------------------
// NOT SUPERADMIN ROUTES
// ---------------------

interface UserCounts extends User {
    hostCount: number;
    taskCount: number;
}

interface UserSummary {
    username: string;
    osuId: number;
    hostCount: number;
    taskCount: number;
    modes: TaskMode[];
}

/* POST update sb quality */
adminBeatmapsRouter.post('/:id/updateStoryboardQuality', async (req, res) => {
    const task = await TaskModel
        .findByIdAndUpdate(req.body.taskId, { sbQuality: req.body.storyboardQuality })
        .orFail();

    await task.populate({
        path: 'mappers',
    }).execPopulate();

    res.json(task);
});

/* POST update osu beatmap pack ID */
adminBeatmapsRouter.post('/:id/updatePackId', async (req, res) => {
    await BeatmapModel
        .findByIdAndUpdate(req.params.id, { packId: req.body.packId })
        .orFail();

    res.json(parseInt(req.body.packId, 10));
});

/* POST update isShowcase */
adminBeatmapsRouter.post('/:id/updateIsShowcase', async (req, res) => {
    await BeatmapModel
        .findByIdAndUpdate(req.params.id, { isShowcase: req.body.isShowcase })
        .orFail();

    res.json(req.body.isShowcase);
});

/* POST update queuedForRank */
adminBeatmapsRouter.post('/:id/updateQueuedForRank', async (req, res) => {
    await BeatmapModel
        .findByIdAndUpdate(req.params.id, { queuedForRank: req.body.queuedForRank })
        .orFail();

    res.json(req.body.queuedForRank);
});

/* POST reject mapset from earning points */
adminBeatmapsRouter.post('/:id/rejectMapset', async (req, res) => {
    const beatmap = await BeatmapModel
        .findByIdAndUpdate(req.params.id, { status: BeatmapStatus.WIP })
        .defaultPopulate()
        .orFail();

    const inputMessages = req.body.messages.trim();
    const splitMessages = inputMessages.split('\n');

    const messages = [`hello! your beatmap on mappersguild https://mappersguild.com/beatmaps?id=${beatmap.id} isn't eligible to earn points for the following reason:`];

    for (const message of splitMessages) {
        messages.push(message.trim());
    }

    if (req.body.isResolvable) {
        messages.push(`when the issue is resolved, mark the mapset as "Done" to re-attempt points processing!`);
        messages.push(`thank you!!`);
    } else {
        messages.push(`sorry :(`);
    }

    const finalMessages = await sendMessages(beatmap.host.osuId, messages);


    if (finalMessages !== true) {
        return res.json({ error: `Messages were not sent.` });
    }

    res.json(beatmap.status);
});

/* GET news info */
adminBeatmapsRouter.get('/loadNewsInfo/:date', async (req, res) => {
    if (isNaN(Date.parse(req.params.date))) {
        return res.json( { error: 'Invalid date' } );
    }

    const date = new Date(req.params.date);

    const [b, q, u] = await Promise.all([
        BeatmapModel
            .find({
                rankedDate: { $gte: date },
                status: BeatmapStatus.Ranked,
            })
            .defaultPopulate()
            .sort({ mode: 1, createdAt: -1 })
            .orFail(),

        QuestModel
            .find({ completed: { $gte: date } })
            .defaultPopulate()
            .sort({ requiredMapsets: -1 })
            .orFail(),

        UserModel
            .find({ group: { $ne: UserGroup.Spectator } })
            .orFail(),
    ]);

    console.log(b.length);
    console.log(q.length);

    /*const maps: any = await getMaps(date);
    const externalBeatmaps: any = [];

    const osuIds: any = [];

    b.forEach(map => {
        if (map.url) {
            const osuId = findBeatmapsetId(map.url);

            if (!osuIds.includes(osuId)) {
                osuIds.push(osuId);
            }
        }
    });

    if (!isOsuResponseError(maps)) {
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
                        creatorOsuId: map.creator_id });
                }
            }
        });
    }*/

    const users: UserSummary[] = [];

    for (const user of u as UserCounts[]) {
        user.hostCount = 0;
        user.taskCount = 0;
        const modes: TaskMode[] = [];

        for (const beatmap of b) {
            for (const task of beatmap.tasks) {
                for (const mapper of task.mappers) {
                    if (mapper.id == user.id) {
                        user.taskCount++;
                        modes.push(task.mode);
                    }
                }
            }

            if (beatmap.host.id == user.id) user.hostCount++;
        }

        if (user.taskCount >= 30 || user.hostCount >= 5) {
            users.push({ username: user.username, osuId: user.osuId, taskCount: user.taskCount, hostCount: user.hostCount, modes: [...new Set(modes)] });
        }
    }

    users.sort(function(a,b) {
        if (a.taskCount < b.taskCount) return 1;
        if (a.taskCount > b.taskCount) return -1;

        return 0;
    });

    res.json({ beatmaps: b, quests: q, users });
});

/* GET bundled beatmaps */
adminBeatmapsRouter.get('/findBundledBeatmaps', async (req, res) => {
    const easyTasks = await TaskModel
        .find({ name: TaskName.Easy })
        .select('_id')
        .orFail();

    const easyBeatmaps = await BeatmapModel
        .find({
            tasks: {
                $in: easyTasks,
            },
            status: BeatmapStatus.Ranked,
        })
        .defaultPopulate()
        .sortByLastest();

    res.json(easyBeatmaps);
});

export default adminBeatmapsRouter;
