import express from 'express';
import { BeatmapModel, Beatmap } from '../../models/beatmap/beatmap';
import { BeatmapStatus } from '../../interfaces/beatmap/beatmap';
import { TaskModel } from '../../models/beatmap/task';
import { TaskMode, TaskName } from '../../interfaces/beatmap/task';
import { UserModel } from '../../models/user';
import { isLoggedIn, isNotSpectator } from '../../helpers/middlewares';
import { isValidBeatmap, isValidUser, isBeatmapHost } from './middlewares';
import { InviteModel } from '../../models/invite';
import { ActionType } from '../../interfaces/invite';
import { NotificationModel } from '../../models/notification';
import { LogModel } from '../../models/log';
import { LogCategory } from '../../interfaces/log';
import { User } from '../../interfaces/user';

const tasksRouter = express.Router();

tasksRouter.use(isLoggedIn);

const inviteError = 'Invite not sent: ';

/* POST create task from extended view. */
tasksRouter.post('/addTask/:mapId', isNotSpectator, isValidBeatmap, async (req, res) => {
    let beatmap: Beatmap = res.locals.beatmap;
    const user: User = res.locals.userRequest;
    const isHost = beatmap.host.id == user.id;
    const taskName: TaskName = req.body.taskName;
    let taskMode: TaskMode = req.body.mode || beatmap.mode;

    if (taskName == TaskName.Storyboard) {
        taskMode = TaskMode.SB;
    }

    await beatmap.checkTaskAvailability(user, taskName, taskMode);

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

    if (beatmap.status !== BeatmapStatus.Secret) {
        LogModel.generate(
            req.session?.mongoId,
            `added "${taskName}" difficulty to "${beatmap.song.artist} - ${beatmap.song.title}"`,
            LogCategory.Beatmap
        );

        if (!isHost) {
            NotificationModel.generate(
                beatmap._id,
                `added "${taskName}" difficulty to your mapset`,
                beatmap.host._id,
                req.session?.mongoId,
                beatmap._id
            );
        }
    }

});

/* POST delete task from extended view. */
tasksRouter.post('/removeTask/:id', async (req, res) => {
    const [b, t] = await Promise.all([
        BeatmapModel
            .findOne({
                _id: req.body.beatmapId,
                status: { $ne: BeatmapStatus.Ranked },
            })
            .orFail(),

        TaskModel
            .findById(req.params.id)
            .orFail(),
    ]);

    if (t.mappers.indexOf(req.session?.mongoId) < 0 && b.host != req.session?.mongoId) {
        return res.json({ error: 'Not mapper' });
    }

    await BeatmapModel.findByIdAndUpdate(req.body.beatmapId, { $pull: { tasks: t._id } });
    await TaskModel.findByIdAndRemove(req.params.id);
    const updatedBeatmap = await BeatmapModel
        .findById(req.body.beatmapId)
        .defaultPopulate()
        .orFail();

    res.json(updatedBeatmap);

    if (updatedBeatmap.status !== BeatmapStatus.Secret) {
        LogModel.generate(
            req.session?.mongoId,
            `removed "${t.name}" from "${updatedBeatmap.song.artist} - ${updatedBeatmap.song.title}"`,
            LogCategory.Beatmap
        );

        if (updatedBeatmap.host.id != req.session?.mongoId) {
            NotificationModel.generate(
                updatedBeatmap._id,
                `removed task "${t.name}" from your mapset`,
                updatedBeatmap.host._id,
                req.session?.mongoId,
                updatedBeatmap._id
            );
        }
    }
});

/* POST invite collab user to task. */
tasksRouter.post('/task/:taskId/addCollab', isValidUser, async (req, res) => {
    const user: User = res.locals.userRequest;
    const userToRequest: User = res.locals.user;
    const taskId: any = req.params.taskId;

    const [task, beatmap] = await Promise.all([
        TaskModel
            .findOne({
                _id: taskId,
                mappers: user._id,
            })
            .orFail(),
        BeatmapModel
            .findOne({
                tasks: taskId,
                status: { $ne: BeatmapStatus.Ranked },
            })
            .defaultPopulate()
            .orFail(),
    ]);

    const taskMode: TaskMode = req.body.mode || beatmap.mode;

    if (task.mappers.some(m => m.id == userToRequest.id)) {
        throw new Error(inviteError + 'User is already a collaborator');
    }

    await beatmap.checkTaskAvailability(userToRequest, task.name, taskMode, ActionType.Collab);

    const newInvite = await InviteModel.generateMapInvite(
        userToRequest._id,
        user._id,
        req.params.taskId,
        `wants to collaborate with you on the "${task.name}" difficulty of`,
        ActionType.Collab,
        beatmap._id,
        task.name,
        taskMode
    );

    if (!newInvite) {
        return res.json({ error: inviteError + 'Invite generation failed!' });
    }

    res.json(beatmap);
});

/* POST remove collab user from task. */
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
            .orFail(),

        TaskModel
            .findOne({
                _id: req.params.taskId,
                mappers: req.session?.mongoId,
            })
            .orFail(),
    ]);

    const updatedTask = await TaskModel
        .findByIdAndUpdate(t._id, { $pull: { mappers: u._id } })
        .orFail();

    const updatedB = await BeatmapModel
        .findById(b._id)
        .defaultPopulate()
        .orFail();

    res.json(updatedB);

    if (updatedB.status !== BeatmapStatus.Secret) {
        LogModel.generate(
            req.session?.mongoId,
            `removed "${u.username}" from collab mapper of "${updatedTask.name}" on "${updatedB.song.artist} - ${
                updatedB.song.title
            }"`,
            LogCategory.Beatmap
        );
    }
});

/* POST set status of the task selected from extended view. */
tasksRouter.post('/setTaskStatus/:taskId', async (req, res) => {
    const t = await TaskModel
        .findById(req.params.taskId)
        .orFail();

    let b = await BeatmapModel
        .findOne({
            tasks: t._id,
            status: { $ne: BeatmapStatus.Ranked },
        })
        .defaultPopulate()
        .orFail();

    if (t.mappers.indexOf(req.session?.mongoId) < 0 && req.session?.mongoId != b.host.id) {
        return res.json({ error: 'Not mapper' });
    }

    t.status = req.body.status;
    await t.save();

    b = await BeatmapModel
        .findById(b._id)
        .defaultPopulate()
        .orFail();

    res.json(b);

    if (b.status !== BeatmapStatus.Secret) {
        LogModel.generate(
            req.session?.mongoId,
            `changed status of "${t.name}" on "${b.song.artist} - ${b.song.title}"`,
            LogCategory.Beatmap
        );

        if (b.host.id != req.session?.mongoId) {
            NotificationModel.generate(
                b._id,
                `changed status of "${t.name}" on your mapset`,
                b.host._id,
                req.session?.mongoId,
                b._id
            );
        }
    }
});

/* POST request added task*/
tasksRouter.post('/requestTask/:mapId', isNotSpectator, isValidUser, isValidBeatmap, isBeatmapHost, async (req, res) => {
    const user: User = res.locals.user;
    const beatmap: Beatmap = res.locals.beatmap;

    await beatmap.checkTaskAvailability(user, req.body.taskName, req.body.mode, ActionType.Create);

    res.json(beatmap);

    InviteModel.generateMapInvite(
        user._id,
        req.session?.mongoId,
        beatmap._id,
        `wants you to create the ${req.body.taskName != TaskName.Storyboard ? req.body.mode + ' difficulty' : 'task'} ${req.body.taskName} for their mapset of`,
        ActionType.Create,
        beatmap._id,
        req.body.taskName,
        req.body.mode
    );
});

export default tasksRouter;
