import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';
import { BeatmapService } from '../../models/beatmap/beatmap';
import { Beatmap, BeatmapStatus } from '../../interfaces/beatmap/beatmap';
import { QuestService } from '../../models/quest';
import { canFail, findBeatmapsetId, sleep, defaultErrorMessage } from '../../helpers/helpers';
import { TaskService, Task } from '../../models/beatmap/task';
import { beatmapsetInfo, getMaps, isOsuResponseError } from '../../helpers/osuApi';
import { webhookPost } from '../../helpers/discordApi';

const adminBeatmapsRouter = express.Router();

adminBeatmapsRouter.use(isLoggedIn);
adminBeatmapsRouter.use(isAdmin);

/* GET beatmaps - admin page */
adminBeatmapsRouter.get('/', (req, res) => {
    res.render('admin/beatmaps', {
        title: 'Beatmaps - Admin',
        script: 'adminBeatmaps.js',
        loggedInAs: req.session?.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});

/* GET beatmaps */
adminBeatmapsRouter.get('/load', async (req, res) => {
    const beatmaps = await BeatmapService.queryAll({
        defaultPopulate: true,
        sort: {
            status: 1,
            mode: 1,
            createdAt: -1,
        },
    });

    res.json(beatmaps);
});

/* POST update map status */
adminBeatmapsRouter.post('/:id/updateStatus', isSuperAdmin, canFail(async (req, res) => {
    let b = await BeatmapService.updateOrFail(req.params.id, { status: req.body.status });

    if (req.body.status == BeatmapStatus.Done) {
        for (let i = 0; i < b.tasks.length; i++) {
            await TaskService.update(b.tasks[i] as Task['_id'], { status: BeatmapStatus.Done });
        }
    }

    if (req.body.status == BeatmapStatus.Ranked) {
        const osuId = findBeatmapsetId(b.url);

        const bmInfo = await beatmapsetInfo(osuId);

        if (isOsuResponseError(bmInfo)) {
            return res.json(defaultErrorMessage);
        }

        b.length = bmInfo.hit_length;
        await BeatmapService.saveOrFail(b);

        b = await BeatmapService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

        const gdUsernames: string[] = [];

        b.tasks.forEach((task: Task) => {
            task.mappers.forEach(mapper => {
                if (!gdUsernames.includes(mapper.username) && mapper.username != b.host.username) {
                    gdUsernames.push(mapper.username);
                }
            });
        });

        let gdText = '';

        if (!gdUsernames.length) {
            gdText = 'No guest difficulties';
        } else if (gdUsernames.length > 1) {
            gdText = 'Guest difficulties: ';
        } else if (gdUsernames.length == 1) {
            gdText = 'Guest difficulty: ';
        }

        if (gdUsernames.length) {
            gdText += gdUsernames.join(', ');
        }

        webhookPost([{
            author: {
                name: `Ranked: ${b.song.artist} - ${b.song.title}`,
                url: b.url,
                icon_url: 'https://a.ppy.sh/' + b.host.osuId,
            },
            thumbnail: {
                url: `https://assets.ppy.sh/beatmaps/${osuId}/covers/list.jpg`,
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
}));

/* POST delete task */
adminBeatmapsRouter.post('/:id/tasks/:taskId/delete', isSuperAdmin, canFail(async (req, res) => {
    await Promise.all([
        BeatmapService.updateOrFail(req.params.id, {
            $pull: {
                tasks: req.params.taskId,
            },
        }),
        TaskService.removeOrFail(req.params.taskId),
    ]);

    res.json({ success: 'ok' });
}));

/* POST delete modder */
adminBeatmapsRouter.post('/:id/modders/:modderId/delete', isSuperAdmin, canFail(async (req, res) => {
    await BeatmapService.updateOrFail(req.params.id, { $pull: { modders: req.params.modderId } });

    res.json({ success: 'ok' });
}));

/* POST update map url */
adminBeatmapsRouter.post('/:id/updateUrl', isSuperAdmin, canFail(async (req, res) => {
    await BeatmapService.updateOrFail(req.params.id, { url: req.body.url });

    res.json(req.body.url);
}));



// ---------------------
// NOT SUPERADMIN ROUTES
// ---------------------

/* POST update sb quality */
adminBeatmapsRouter.post('/:id/updateStoryboardQuality', canFail(async (req, res) => {
    const task = await TaskService.updateOrFail(req.body.taskId, { sbQuality: req.body.storyboardQuality });
    await task.populate({
        path: 'mappers',
    }).execPopulate();

    res.json(task);
}));

/* POST update osu beatmap pack ID */
adminBeatmapsRouter.post('/:id/updatePackId', canFail(async (req, res) => {
    await BeatmapService.updateOrFail(req.params.id, { packId: req.body.packId });

    res.json(parseInt(req.body.packId, 10));
}));

/* GET news info */
adminBeatmapsRouter.get('/loadNewsInfo/:date', canFail(async (req, res) => {
    if (isNaN(Date.parse(req.params.date))) {
        return res.json( { error: 'Invalid date' } );
    }

    const date = new Date(req.params.date);

    const [b, q] = await Promise.all([
        BeatmapService.queryAllOrFail({
            query: {
                updatedAt: { $gte: date },
                status: BeatmapStatus.Ranked,
            },
            defaultPopulate: true,
            sort: { mode: 1, createdAt: -1 },
        }),
        QuestService.queryAllOrFail({
            query: { completed: { $gte: date } },
            defaultPopulate: true,
            sort: { name: 1 },
        }),
    ]);

    const accuratelyDatedBeatmaps: Beatmap[] = []; // because mg database's "updatedAt" is wrong too often

    for (const beatmap of b) {
        const osuId = findBeatmapsetId(beatmap.url);

        const osuBeatmapResponse = await beatmapsetInfo(osuId);

        if (!isOsuResponseError(osuBeatmapResponse)) {
            const rankedDate = new Date(osuBeatmapResponse.approved_date);

            if (rankedDate > date) {
                accuratelyDatedBeatmaps.push(beatmap);
            }
        }

        await sleep(100);
    }

    const maps: any = await getMaps(date);

    const osuIds: any = [];
    const externalBeatmaps: any = [];

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
    }

    res.json({ beatmaps: accuratelyDatedBeatmaps, quests: q, externalBeatmaps });
}));

export default adminBeatmapsRouter;
