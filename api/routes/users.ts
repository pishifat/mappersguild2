import express from 'express';
import { isLoggedIn } from '../helpers/middlewares';
import { UserModel } from '../models/user';
import { BeatmapModel } from '../models/beatmap/beatmap';
import { QuestModel } from '../models/quest';
import { SpentPointsModel } from '../models/spentPoints';
import { TaskModel } from '../models/beatmap/task';
import { Quest, QuestStatus } from '../../interfaces/quest';
import { User } from '../../interfaces/user';
import { Mission, MissionStatus } from '../../interfaces/mission';
import { PartyModel } from '../models/party';

const usersRouter = express.Router();

usersRouter.use(isLoggedIn);

const questPopulate = { path: 'parties', populate: { path: 'members pendingMembers leader' } };
const userPopulate = [
    { path: 'completedQuests', select: 'name completed' },
    { path: 'completedMissions', select: 'name deadline' },
];

/* GET users listing. */
usersRouter.get('/query', async (req, res) => {
    const users = await UserModel
        .find({
            $or: [
                { _id: req.session.mongoId },
                { $or: [
                    { osuPoints: { $gt: 0 } },
                    { taikoPoints: { $gt: 0 } },
                    { catchPoints: { $gt: 0 } },
                    { maniaPoints: { $gt: 0 } },
                    { storyboardPoints: { $gt: 0 } },
                    { modPoints: { $gt: 0 } },
                    { contestParticipantPoints: { $gt: 0 } },
                    { contestJudgePoints: { $gt: 0 } },
                    { contestScreenerPoints: { $gt: 0 } },
                ] },
            ],
        })
        .populate(userPopulate);

    res.json({
        users,
    });
});

/* GET users with sorting. */
usersRouter.get('/:sort', async (req, res) => {
    res.json(
        await UserModel
            .find({
                $or: [
                    { _id: req.session.mongoId },
                    { $or: [
                        { osuPoints: { $gt: 0 } },
                        { taikoPoints: { $gt: 0 } },
                        { catchPoints: { $gt: 0 } },
                        { maniaPoints: { $gt: 0 } },
                        { storyboardPoints: { $gt: 0 } },
                        { modPoints: { $gt: 0 } },
                        { contestParticipantPoints: { $gt: 0 } },
                        { contestJudgePoints: { $gt: 0 } },
                        { contestScreenerPoints: { $gt: 0 } },
                    ] },
                ],
            })
            .populate(userPopulate)
            .sort(req.params.sort)
    );
});

/* GET user's current quests */
usersRouter.get('/:id/quests', async (req, res) => {
    const parties = await PartyModel
        .find()
        .where('members', req.params.id)
        .populate({
            path: 'quest',
            match: { status: QuestStatus.WIP },
        })
        .sort({ accepted: -1 });

    const quests = parties.filter(p => p.quest).map(p => p.quest);

    res.json(quests);
});

/* GET user's current missions */
usersRouter.get('/:id/missions', async (req, res) => {
    const missionBeatmaps = await BeatmapModel
        .find({
            host: req.params.id as User['_id'],
            mission: { $exists: true },
        })
        .defaultPopulate();

    const missionIds: string[] = [];
    const missions: Mission[] = [];

    for (const beatmap of missionBeatmaps) {
        if (beatmap.mission && !missionIds.includes(beatmap.mission.id) && beatmap.mission.status == MissionStatus.Open) {
            missionIds.push(beatmap.mission.id);
            missions.push(beatmap.mission);
        }
    }

    res.json(missions);
});

/* GET user's created quests */
usersRouter.get('/findCreatedQuests/:id', async (req, res) => {
    const createdQuests: Quest['name'][] = await QuestModel
        .find({
            $or: [
                { status: { $ne: QuestStatus.Hidden } },
                { status: { $ne: QuestStatus.Rejected } },
            ],
            creator: req.params.id as User['_id'],
        })
        .distinct('name')
        .populate(questPopulate);

    res.json(createdQuests);
});

/* GET user's spent points */
usersRouter.get('/findSpentPoints/:id', async (req, res) => {
    const spentPoints = await SpentPointsModel
        .find({ user: req.params.id })
        .populate({ path: 'quest', select: 'price art requiredMapsets name' })
        .sort({ createdAt: -1 });

    res.json(spentPoints);
});

/* GET user's beatmaps */
usersRouter.get('/findUserBeatmaps/:id', async (req, res) => {
    const userId = req.params.id as User['_id'];
    const ownTasks = await TaskModel
        .find({ mappers: userId })
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
                    host: userId,
                },
            ],
        })
        .defaultPopulate()
        .sortByLatest();

    res.json(userBeatmaps);
});

export default usersRouter;
