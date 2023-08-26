import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';
import { BeatmapModel } from '../../models/beatmap/beatmap';
import { BeatmapStatus } from '../../../interfaces/beatmap/beatmap';
import { findBeatmapsetId, setBeatmapStatusRanked, sleep } from '../../helpers/helpers';
import { TaskModel } from '../../models/beatmap/task';
import { isOsuResponseError, getClientCredentialsGrant, getBeatmapsetV2Info, getUserInfoFromId } from '../../helpers/osuApi';
import { TaskName, TaskStatus, TaskMode } from '../../../interfaces/beatmap/task';
import { User } from '../../../interfaces/user';
import { UserModel } from '../../models/user';
import { sendAnnouncement } from '../../helpers/osuBot';

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
        const response = await getClientCredentialsGrant();
        await sleep(500);

        if (!isOsuResponseError(response)) {
            const token = response.access_token;
            const bmInfo: any = await getBeatmapsetV2Info(token, osuId);
            await sleep(500);

            if (!isOsuResponseError(bmInfo)) {
                await setBeatmapStatusRanked(b.id, bmInfo);
            }
        }
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
    flag: string;
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
    } else {
        message += `\n\nsorry :(`;
    }

    const announcement = await sendAnnouncement([beatmap.host.osuId], channel, message);

    if (announcement !== true) {
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

    const response = await getClientCredentialsGrant();

    if (!isOsuResponseError(response)) {
        const token = response.access_token;

        const b = await BeatmapModel
            .find({
                rankedDate: { $gte: date },
                status: BeatmapStatus.Ranked,
            })
            .defaultPopulate()
            .sort({ mode: 1, createdAt: -1 })
            .orFail();

        const u = await UserModel
            .find({
                $or:
                    [
                        { osuPoints: { $gt: 0 } },
                        { taikoPoints: { $gt: 0 } },
                        { catchPoints: { $gt: 0 } },
                        { maniaPoints: { $gt: 0 } },
                        { storyboardPoints: { $gt: 0 } },
                        { modPoints: { $gt: 0 } },
                        { contestParticipantPoints: { $gt: 0 } },
                        { contestJudgePoints: { $gt: 0 } },
                        { contestScreenerPoints: { $gt: 0 } },
                    ],
            })
            .orFail();

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

            if (user.taskCount >= 10 || user.hostCount >= 5) {
                const userInfo = await getUserInfoFromId(token, user.osuId);

                if (!isOsuResponseError(userInfo)) {
                    console.log(userInfo.username);
                    await sleep(250);
                    users.push({ username: user.username, flag: `::{ flag=${userInfo.country_code} }::`, osuId: user.osuId, taskCount: user.taskCount, hostCount: user.hostCount, modes: [...new Set(modes)] });
                }
            }
        }

        users.sort(function(a,b) {
            if (a.taskCount < b.taskCount) return 1;
            if (a.taskCount > b.taskCount) return -1;

            return 0;
        });

        res.json({ users });
    }
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
        .sortByLatest();

    res.json(easyBeatmaps);
});

export default adminBeatmapsRouter;
