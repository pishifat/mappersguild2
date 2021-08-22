"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../helpers/middlewares");
const user_1 = require("../models/user");
const beatmap_1 = require("../models/beatmap/beatmap");
const quest_1 = require("../models/quest");
const spentPoints_1 = require("../models/spentPoints");
const task_1 = require("../models/beatmap/task");
const quest_2 = require("../../interfaces/quest");
const user_2 = require("../../interfaces/user");
const beatmap_2 = require("../../interfaces/beatmap/beatmap");
const party_1 = require("../models/party");
const usersRouter = express_1.default.Router();
usersRouter.use(middlewares_1.isLoggedIn);
const questPopulate = { path: 'parties', populate: { path: 'members leader' } };
const userPopulate = { path: 'completedQuests', select: 'name completed' };
/* GET users listing. */
usersRouter.get('/query', async (req, res) => {
    const users = await user_1.UserModel
        .find({
        group: { $ne: user_2.UserGroup.Spectator },
    })
        .populate(userPopulate);
    res.json({
        users,
    });
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
        .populate({ path: 'quest', select: 'price art requiredMapsets name' })
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
        status: { $ne: beatmap_2.BeatmapStatus.Secret },
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
        .sortByLastest();
    res.json(userBeatmaps);
});
/* GET users with sorting. */
usersRouter.get('/:sort', async (req, res) => {
    res.json(await user_1.UserModel
        .find({ group: { $ne: user_2.UserGroup.Spectator } })
        .populate(userPopulate)
        .sort(req.params.sort));
});
exports.default = usersRouter;
