import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';
import { BeatmapModel } from '../../models/beatmap/beatmap';
import { FeaturedArtistModel } from '../../models/featuredArtist';
import { BeatmapStatus } from '../../interfaces/beatmap/beatmap';
import { FeaturedSong } from '../../interfaces/featuredSong';
import { QuestModel } from '../../models/quest';
import { findBeatmapsetId, defaultErrorMessage } from '../../helpers/helpers';
import { updateUserPoints } from '../../helpers/points';
import { TaskModel } from '../../models/beatmap/task';
import { beatmapsetInfo, getMaps, isOsuResponseError } from '../../helpers/osuApi';
import { webhookPost, webhookColors } from '../../helpers/discordApi';
import { TaskName, TaskStatus } from '../../interfaces/beatmap/task';
import { User, UserGroup } from '../../interfaces/user';
import { UserModel } from '../../models/user';

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
    let b = await BeatmapModel
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

        // set length (for task points calculation) and ranked date (for quest points calculation) according to osu! db
        b.length = bmInfo.hit_length;
        b.rankedDate = bmInfo.approved_date;
        await b.save();

        // query for populated beatmap
        b = await BeatmapModel
            .findById(req.params.id)
            .defaultPopulate()
            .orFail();

        // calculate points for modders
        for (const modder of b.modders) {
            updateUserPoints(modder.id);
        }

        // calculate points for host
        updateUserPoints(b.host.id);

        // establish empty variables
        const gdUsernames: string[] = [];
        const gdUsers: User[] = [];
        const modes: string[] = [];
        let storyboard;

        // fill empty variables with data
        for (const task of b.tasks) {
            if (task.mode == 'sb' && task.mappers[0].id != b.host.id) {
                storyboard = task;
            } else if (task.mode != 'sb') {
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
        }

        // create template for webhook descriptiuon
        let gdText = '';

        if (!gdUsers.length) {
            gdText = '\nNo guest difficulties';
        } else if (gdUsers.length > 1) {
            gdText = '\nGuest difficulties by ';
        } else if (gdUsers.length == 1) {
            gdText = '\nGuest difficulty by ';
        }

        // add users to webhook description
        if (gdUsers.length) {
            for (let i = 0; i < gdUsers.length; i++) {
                const user = gdUsers[i];
                gdText += `[**${user.username}**](https://osu.ppy.sh/users/${user.osuId})`;

                if (i+1 < gdUsers.length) {
                    gdText += ', ';
                }

                // update points for all guest difficulty creators
                updateUserPoints(user.id);
            }
        }

        let storyboardText = '';

        // add storyboarder to webhook and update points for storyboarder
        if (storyboard) {
            const storyboarder = storyboard.mappers[0];
            storyboardText = `\nStoryboard by [**${storyboarder.username}**](https://osu.ppy.sh/users/${storyboarder.osuId})`;
            updateUserPoints(storyboarder.id);
        }

        let showcaseText = '';

        if (b.isShowcase) {
            const artist = await FeaturedArtistModel.findOne({ songs: b.song._id as FeaturedSong });
            if (artist) showcaseText = `\n\nThis beatmap was created for [${b.song.artist}](https://osu.ppy.sh/beatmaps/artists/${artist.osuId})'s Featured Artist announcement!`;
        }

        const description = `💖 [**${b.song.artist} - ${b.song.title}**](${b.url}) [**${modes.join(', ')}**] has been ranked\n\nHosted by [**${b.host.username}**](https://osu.ppy.sh/users/${b.host.osuId})${gdText}${storyboardText}${showcaseText}`;

        // publish webhook
        webhookPost([{
            color: webhookColors.blue,
            description,
            thumbnail: {
                url: `https://assets.ppy.sh/beatmaps/${osuId}/covers/list.jpg`,
            },
        }]);
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
            .sort({ requiredMapsets: 1 })
            .orFail(),

        UserModel
            .find({ group: { $ne: UserGroup.Spectator } })
            .orFail(),
    ]);

    const maps: any = await getMaps(date);
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
    }

    const users: UserSummary[] = [];

    for (const user of u as UserCounts[]) {
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

            if (beatmap.host.id == user.id) user.hostCount++;
        }

        if (user.taskCount >= 10 || user.hostCount >= 3) {
            users.push({ username: user.username, osuId: user.osuId, taskCount: user.taskCount, hostCount: user.hostCount });
        }
    }

    users.sort(function(a,b) {
        if (a.hostCount < b.hostCount) return 1;
        if (a.hostCount > b.hostCount) return -1;

        return 0;
    });

    res.json({ beatmaps: b, quests: q, externalBeatmaps, users });
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
