import express from 'express';
import { BeatmapModel, Beatmap } from '../../models/beatmap/beatmap';
import { BeatmapMode, BeatmapStatus } from '../../interfaces/beatmap/beatmap';
import { TaskModel, Task } from '../../models/beatmap/task';
import { TaskName } from '../../interfaces/beatmap/task';
import { UserModel } from '../../models/user';
import { isLoggedIn, isNotSpectator } from '../../helpers/middlewares';
import { defaultErrorMessage, BasicResponse } from '../../helpers/helpers';
import { isValidBeatmap, isValidUser, isBeatmapHost } from './middlewares';
import { QuestModel } from '../../models/quest';
import { InviteModel } from '../../models/invite';
import { ActionType } from '../../interfaces/invite';
import { NotificationModel } from '../../models/notification';
import { LogModel } from '../../models/log';
import { LogCategory } from '../../interfaces/log';
import { User } from 'interfaces/user';

const tasksRouter = express.Router();

tasksRouter.use(isLoggedIn);

//used in addtask, requesttask, addcollab
async function addTaskChecks(userId: Beatmap['_id'], b: Beatmap, taskName: TaskName, taskMode: BeatmapMode, isHost: boolean): Promise<BasicResponse> {
    if (b.tasks.length > 20 && taskName) {
        return { error: 'This mapset has too many difficulties!' };
    }

    if (taskName == TaskName.Storyboard) {
        let sb = false;

        b.tasks.forEach(task => {
            if (task.name == TaskName.Storyboard) {
                sb = true;
            }
        });

        if (sb) {
            return { error: 'There can only be one storyboard on a mapset!' };
        }
    }

    if (b.quest && taskName != TaskName.Storyboard) {
        const q = await QuestModel
            .findOne({ _id: b.quest })
            .defaultPopulate();

        let validMapper = false;

        if (!q) {
            return defaultErrorMessage;
        }

        q.currentParty.members.forEach(member => {
            if (member.id == userId) {
                validMapper = true;
            }
        });

        if (!validMapper) {
            return { error: `This mapset is part of a quest, so only members of the quest's current party can add difficulties!` };
        }

        if (taskMode && !b.quest.modes.includes(taskMode)) {
            return { error: `The selected quest doesn't support beatmaps of this mode!` };
        }
    }

    const isAlreadyBn = await BeatmapModel.findOne({
        _id: b._id,
        bns: userId,
    });

    if (isAlreadyBn) {
        return { error: 'Cannot create a difficulty while in BN list!' };
    }

    if (b.tasksLocked && !isHost && taskName) {
        let locked = false;

        b.tasksLocked.forEach(task => {
            if (taskName == task) {
                locked = true;
            }
        });

        if (locked) {
            return { error: 'This task is locked by the mapset host!' };
        }
    }

    return { success: 'ok' };
}

const inviteError = 'Invite not sent: ';

/* POST create task from extended view. */
tasksRouter.post('/addTask/:mapId', isNotSpectator, isValidBeatmap, async (req, res) => {
    let b = res.locals.beatmap;
    const isHost = b.host.id == req.session?.mongoId;
    const valid = await addTaskChecks(
        req.session?.mongoId,
        b,
        req.body.taskName,
        req.body.mode,
        isHost
    );

    if (valid.error) {
        return res.json(valid);
    }

    let mode = req.body.mode;

    if (!mode) {
        mode = b.mode;
    }

    if (req.body.taskName == TaskName.Storyboard) {
        mode = 'sb';
    }

    const t = new TaskModel();
    t.name = req.body.taskName;
    t.mappers = req.session?.mongoId;
    t.mode = mode;
    await t.save();

    if (!t) {
        return res.json(defaultErrorMessage);
    }

    b.tasks.push(t._id);
    await b.save();

    b = await BeatmapModel.findById(req.params.mapId).defaultPopulate();

    res.json(b);

    LogModel.generate(
        req.session?.mongoId,
        `added "${req.body.taskName}" difficulty to "${b.song.artist} - ${b.song.title}"`,
        LogCategory.Beatmap
    );

    if (!isHost) {
        NotificationModel.generate(
            b.id,
            `added "${req.body.taskName}" difficulty to your mapset`,
            b.host.id,
            req.session?.mongoId,
            b.id
        );
    }
});

/* POST delete task from extended view. */
tasksRouter.post('/removeTask/:id', isNotSpectator, async (req, res) => {
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

    LogModel.generate(
        req.session?.mongoId,
        `removed "${t.name}" from "${updatedBeatmap.song.artist} - ${updatedBeatmap.song.title}"`,
        LogCategory.Beatmap
    );

    if (updatedBeatmap.host.id != req.session?.mongoId) {
        NotificationModel.generate(
            updatedBeatmap._id,
            `removed task "${t.name}" from your mapset`,
            updatedBeatmap.host.id,
            req.session?.mongoId,
            updatedBeatmap._id
        );
    }
});

/* POST invite collab user to task. */
tasksRouter.post('/task/:taskId/addCollab', isNotSpectator, isValidUser, async (req, res) => {
    const u = res.locals.user;

    const [t, b] = await Promise.all([
        TaskModel.findOne({
            _id: req.params.taskId,
            mappers: u._id,
        }),
        BeatmapModel
            .findOne({
                tasks: req.params.taskId,
                status: { $ne: BeatmapStatus.Ranked },
            })
            .defaultPopulate(),
    ]);

    if (t || !b) {
        return res.json({ error: inviteError + 'User is already a collaborator' });
    }

    if (!req.body.mode) {
        req.body.mode = b.mode;
    }

    const validity = await addTaskChecks(u.id, b, req.body.taskName, req.body.mode, b.host.id == req.session?.mongoId);

    if (validity.error) {
        return res.json(validity);
    }

    const updatedTask = await TaskModel.findById(req.params.taskId);

    if (!updatedTask) {
        return res.json({ error: inviteError + 'Task does not exist!' });
    }

    const newInvite = await InviteModel.generateMapInvite(
        u.id,
        req.session?.mongoId,
        req.params.taskId,
        `wants to collaborate with you on the "${updatedTask.name}" difficulty of`,
        ActionType.Collab,
        b._id,
        req.body.taskName,
        req.body.mode
    );

    if (!newInvite) {
        return res.json({ error: inviteError + 'Invite generation failed!' });
    }

    res.json(b);
});

/* POST remove collab user from task. */
tasksRouter.post('/task/:taskId/removeCollab', isNotSpectator, async (req, res) => {
    const [u, b, t] = await Promise.all([
        UserModel
            .findById(req.body.user)
            .orFail(),

        BeatmapModel
            .findOne({
                tasks: req.params.taskId,
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

    LogModel.generate(
        req.session?.mongoId,
        `removed "${u.username}" from collab mapper of "${updatedTask.name}" on "${updatedB.song.artist} - ${
            updatedB.song.title
        }"`,
        LogCategory.Beatmap
    );
});

/* POST set status of the task selected from extended view. */
tasksRouter.post('/setTaskStatus/:taskId', isNotSpectator, async (req, res) => {
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

    LogModel.generate(
        req.session?.mongoId,
        `changed status of "${t.name}" on "${b.song.artist} - ${b.song.title}"`,
        LogCategory.Beatmap
    );

    if (b.host.id != req.session?.mongoId) {
        NotificationModel.generate(
            b._id,
            `changed status of "${t.name}" on your mapset`,
            b.host.id,
            req.session?.mongoId,
            b._id
        );
    }
});

/* POST request added task*/
tasksRouter.post('/requestTask/:mapId', isNotSpectator, isValidUser, isValidBeatmap, isBeatmapHost, async (req, res) => {
    const u: User = res.locals.user;
    const b: Beatmap = res.locals.beatmap;

    const valid = await addTaskChecks(u.id, b, req.body.taskName, req.body.mode, true);

    if (valid.error) {
        return res.json(valid);
    }

    res.json(b);

    InviteModel.generateMapInvite(
        u._id,
        req.session?.mongoId,
        b._id,
        `wants you to create the ${req.body.taskName != TaskName.Storyboard ? req.body.mode + ' difficulty' : 'task'} ${req.body.taskName} for their mapset of`,
        ActionType.Create,
        b._id,
        req.body.taskName,
        req.body.mode
    );
});

export default tasksRouter;
