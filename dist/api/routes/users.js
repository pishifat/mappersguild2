"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../models/user");
const beatmap_1 = require("../models/beatmap/beatmap");
const quest_1 = require("../models/quest");
const spentPoints_1 = require("../models/spentPoints");
const task_1 = require("../models/beatmap/task");
const quest_2 = require("../../interfaces/quest");
const mission_1 = require("../../interfaces/mission");
const party_1 = require("../models/party");
const usersRouter = express_1.default.Router();
const questPopulate = { path: 'parties', populate: { path: 'members pendingMembers leader' } };
const userPopulate = [
    { path: 'completedQuests', select: 'name completed' },
    { path: 'completedMissions', select: 'name deadline' },
];
/* GET users (with rank) */
usersRouter.get('/queryRanked', async (req, res) => {
    const users = await user_1.UserModel
        .find({
        $or: [
            { _id: req.session.mongoId },
            { rank: { $gte: 1 } },
        ],
    })
        .populate(userPopulate);
    res.json({
        users,
    });
});
/* GET all users (with points) */
usersRouter.get('/queryAll', async (req, res) => {
    const users = await user_1.UserModel
        .find({
        $or: [
            { _id: req.session.mongoId },
            { $or: [
                    { osuPoints: { $gt: 0 } },
                    { taikoPoints: { $gt: 0 } },
                    { catchPoints: { $gt: 0 } },
                    { maniaPoints: { $gt: 0 } },
                    { storyboardPoints: { $gt: 0 } },
                    { hitsoundPoints: { $gt: 0 } },
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
/* GET specific user */
usersRouter.get('/queryUser/:id', async (req, res) => {
    const user = await user_1.UserModel
        .findById(req.params.id)
        .populate(userPopulate);
    res.json(user);
});
/* GET user's current quests */
usersRouter.get('/:id/quests', async (req, res) => {
    const parties = await party_1.PartyModel
        .find()
        .where('members', req.params.id)
        .populate({
        path: 'quest',
        match: { status: quest_2.QuestStatus.WIP },
    })
        .sort({ accepted: -1 });
    const quests = parties.filter(p => p.quest).map(p => p.quest);
    res.json(quests);
});
/* GET user's current missions */
usersRouter.get('/:id/missions', async (req, res) => {
    const missionBeatmaps = await beatmap_1.BeatmapModel
        .find({
        host: req.params.id,
        mission: { $exists: true },
    })
        .defaultPopulate();
    const missionIds = [];
    const missions = [];
    for (const beatmap of missionBeatmaps) {
        if (beatmap.mission && !missionIds.includes(beatmap.mission.id) && beatmap.mission.status == mission_1.MissionStatus.Open) {
            missionIds.push(beatmap.mission.id);
            missions.push(beatmap.mission);
        }
    }
    res.json(missions);
});
/* GET user's created quests */
usersRouter.get('/findCreatedQuests/:id', async (req, res) => {
    const createdQuests = await quest_1.QuestModel
        .find({
        $or: [
            { status: { $ne: quest_2.QuestStatus.Hidden } },
            { status: { $ne: quest_2.QuestStatus.Rejected } },
        ],
        creator: req.params.id,
    })
        .distinct('name')
        .populate(questPopulate);
    res.json(createdQuests);
});
/* GET user's spent points */
usersRouter.get('/findSpentPoints/:id', async (req, res) => {
    const spentPoints = await spentPoints_1.SpentPointsModel
        .find({ user: req.params.id })
        .populate({ path: 'quest mission', select: 'price art requiredMapsets name' })
        .sort({ createdAt: -1 });
    res.json(spentPoints);
});
/* GET user's beatmaps */
usersRouter.get('/findUserBeatmaps/:id', async (req, res) => {
    const userId = req.params.id;
    const ownTasks = await task_1.TaskModel
        .find({ mappers: userId })
        .select('_id');
    const userBeatmaps = await beatmap_1.BeatmapModel
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
exports.default = usersRouter;
