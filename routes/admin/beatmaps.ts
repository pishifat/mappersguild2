import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';
import { BeatmapService } from '../../models/beatmap/beatmap';
import { BeatmapStatus } from '../../interfaces/beatmap/beatmap';
import { canFail, defaultErrorMessage } from '../../helpers/helpers';
import { TaskService, Task } from '../../models/beatmap/task';
import { beatmapsetInfo, isOsuReponseError } from '../../helpers/osuApi';
import { webhookPost } from '../../helpers/discordApi';

const adminBeatmapsRouter = express.Router();

adminBeatmapsRouter.use(isLoggedIn);
adminBeatmapsRouter.use(isAdmin);


/* GET beatmaps */
adminBeatmapsRouter.get('/loadBeatmaps/', async (req, res) => {
    const b = await BeatmapService.queryAll({
        defaultPopulate: true,
        sort: {
            status: 1,
            mode: 1,
            createdAt: -1,
        },
    });

    res.json({ b });
});

/* POST update map status */
adminBeatmapsRouter.post('/updateBeatmapStatus/:id', isSuperAdmin, canFail(async (req, res) => {
    let b = await BeatmapService.updateOrFail(req.params.id, { status: req.body.status });

    if (req.body.status == BeatmapStatus.Done) {
        for (let i = 0; i < b.tasks.length; i++) {
            await TaskService.update(b.tasks[i] as any, { status: BeatmapStatus.Done });
        }
    }

    if (req.body.status == BeatmapStatus.Ranked) {
        const indexStart = b.url.indexOf('beatmapsets/') + 'beatmapsets/'.length;
        const indexEnd = b.url.indexOf('#');
        let bmId = '';

        if (indexEnd !== -1) {
            bmId = b.url.slice(indexStart, indexEnd);
        } else {
            bmId = b.url.slice(indexStart);
        }

        const bmInfo = await beatmapsetInfo(parseInt(bmId, 10));

        if (isOsuReponseError(bmInfo)) {
            return res.json(defaultErrorMessage);
        }

        await BeatmapService.update(b._id, { length: bmInfo.hit_length });
        b = await BeatmapService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

        const gdUsernames: string[] = [];

        b.tasks.forEach((task: Task) => {
            task.mappers.forEach(mapper => {
                if (gdUsernames.indexOf(mapper.username) == -1 && mapper.username != b.host.username) {
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

    b = await BeatmapService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

    res.json(b);
}));

/* POST delete task */
adminBeatmapsRouter.post('/deleteTask/:id', isSuperAdmin, canFail(async (req, res) => {
    await Promise.all([
        BeatmapService.updateOrFail(req.params.id, {
            $pull: {
                tasks: req.body.taskId,
            },
        }),
        TaskService.removeOrFail(req.body.taskId),
    ]);

    const b = await BeatmapService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

    res.json(b);
}));

/* POST delete modder */
adminBeatmapsRouter.post('/deleteModder/:id', isSuperAdmin, canFail(async (req, res) => {
    await BeatmapService.updateOrFail(req.params.id, { $pull: { modders: req.body.modderId } });
    const b = await BeatmapService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

    res.json(b);
}));

/* POST update map url */
adminBeatmapsRouter.post('/updateUrl/:id', isSuperAdmin, canFail(async (req, res) => {
    await BeatmapService.updateOrFail(req.params.id, { url: req.body.url });
    const b = await BeatmapService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

    res.json(b);
}));

/* POST update sb quality */
adminBeatmapsRouter.post('/updateStoryboardQuality/:id', isAdmin, canFail(async (req, res) => {
    await TaskService.updateOrFail(req.body.taskId, { sbQuality: req.body.storyboardQuality });
    const b = await BeatmapService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

    res.json(b);
}));

/* POST update osu beatmap pack ID */
adminBeatmapsRouter.post('/updatePackId/:id', isAdmin, canFail(async (req, res) => {
    await BeatmapService.updateOrFail(req.params.id, { packId: req.body.packId });
    const b = await BeatmapService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

    res.json(b);
}));

export default adminBeatmapsRouter;
