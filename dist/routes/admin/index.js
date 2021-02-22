"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../../helpers/middlewares");
const quest_1 = require("../../models/quest");
const quest_2 = require("../../interfaces/quest");
const user_1 = require("../../models/user");
const beatmap_1 = require("../../models/beatmap/beatmap");
const beatmap_2 = require("../../interfaces/beatmap/beatmap");
const adminRouter = express_1.default.Router();
adminRouter.use(middlewares_1.isLoggedIn);
adminRouter.use(middlewares_1.isAdmin);
adminRouter.get('/loadActionBeatmaps/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const actionBeatmaps = yield beatmap_1.BeatmapModel
        .find({
        status: beatmap_2.BeatmapStatus.Qualified,
        queuedForRank: { $ne: true },
    })
        .defaultPopulate()
        .sort({ updatedAt: 1 });
    res.json(actionBeatmaps);
}));
adminRouter.get('/loadActionQuests/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let quests = yield quest_1.QuestModel
        .find({ status: quest_2.QuestStatus.WIP })
        .defaultPopulate();
    quests = quests.filter(q => q.associatedMaps.length >= q.requiredMapsets &&
        q.associatedMaps.every(b => b.status === beatmap_2.BeatmapStatus.Ranked));
    const pendingQuests = yield quest_1.QuestModel
        .find({ status: quest_2.QuestStatus.Pending })
        .defaultPopulate();
    quests = quests.concat(pendingQuests);
    res.json(quests);
}));
adminRouter.get('/loadActionUsers/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allUsers = yield user_1.UserModel.find({});
    const actionUsers = allUsers.filter(u => u.badge !== u.rank);
    res.json(actionUsers);
}));
exports.default = adminRouter;
