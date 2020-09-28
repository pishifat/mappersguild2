import express from 'express';
import { BeatmapModel, Beatmap } from '../../models/beatmap/beatmap';
import { BeatmapMode, BeatmapStatus } from '../../interfaces/beatmap/beatmap';
import { TaskModel, Task } from '../../models/beatmap/task';
import { TaskName } from '../../interfaces/beatmap/task';
import { QuestStatus } from '../../interfaces/quest';
import { QuestModel } from '../../models/quest';
import { NotificationModel } from '../../models/notification';
import { LogModel } from '../../models/log';
import { LogCategory } from '../../interfaces/log';
import { isLoggedIn, isNotSpectator, isBn } from '../../helpers/middlewares';
import { findDifficultyPoints, findLengthNerf, findQuestBonus } from '../../helpers/points';
import { defaultErrorMessage, findBeatmapsetId } from '../../helpers/helpers';
import { beatmapsetInfo, isOsuResponseError } from '../../helpers/osuApi';
import { isValidBeatmap } from './middlewares';

const beatmapsRouter = express.Router();

beatmapsRouter.use(isLoggedIn);

/* GET maps page. */
beatmapsRouter.get('/', (req, res) => {
    res.render('beatmaps', {
        title: 'Beatmaps',
        script: 'beatmaps.js',
        isMaps: true,
        loggedInAs: req.session?.osuId,
        userMongoId: req.session?.mongoId,
        pointsInfo: res.locals.userRequest.pointsInfo,
    });
});

/* GET info for page load */
beatmapsRouter.get('/relevantInfo', async (req, res) => {
    const hostBeatmaps = await BeatmapModel
        .find({
            host: req.session?.mongoId,
            mode: res.locals.userRequest.mainMode,
            status: { $ne: BeatmapStatus.Secret },
        })
        .defaultPopulate()
        .sortByLastest();

    res.json({
        beatmaps: hostBeatmaps,
        userOsuId: req.session?.osuId,
        userMongoId: req.session?.mongoId,
        username: req.session?.username,
        group: res.locals.userRequest.group,
        mainMode: res.locals.userRequest.mainMode,
    });
});

/* GET map load from URL */
beatmapsRouter.get('/searchOnLoad/:id', async (req, res) => {
    const urlBeatmap = await BeatmapModel.findOne( { _id: req.params.id, status: { $ne: BeatmapStatus.Secret } }).defaultPopulate();

    if (!urlBeatmap) {
        return res.json({ error: 'Beatmap ID does not exist!' });
    }

    res.json(urlBeatmap);
});

/* GET guest difficulty related beatmaps */
beatmapsRouter.get('/guestBeatmaps', async (req, res) => {
    const ownTasks = await TaskModel
        .find({ mappers: req.session?.mongoId })
        .select('_id');

    const userBeatmaps = await BeatmapModel
        .find({
            status: { $ne: BeatmapStatus.Secret },
            $or: [
                {
                    tasks: {
                        $in: ownTasks,
                    },
                },
                {
                    host: req.session?.mongoId,
                },
            ],
        })
        .defaultPopulate()
        .sortByLastest();

    res.json({ userBeatmaps });
});

/* GET mode-specific beatmaps */
beatmapsRouter.get('/search', async (req, res) => {
    if (!req.query.mode || !req.query.limit) {
        return res.json({ error: 'Missing mode filter...' });
    }

    const mode = req.query.mode as BeatmapMode | 'any';
    const limit = req.query.limit && parseInt(req.query.limit.toString(), 10);
    const status = req.query.status as BeatmapStatus | undefined;
    const quest = req.query.quest as 'none' | undefined;
    const search = req.query.search as string | undefined;

    const allBeatmapsQuery = BeatmapModel.find({
        host: { $ne: req.session?.mongoId },
        status: { $ne: BeatmapStatus.Secret },
    });

    if (mode != 'any') {
        allBeatmapsQuery.or([
            { mode },
            { mode: BeatmapMode.Hybrid },
        ]);
    }

    if (status) allBeatmapsQuery.where('status', status);
    if (quest) allBeatmapsQuery.exists('quest', false);

    // this actually returns every map, pretty dumb, need to fix somehow
    if (!search && limit) allBeatmapsQuery.limit(limit);
    let allBeatmaps = await allBeatmapsQuery.defaultPopulate().sortByLastest();

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
});

/* GET quests for linking quest to beatmap */
beatmapsRouter.get('/users/quests', async (req, res) => {
    const userQuests = await QuestModel.getUserQuests(req.session?.mongoId);

    res.json({ userQuests });
});

/* POST create new map */
beatmapsRouter.post('/create', isNotSpectator, async (req, res) => {
    if (!req.body.song) {
        return res.json({ error: 'Missing song!' });
    }

    if (req.body.tasks.length < 1) {
        return res.json({ error: 'Select at least one difficulty to map!' });
    }

    const tasks: TaskName[] = req.body.tasks;
    const createdTasks: Task['_id'][] = [];

    for (let i = 0; i < tasks.length; i++) {
        const t = new TaskModel();
        t.name = tasks[i];
        t.mappers = req.session?.mongoId;
        t.mode = req.body.mode;
        await t.save();

        createdTasks.push(t._id);
    }

    let locks: TaskName[] = [];

    if (req.body.tasksLocked) {
        locks = req.body.tasksLocked;
    }

    const newBeatmap = new BeatmapModel();
    newBeatmap.host = req.session?.mongoId;
    newBeatmap.tasks = createdTasks;
    newBeatmap.tasksLocked = locks;
    newBeatmap.song = req.body.song;
    newBeatmap.mode = req.body.mode;
    newBeatmap.status = req.body.status;
    await newBeatmap.save();

    if (!newBeatmap) {
        return res.json(defaultErrorMessage);
    }

    const b = await BeatmapModel
        .findById(newBeatmap._id)
        .defaultPopulate()
        .orFail();

    res.json(b);

    if (newBeatmap.status == BeatmapStatus.WIP) {
        LogModel.generate(
            req.session?.mongoId,
            `created new map "${b.song.artist} - ${b.song.title}"`,
            LogCategory.Beatmap
        );
    }
});

/* POST modder from extended view, returns new modders list. */
beatmapsRouter.post('/:id/updateModder', isNotSpectator, async (req, res) => {
    const isAlreadyModder = await BeatmapModel.findOne({
        _id: req.params.id,
        modders: req.session?.mongoId,
    });
    let update;

    if (isAlreadyModder) {
        update = { $pull: { modders: req.session?.mongoId } };
    } else {
        update = { $push: { modders: req.session?.mongoId } };
    }

    let b = await BeatmapModel
        .findById(req.params.id)
        .orFail();

    if (b.status == BeatmapStatus.Ranked) {
        return res.json({ error: 'Mapset ranked' });
    }

    await BeatmapModel.findByIdAndUpdate(req.params.id, update);
    b = await BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();

    res.json(b);

    if (b.status !== BeatmapStatus.Secret) {
        if (isAlreadyModder) {
            LogModel.generate(
                req.session?.mongoId,
                `removed from modder list on "${b.song.artist} - ${b.song.title}"`,
                LogCategory.Beatmap
            );
            NotificationModel.generate(
                b._id,
                `removed themself from the modder list of your mapset`,
                b.host.id,
                req.session?.mongoId,
                b._id
            );
        } else {
            LogModel.generate(
                req.session?.mongoId,
                `modded "${b.song.artist} - ${b.song.title}"`,
                LogCategory.Beatmap
            );
            NotificationModel.generate(
                b._id,
                `modded your mapset`,
                b.host.id,
                req.session?.mongoId,
                b._id
            );
        }
    }
});

/* POST bn from extended view, returns new bns list. */
beatmapsRouter.post('/:id/updateBn', isNotSpectator, isValidBeatmap, async (req, res) => {
    const b: Beatmap = res.locals.beatmap;
    const isAlreadyBn = await BeatmapModel.findOne({
        _id: req.params.id,
        bns: req.session?.mongoId,
    });
    let update;

    if (isAlreadyBn) {
        update = { $pull: { bns: req.session?.mongoId } };
    } else if (isBn(req.session?.accessToken)) {
        let hasTask = false;

        b.tasks.forEach(task => {
            task.mappers.forEach(mapper => {
                if (mapper.id == req.session?.mongoId) {
                    hasTask = true;
                }
            });
        });

        if (hasTask) {
            return res.json({ error: `You can't nominate a mapset you've done a task for!` });
        }

        update = { $push: { bns: req.session?.mongoId } };
    } else {
        return res.json(defaultErrorMessage);
    }

    await BeatmapModel.findByIdAndUpdate(req.params.id, update);
    const updatedBeatmap = await BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();

    res.json(updatedBeatmap);

    if (updatedBeatmap.status !== BeatmapStatus.Secret) {
        if (isAlreadyBn) {
            LogModel.generate(
                req.session?.mongoId,
                `removed from Beatmap Nominator list on "${updatedBeatmap.song.artist} - ${updatedBeatmap.song.title}"`,
                LogCategory.Beatmap
            );
            NotificationModel.generate(
                updatedBeatmap._id,
                `removed themself from the Beatmap Nominator list on your mapset`,
                updatedBeatmap.host.id,
                req.session?.mongoId,
                updatedBeatmap._id
            );
        } else {
            LogModel.generate(
                req.session?.mongoId,
                `added to Beatmap Nominator list on "${updatedBeatmap.song.artist} - ${updatedBeatmap.song.title}"`,
                LogCategory.Beatmap
            );
            NotificationModel.generate(
                updatedBeatmap._id,
                `added themself to the Beatmap Nominator list on your mapset`,
                updatedBeatmap.host.id,
                req.session?.mongoId,
                updatedBeatmap._id
            );
        }
    }
});

/* GET guest difficulty related beatmaps */
beatmapsRouter.get('/:id/findPoints', async (req, res) => {
    const beatmap = await BeatmapModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();

    if (!beatmap.url) {
        return res.json({ error: 'Need a beatmapset link to calculate points!' });
    }

    const beatmapsetId = findBeatmapsetId(beatmap.url);

    if (isNaN(beatmapsetId)) {
        return res.json({ error: 'Need a beatmapset link to calculate points!' });
    }

    const bmInfo = await beatmapsetInfo(beatmapsetId);

    if (isOsuResponseError(bmInfo)) {
        return res.json({ error: defaultErrorMessage });
    }

    // sort tasks to expected difficulty scaling
    const sortOrder = Object.values(TaskName);

    beatmap.tasks.sort(function(a, b) {
        return sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name);
    });

    // set up task points info
    const tasksPointsArray: string[] = [];

    const lengthNerf = findLengthNerf(bmInfo.hit_length);
    const seconds = bmInfo.hit_length % 60;
    const minutes = (bmInfo.hit_length - seconds) / 60;
    const lengthDisplay = `${minutes}m${seconds}s`;

    let pointsInfo = `based on ${lengthDisplay} length`;

    const rankedDate = beatmap.status != 'Ranked' ? new Date() : bmInfo.approved_date;

    let validQuest = false;
    let questBonus = 0;

    let totalPoints = 0;

    // set up user points info
    const usersPointsArrays: any[] = [];
    const mappers: string[] = [];

    beatmap.tasks.forEach(task => {
        task.mappers.forEach(mapper => {
            if (!mappers.includes(mapper.username)) {
                mappers.push(mapper.username);
                usersPointsArrays.push([mapper.username, 0]);
            }
        });
    });

    // calculate points
    beatmap.tasks.forEach(task => {
        if (task.name != TaskName.Storyboard) {
            // difficulty-specific points
            const taskPoints = findDifficultyPoints(task.name, 1);

            if (beatmap.quest) {
                questBonus = findQuestBonus(QuestStatus.Done, beatmap.quest.deadline, rankedDate, 1);
                validQuest = true;
            }

            const finalPoints = ((taskPoints + questBonus)*lengthNerf);

            totalPoints += finalPoints;
            tasksPointsArray.push(`${task.name}: ${finalPoints.toFixed(1)}`);

            // user-specific points
            task.mappers.forEach(mapper => {
                const userTaskPoints = findDifficultyPoints(task.name, task.mappers.length);

                usersPointsArrays.forEach(userArray => {
                    if (userArray[0] == mapper.username) {
                        userArray[1] += Math.round(((userTaskPoints + (questBonus/task.mappers.length))*lengthNerf)*10)/10;
                    }
                });
            });
        } else {
            tasksPointsArray.push(`${task.name}: TBD`);
        }
    });

    if (validQuest) {
        pointsInfo += ` + includes ${questBonus == 1 ? questBonus + ' quest bonus point' : questBonus + ' quest bonus points'} per difficulty`;
    }

    res.json({ tasksPointsArray, usersPointsArrays, pointsInfo, totalPoints });
});

export default beatmapsRouter;
