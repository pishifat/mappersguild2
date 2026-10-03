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
import { findMissionPoints, findNominatorPoints, findQuestPoints, findTaskPoints, getLengthNerf, getQuestBonus, taskPointsPopulate } from '../../helpers/points';
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
            $or: [
                { mode: res.locals.userRequest.mainMode },
                { mode: 'hybrid' },
            ],
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

    const difficulties = ['Easy', 'Normal', 'Hard', 'Insane', 'Expert'];
    let hasNoDifficulties = true;

    for (const task of req.body.tasks) {
        if (difficulties.includes(task.name)) {
            hasNoDifficulties = false;
        }
    }

    if (hasNoDifficulties) {
        return res.json({ error: 'Select at least one difficulty to map!' });
    }

    const hitsoundTask = req.body.tasks.find(t => t.name == 'Hitsounds');

    if (hitsoundTask && req.body.mode == 'taiko') {
        return res.json({ error: '"Hitsounds" are not applicable to osu!taiko' });
    }
    // validation done

    const tasks: any[] = req.body.tasks;
    const createdTasks: Task['_id'][] = [];

    for (const task of tasks) {
        const t = new TaskModel();
        t.name = task.name;
        t.mappers = task.mappers.map(u => u.id);
        t.mode = task.name == 'Storyboard' ? 'sb' : task.name == 'Hitsounds' ? 'hs' : req.body.mode == 'hybrid' && task.mode ? task.mode : req.body.mode;
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
    const beatmap = await BeatmapModel
        .findById(req.params.id)
        .populate(taskPointsPopulate)
        .populate({ path: 'bns', select: '_id osuId username' })
        .orFail();

    let length = beatmap.length;
    let rankedDate = beatmap.rankedDate;

    // length and rankedDate are only saved after rank. temporarily fetch from api if needed
    if (beatmap.status !== BeatmapStatus.Ranked || !length || !rankedDate) {
        const beatmapsetId = beatmap.url ? findBeatmapsetId(beatmap.url) : NaN;

        if (isNaN(beatmapsetId)) {
            return res.json({ error: 'Need a beatmapset link to calculate points!' });
        }

        const response = await getClientCredentialsGrant();

        if (isOsuResponseError(response)) {
            return res.json(defaultErrorMessage);
        }

        const bmInfo = await getBeatmapsetV2Info(response.access_token, beatmapsetId);

        if (isOsuResponseError(bmInfo)) {
            return res.json(defaultErrorMessage);
        }

        length = getLongestBeatmapLength(bmInfo.beatmaps);
        rankedDate = bmInfo.ranked_date ? new Date(bmInfo.ranked_date) : new Date(); // unranked maps are calculated as if they were ranked today
    }

    const lengthNerf = getLengthNerf(length);

    // mission winners aren't known until the mission closes. assume map is winner if pending
    const missionPending = beatmap.mission && !beatmap.mission.closingAnnounced;
    const isMissionWinner = missionPending || beatmap.mission?.winningBeatmaps.some(b => b.id == beatmap.id);

    // other ranked mapsets of the same song (for storyboard/skin/hitsound repeats)
    const sameSongBeatmaps = await BeatmapModel
        .find({
            _id: { $ne: beatmap._id },
            song: beatmap.song,
            status: BeatmapStatus.Ranked,
        })
        .populate({ path: 'tasks', populate: { path: 'mappers', select: '_id' } });

    // user points relative to this map
    const users = new Map<string, { username: string; points: number; sources: string[] }>();

    function addPoints(user: User, points: number, source: string): void {
        const userPoints = users.get(user.id) || { username: user.username, points: 0, sources: [] };
        userPoints.points += points;
        userPoints.sources.push(`${source}: ${Math.round(points * 10) / 10}`);
        users.set(user.id, userPoints);
    }

    // every type of points earned on this map (left column)
    const sources: { name: string; points: number }[] = [];

    // host
    addPoints(beatmap.host, 3, 'Host');
    sources.push({ name: 'Host', points: 3 });

    // tasks
    const sortOrder = Object.values(TaskName);
    const sortedTasks = [...beatmap.tasks].sort((a, b) => sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name));

    for (const task of sortedTasks) {
        let taskTotal = 0;

        // quest/mission/showcase bonuses
        let bonus = 0;

        if (beatmap.quest) {
            bonus = getQuestBonus(beatmap.quest.deadline, rankedDate, task.mappers.length);
        } else if (beatmap.mission) {
            bonus = isMissionWinner ? 2 / task.mappers.length : 0;
        } else if (beatmap.isShowcase) {
            bonus = 2 / task.mappers.length;
        }

        for (const mapper of task.mappers) {
            let repeats = 1;

            if (task.name === TaskName.Storyboard || task.name === TaskName.Skin || task.name === TaskName.Hitsounds) {
                repeats += sameSongBeatmaps.filter(b => b.tasks.some(t => t.name == task.name && t.mappers.some(m => m.id == mapper.id))).length;
            }

            const points = findTaskPoints(task.name, task.mappers.length, lengthNerf, bonus, repeats);
            taskTotal += points;
            addPoints(mapper, points, task.name);
        }

        sources.push({ name: task.name, points: Math.round(taskTotal * 10) / 10 });
    }

    // quest/mission rewards (only counted once per quest/mission for each user)
    const rewardedMappers = new Set<string>();
    const questPoints = beatmap.quest ? findQuestPoints(beatmap.quest.deadline, beatmap.quest.completed || rankedDate, rankedDate) : 0;
    const missionPoints = beatmap.mission && isMissionWinner ? findMissionPoints(beatmap.mission.tier) : 0;

    for (const task of sortedTasks) {
        for (const mapper of task.mappers) {
            if (rewardedMappers.has(mapper.id)) continue;

            if (questPoints) {
                rewardedMappers.add(mapper.id);
                addPoints(mapper, questPoints, 'Quest reward');
            } else if (missionPoints && task.name !== TaskName.Hitsounds && task.name !== TaskName.Storyboard && task.name !== TaskName.Skin) {
                rewardedMappers.add(mapper.id);
                addPoints(mapper, missionPoints, 'Mission reward');
            }
        }
    }

    if (rewardedMappers.size) {
        sources.push({ name: questPoints ? 'Quest reward (per mapper)' : 'Mission reward (per mapper)', points: questPoints || missionPoints });
    }

    // modders + nominators
    const modders = beatmap.modders.filter(modder => !beatmap.bns.some(bn => bn.id == modder.id));

    for (const modder of modders) {
        addPoints(modder, 1, 'Mod');
    }

    if (modders.length) {
        sources.push({ name: 'Mod (per modder)', points: 1 });
    }

    const nominatorPoints = findNominatorPoints(length, beatmap.tasks.length);

    for (const bn of beatmap.bns) {
        addPoints(bn, nominatorPoints, 'Nomination');
    }

    if (beatmap.bns.length) {
        sources.push({ name: 'Nomination (per BN)', points: Math.round(nominatorPoints * 10) / 10 });
    }

    // the text
    const seconds = length % 60;
    const minutes = (length - seconds) / 60;
    let pointsInfo = `based on ${minutes}m${seconds}s length`;

    if (beatmap.quest) {
        pointsInfo += `, including ~${getQuestBonus(beatmap.quest.deadline, rankedDate, 1)} quest bonus points per difficulty`;
    } else if (beatmap.mission) {
        pointsInfo += missionPending ? ', including ~2 mission bonus points per difficulty (assuming winner)' : '';
    } else if (beatmap.isShowcase) {
        pointsInfo += ', including ~2 showcase bonus points per difficulty';
    }

    const usersPoints: { username: string; points: number; sources: string[] }[] = [];

    for (const userPoints of users.values()) {
        usersPoints.push({ ...userPoints, points: Math.round(userPoints.points * 10) / 10 });
    }

    res.json({
        sources,
        usersPoints,
        pointsInfo,
    });
});

export default beatmapsRouter;
