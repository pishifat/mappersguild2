import express from 'express';
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

const questPopulate = { path: 'parties', populate: { path: 'members pendingMembers leader' } };
const userPopulate = [
    { path: 'completedQuests', select: 'name completed' },
    { path: 'completedMissions', select: 'name deadline' },
    { path: 'completedMissionsAsGuest', select: 'name deadline' },
];

/* GET rank 3+ users */
usersRouter.get('/queryRanked', async (req, res) => {
    const defaultMinRank = 3;

    const users = await UserModel
        .find({
            $or: [
                { _id: req.session.mongoId },
                { rank: { $gte: defaultMinRank } },
            ],
        })
        .populate(userPopulate);

    res.json({
        users,
    });
});

/* GET users with a specific rank */
usersRouter.get('/queryByRank/:rank', async (req, res) => {
    const rank = parseInt(req.params.rank, 10);
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

    // if this changes in the user model, it needs to change here too
    const totalPointsFields = [
        '$easyPoints', '$normalPoints', '$hardPoints', '$insanePoints', '$expertPoints',
        '$storyboardPoints', '$hitsoundPoints', '$skinPoints', '$questPoints', '$modPoints', '$hostPoints',
        '$contestCreatorPoints', '$contestParticipantPoints', '$contestScreenerPoints', '$contestJudgePoints',
        '$missionPoints', '$legacyPoints',
    ];

    if (limit) {
        const [topUsers, total] = await Promise.all([
            UserModel.aggregate([
                { $match: { rank } },
                { $addFields: { totalPoints: { $add: totalPointsFields } } }, // temporarily add to users so it can be sorted
                { $sort: { totalPoints: -1 } },
                { $limit: limit },
                { $project: { _id: 1 } },
            ]),
            UserModel.countDocuments({ rank }),
        ]);

        const ids: any[] = topUsers.map(u => u._id);

        if (req.session.mongoId && !ids.some(id => id.toString() === req.session.mongoId.toString())) {
            ids.push(req.session.mongoId);
        }

        const users = await UserModel
            .find({ _id: { $in: ids } })
            .populate(userPopulate);

        users.sort((a, b) => b.totalPoints - a.totalPoints);

        res.json({
            users,
            total,
        });

        return;
    }

    const users = await UserModel
        .find({
            $or: [
                { _id: req.session.mongoId },
                { rank },
            ],
        })
        .populate(userPopulate);

    res.json({
        users,
    });
});

/* GET users with more than 100 points in a specific mode */
usersRouter.get('/queryByMode/:mode', async (req, res) => {
    const mode = req.params.mode;
    const pointsField = `${mode}Points`;

    const users = await UserModel
        .find({
            $or: [
                { _id: req.session.mongoId },
                { [pointsField]: { $gt: 100 } },
            ],
        })
        .populate(userPopulate);

    res.json({
        users,
    });
});

/* GET single user by username or osu id */
usersRouter.get('/searchUser/:userInput', async (req, res) => {
    const user = await UserModel
        .findOne()
        .byUsernameOrOsuId(req.params.userInput)
        .populate(userPopulate);

    res.json({
        user,
    });
});

/* GET specific user */
usersRouter.get('/queryUser/:id', async (req, res) => {
    const user = await UserModel
        .findById(req.params.id)
        .populate(userPopulate);

    res.json(user);
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
        .populate({ path: 'quest mission', select: 'price art requiredMapsets name' })
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
