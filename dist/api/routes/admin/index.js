"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../../helpers/middlewares");
const quest_1 = require("../../models/quest");
const quest_2 = require("../../../interfaces/quest");
const user_1 = require("../../models/user");
const beatmap_1 = require("../../models/beatmap/beatmap");
const beatmap_2 = require("../../../interfaces/beatmap/beatmap");
const adminRouter = express_1.default.Router();
adminRouter.use(middlewares_1.isLoggedIn);
adminRouter.use(middlewares_1.isAdmin);
/* GET beatmaps in need of action */
adminRouter.get('/loadActionBeatmaps/', async (req, res) => {
    const actionBeatmaps = await beatmap_1.BeatmapModel
        .find({
        status: beatmap_2.BeatmapStatus.Qualified,
        queuedForRank: { $ne: true },
    })
        .defaultPopulate()
        .sort({ updatedAt: 1 });
    res.json(actionBeatmaps);
});
/* GET quests in need of action */
adminRouter.get('/loadActionQuests/', async (req, res) => {
    let quests = await quest_1.QuestModel
        .find({ status: quest_2.QuestStatus.WIP })
        .defaultPopulate();
    quests = quests.filter(q => q.associatedMaps.length >= q.requiredMapsets &&
        q.associatedMaps.every(b => b.status === beatmap_2.BeatmapStatus.Ranked));
    const pendingQuests = await quest_1.QuestModel
        .find({ status: quest_2.QuestStatus.Pending })
        .defaultPopulate();
    quests = quests.concat(pendingQuests);
    res.json(quests);
});
/* GET users in need of action */
adminRouter.get('/loadActionUsers/', async (req, res) => {
    const invalids = [5226970, 7496029]; // user IDs for people who specifically asked not to earn badges
    const allUsers = await user_1.UserModel.find({
        osuId: { $nin: invalids },
    });
    const actionUsers = allUsers.filter(u => u.badge !== u.rank);
    res.json(actionUsers);
});
exports.default = adminRouter;
