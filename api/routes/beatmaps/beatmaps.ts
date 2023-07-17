import express from 'express';
import { BeatmapModel, Beatmap } from '../../models/beatmap/beatmap';
import { BeatmapMode, BeatmapStatus } from '../../../interfaces/beatmap/beatmap';
import { TaskModel, Task } from '../../models/beatmap/task';
import { TaskName } from '../../../interfaces/beatmap/task';
import { LogModel } from '../../models/log';
import { UserModel } from '../../models/user';
import { LogCategory } from '../../../interfaces/log';
import { User } from '../../../interfaces/user';
import { isLoggedIn, isBn } from '../../helpers/middlewares';
import { findDifficultyPoints, getLengthNerf, getQuestBonus, findStoryboardPoints } from '../../helpers/points';
import { defaultErrorMessage, findBeatmapsetId, getLongestBeatmapLength } from '../../helpers/helpers';
import { getClientCredentialsGrant, getBeatmapsetV2Info, isOsuResponseError } from '../../helpers/osuApi';
import { isValidBeatmap } from './middlewares';

const beatmapsRouter = express.Router();

beatmapsRouter.use(isLoggedIn);

/* GET info for page load */
beatmapsRouter.get('/relevantInfo', async (req, res) => {
    const hostBeatmaps = await BeatmapModel
        .find({
            host: req.session?.mongoId,
            mode: res.locals.userRequest.mainMode,
        })
        .defaultPopulate()
        .sortByLatest();

    res.json({
        beatmaps: hostBeatmaps,
        mainMode: res.locals.userRequest.mainMode,
    });
});

/* GET map load from URL */
beatmapsRouter.get('/searchOnLoad/:id', async (req, res) => {
    const urlBeatmap = await BeatmapModel.findOne( { _id: req.params.id }).defaultPopulate();

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
        .sortByLatest();

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
    let allBeatmaps = await allBeatmapsQuery.defaultPopulate().sortByLatest();

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

/* POST create new map */
beatmapsRouter.post('/create', async (req, res) => {
    // quick validation
    if (!req.body.song) {
        return res.json({ error: 'Missing song!' });
    }

    if (req.body.tasks.length < 1) {
        return res.json({ error: 'Select at least one difficulty to map!' });
    }

    const tasks: any[] = req.body.tasks;
    const createdTasks: Task['_id'][] = [];

    for (const task of tasks) {
        const t = new TaskModel();
        t.name = task.name;
        t.mappers = task.mappers.map(u => u.id);
        t.mode = task.name == 'Storyboard' ? 'sb' : req.body. mode == 'hybrid' && task.mode ? task.mode : req.body.mode;
        t.status = task.status;
        await t.save();

        createdTasks.push(t._id);
    }

    let locks: TaskName[] = [];

    if (req.body.tasksLocked && req.body.tasksLocked.length) {
        locks = req.body.tasksLocked;
    }

    const newBeatmap = new BeatmapModel();
    newBeatmap.host = req.session?.mongoId;
    newBeatmap.tasks = createdTasks;
    newBeatmap.tasksLocked = locks;
    newBeatmap.song = req.body.song;
    newBeatmap.mode = req.body.mode;
    newBeatmap.status = BeatmapStatus.WIP;
    await newBeatmap.save();

    if (!newBeatmap) {
        return res.json(defaultErrorMessage);
    }

    const b = await BeatmapModel
        .findById(newBeatmap._id)
        .defaultPopulate()
        .orFail();

    res.json(b);

    LogModel.generate(
        req.session?.mongoId,
        `created new map "${b.song.artist} - ${b.song.title}"`,
        LogCategory.Beatmap
    );
});

/* POST validate users from user input */
beatmapsRouter.get('/validateUsers/:userInput', async (req, res) => {
    const userInput = req.params.userInput;
    const usersSplit = userInput.split(',');

    if (!usersSplit.length) {
        return res.json({ error: 'No mapper input' });
    }

    const finalUsers: User[] = [];

    for (const user of usersSplit) {
        const validUser = await UserModel
            .findOne()
            .byUsernameOrOsuId(user);

        if (!validUser) {
            return res.json({ error: `"${user}" doesn't match an existing user.` });
        }

        finalUsers.push(validUser);
    }

    res.json(finalUsers);
});

/* POST modder from extended view, returns new modders list. */
beatmapsRouter.post('/:id/updateModder', async (req, res) => {
    const isAlreadyModder = await BeatmapModel.findOne({
        _id: req.params.id,
        modders: req.session?.mongoId,
    });
    let update;

    if (isAlreadyModder) {
        update = { $pull: { modders: req.session?.mongoId }, queuedForRank: false };
    } else {
        update = { $push: { modders: req.session?.mongoId }, queuedForRank: false };
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

    if (isAlreadyModder) {
        LogModel.generate(
            req.session?.mongoId,
            `removed from modder list on "${b.song.artist} - ${b.song.title}"`,
            LogCategory.Beatmap
        );
    } else {
        LogModel.generate(
            req.session?.mongoId,
            `modded "${b.song.artist} - ${b.song.title}"`,
            LogCategory.Beatmap
        );
    }
});

/* POST bn from extended view, returns new bns list. */
beatmapsRouter.post('/:id/updateBn', isValidBeatmap, async (req, res) => {
    const b: Beatmap = res.locals.beatmap;
    const isAlreadyBn = await BeatmapModel.findOne({
        _id: req.params.id,
        bns: req.session?.mongoId,
    });
    let update;

    if (isAlreadyBn) {
        update = { $pull: { bns: req.session?.mongoId } };
    } else if (await isBn(req.session?.accessToken)) {
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

    if (isAlreadyBn) {
        LogModel.generate(
            req.session?.mongoId,
            `removed from Beatmap Nominator list on "${updatedBeatmap.song.artist} - ${updatedBeatmap.song.title}"`,
            LogCategory.Beatmap
        );
    } else {
        LogModel.generate(
            req.session?.mongoId,
            `added to Beatmap Nominator list on "${updatedBeatmap.song.artist} - ${updatedBeatmap.song.title}"`,
            LogCategory.Beatmap
        );
    }
});

/* GET calculate points for a given beatmap */
beatmapsRouter.get('/:id/findPoints', async (req, res) => {
    const [beatmap, response] = await Promise.all([
        BeatmapModel
            .findById(req.params.id)
            .defaultPopulate()
            .orFail(),
        getClientCredentialsGrant(),
    ]);

    // check if token exists
    if (isOsuResponseError(response)) {
        return res.json(defaultErrorMessage);
    }

    // set token
    const token = response.access_token;

    // check if url is valid
    if (!beatmap.url) {
        return res.json({ error: 'Need a beatmapset link to calculate points!' });
    }

    const beatmapsetId = findBeatmapsetId(beatmap.url);

    if (isNaN(beatmapsetId)) {
        return res.json({ error: 'Need a beatmapset link to calculate points!' });
    }

    // get osu-web beatmap info
    const bmInfo = await getBeatmapsetV2Info(token, beatmapsetId);

    if (isOsuResponseError(bmInfo)) {
        return res.json(defaultErrorMessage);
    }

    // sort tasks to expected difficulty scaling
    const sortOrder = Object.values(TaskName);

    beatmap.tasks.sort(function(a, b) {
        return sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name);
    });

    // set up task points info
    const tasksPointsArray: string[] = [];

    const length = getLongestBeatmapLength(bmInfo.beatmaps);
    const lengthNerf = getLengthNerf(length);
    const seconds = length % 60;
    const minutes = (length - seconds) / 60;
    const lengthDisplay = `${minutes}m${seconds}s`;

    let pointsInfo = `based on ${lengthDisplay} length and ${beatmap.tasks.length} difficulties`;

    const rankedDate = beatmap.status != 'Ranked' ? new Date() : bmInfo.ranked_date;

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
        if (task.name == TaskName.Storyboard) {
            const taskPoints = findStoryboardPoints(task.sbQuality);
            tasksPointsArray.push(`${task.name}: ${taskPoints == 0 ? 'TBD' : taskPoints}`);
        } else {
            // difficulty-specific points
            const taskPoints = findDifficultyPoints(task.name, 1);

            if (beatmap.quest) {
                questBonus = getQuestBonus(beatmap.quest.deadline, new Date(rankedDate), 1);
                validQuest = true;
            }

            const finalPoints = ((taskPoints + questBonus)*lengthNerf);

            totalPoints += finalPoints;
            tasksPointsArray.push(`${task.name}: ${finalPoints.toFixed(1)}`);
        }

        // user-specific points
        task.mappers.forEach(mapper => {
            let userTaskPoints;

            if (task.name == TaskName.Storyboard) {
                userTaskPoints = findStoryboardPoints(task.sbQuality);
            } else {
                userTaskPoints = findDifficultyPoints(task.name, task.mappers.length);
            }

            usersPointsArrays.forEach(userArray => {
                if (userArray[0] == mapper.username) {
                    if (task.name == TaskName.Storyboard) {
                        userArray[1] += Math.round((userTaskPoints/task.mappers.length)*10)/10;
                    } else {
                        userArray[1] += Math.round(((userTaskPoints + (questBonus/task.mappers.length))*lengthNerf)*10)/10;
                    }
                }
            });
        });
    });

    if (validQuest) {
        pointsInfo += ` + includes ${questBonus == 1 ? questBonus + ' quest bonus point' : questBonus + ' quest bonus points'} per difficulty`;
    }

    // calculate bn points
    let bnPoints = getLengthNerf((beatmap.length*beatmap.tasks.length)/1.5);

    if (bnPoints < 1) {
        bnPoints = 1;
    }

    res.json({ tasksPointsArray, usersPointsArrays, pointsInfo, totalPoints, bnPoints });
});

export default beatmapsRouter;
