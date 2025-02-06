import express from 'express';
import { BeatmapModel, Beatmap } from '../../models/beatmap/beatmap';
import { BeatmapStatus } from '../../../interfaces/beatmap/beatmap';
import { TaskModel } from '../../models/beatmap/task';
import { TaskMode, TaskName } from '../../../interfaces/beatmap/task';
import { UserModel } from '../../models/user';
import { isLoggedIn, isValidUser } from '../../helpers/middlewares';
import { isValidBeatmap } from './middlewares';
import { LogModel } from '../../models/log';
import { LogCategory } from '../../../interfaces/log';
import { User, UserGroup } from '../../../interfaces/user';

const tasksRouter = express.Router();

tasksRouter.use(isLoggedIn);

/* POST create task */
tasksRouter.post('/addTask/:mapId', isValidBeatmap, isValidUser, async (req, res) => {
    let beatmap: Beatmap = res.locals.beatmap;
    const user: User = req.body.user && req.body.user.length ? res.locals.user : res.locals.userRequest;
    const taskName: TaskName = req.body.taskName;
    let taskMode: TaskMode = req.body.mode || beatmap.mode;

    if (taskName == TaskName.Storyboard) {
        taskMode = TaskMode.SB;

        const existingStoryboardTask = beatmap.tasks.find(t => t.name == TaskName.Storyboard);

        if (existingStoryboardTask) {
            return res.json({ error: 'Only one "Storyboard" task is allowed' });
        }
    }

    if (taskName == TaskName.Hitsounds) {
        taskMode = TaskMode.HS;

        const existingHitsoundsTask = beatmap.tasks.find(t => t.name == TaskName.Hitsounds);

        if (existingHitsoundsTask) {
            return res.json({ error: 'Only one "Hitsounds" task is allowed' });
        }
    }

    await beatmap.checkTaskAvailability(user, taskName, taskMode, res.locals.userRequest.group == UserGroup.Admin, req.session.mongoId);

    const t = new TaskModel();
    t.name = taskName;
    t.mappers = [user];
    t.mode = taskMode;
    await t.save();

    beatmap.tasks.push(t._id);
    await beatmap.save();

    beatmap = await BeatmapModel
        .findById(req.params.mapId)
        .defaultPopulate()
        .orFail();

    res.json(beatmap);

    LogModel.generate(
        req.session?.mongoId,
        `added "${taskName}" difficulty to "${beatmap.song.artist} - ${beatmap.song.title}"`,
        LogCategory.Beatmap
    );
});

/* POST delete task */
tasksRouter.post('/removeTask/:taskId/:mapId', isValidBeatmap, isValidUser, async (req, res) => {
    const t = await TaskModel
        .findById(req.params.taskId)
        .orFail();

    const b = res.locals.beatmap;

    if (t.mappers.indexOf(req.session?.mongoId) < 0 && b.host.id != req.session?.mongoId) {
        if (res.locals.userRequest.group !== UserGroup.Admin) {
            return res.json({ error: 'Not mapper' });
        }
    }

    await BeatmapModel.findByIdAndUpdate(req.params.mapId, { $pull: { tasks: t._id } });
    await TaskModel.findByIdAndRemove(req.params.taskId);
    const updatedBeatmap = await BeatmapModel
        .findById(req.params.mapId)
        .defaultPopulate()
        .orFail();

    res.json(updatedBeatmap);

    LogModel.generate(
        req.session?.mongoId,
        `removed "${t.name}" from "${updatedBeatmap.song.artist} - ${updatedBeatmap.song.title}"`,
        LogCategory.Beatmap
    );
});

/* POST add mapper to task */
tasksRouter.post('/addCollab/:mapId', isValidBeatmap, isValidUser, async (req, res) => {
    let beatmap: Beatmap = res.locals.beatmap;
    const user: User = req.body.user && req.body.user.length ? res.locals.user : res.locals.userRequest;
    const task = await TaskModel
        .findById(req.body.task._id)
        .populate('mappers')
        .orFail();

    if (task.mappers.some(m => m.id == user.id)) {
        return res.json({ error: 'User is already a mapper for this difficulty!' });
    }

    await TaskModel.findByIdAndUpdate(task.id, { $push: { mappers: user._id } });

    beatmap = await BeatmapModel
        .findById(req.params.mapId)
        .defaultPopulate()
        .orFail();

    res.json(beatmap);

    LogModel.generate(
        req.session?.mongoId,
        `added collab mapper to "${task.name}" difficulty to "${beatmap.song.artist} - ${beatmap.song.title}"`,
        LogCategory.Beatmap
    );
});

/* POST remove collab user from task */
tasksRouter.post('/task/:taskId/removeCollab', async (req, res) => {
    const taskId: any = req.params.taskId;

    const [u, b, t] = await Promise.all([
        UserModel
            .findById(req.body.user)
            .orFail(),

        BeatmapModel
            .findOne({
                tasks: taskId,
                status: { $ne: BeatmapStatus.Ranked },
            })
            .populate('host')
            .orFail(),

        TaskModel
            .findOne({
                _id: req.params.taskId,
            })
            .populate('mappers')
            .orFail(),
    ]);

    const isMapper = t.mappers.some(m => m.id == req.session?.mongoId);
    const isHost = b.host.id == req.session?.mongoId;
    const isPishifat = req.session?.osuId == 3178418;

    if (!isMapper && !isHost && !isPishifat) {
        return res.json({ error: 'Not allowed to edit' });
    }

    const updatedTask = await TaskModel
        .findByIdAndUpdate(t._id, { $pull: { mappers: u._id } })
        .orFail();

    const updatedBeatmap = await BeatmapModel
        .findById(b._id)
        .defaultPopulate()
        .orFail();

    res.json(updatedBeatmap);

    LogModel.generate(
        req.session?.mongoId,
        `removed "${u.username}" from collab mapper of "${updatedTask.name}" on "${updatedBeatmap.song.artist} - ${
            updatedBeatmap.song.title
        }"`,
        LogCategory.Beatmap
    );
});

/* POST set status of the task selected from extended view. */
tasksRouter.post('/setTaskStatus/:taskId', async (req, res) => {
    const t = await TaskModel
        .findById(req.params.taskId)
        .orFail();

    let b = await BeatmapModel
        .findOne({
            tasks: t._id,
            status: req.session.osuId == 3178418 ? { $exists: true } : { $ne: BeatmapStatus.Ranked },
        })
        .defaultPopulate()
        .orFail();

    if (t.mappers.indexOf(req.session?.mongoId) < 0 && req.session?.mongoId != b.host.id) {
        if (res.locals.userRequest.group !== UserGroup.Admin) {
            return res.json({ error: 'Not mapper' });
        }
    }

    t.status = req.body.status;
    await t.save();

    b = await BeatmapModel
        .findById(b._id)
        .defaultPopulate()
        .orFail();

    res.json(b);

    LogModel.generate(
        req.session?.mongoId,
        `changed status of "${t.name}" on "${b.song.artist} - ${b.song.title}"`,
        LogCategory.Beatmap
    );
});

export default tasksRouter;
