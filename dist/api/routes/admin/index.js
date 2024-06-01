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
const contest_1 = require("../../models/contest/contest");
const contest_2 = require("../../../interfaces/contest/contest");
const osuApi_1 = require("../../helpers/osuApi");
const featuredArtist_1 = require("../../models/featuredArtist");
const adminRouter = express_1.default.Router();
adminRouter.use(middlewares_1.isLoggedIn);
adminRouter.use(middlewares_1.isAdmin);
adminRouter.use(middlewares_1.isSuperAdmin);
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
        .find({ status: quest_2.QuestStatus.WIP, queuedForCompletion: { $ne: true } })
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
    const actionUsers = allUsers.filter(u => u.badge < u.rank);
    res.json(actionUsers);
});
/* GET contests in need of action */
adminRouter.get('/loadActionContests/', async (req, res) => {
    const actionContests = await contest_1.ContestModel
        .find({
        isApproved: { $ne: true },
        status: { $ne: contest_2.ContestStatus.Hidden },
    })
        .populate({ path: 'creators' });
    res.json(actionContests);
});
/* GET artists in need of action */
adminRouter.get('/loadActionArtists/', async (req, res) => {
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);
    const actionArtists = await featuredArtist_1.FeaturedArtistModel
        .find({
        $or: [
            { lastReviewed: { $lt: oneYearAgo } },
            { lastReviewed: { $exists: false } },
        ],
        permanentlyDismiss: { $ne: true },
        osuId: { $exists: false },
        artistSigned: { $ne: true },
    })
        .defaultPopulateWithSongs()
        .sort({ createdAt: -1 })
        .limit(50);
    res.json(actionArtists);
});
/* POST update lastChecked */
adminRouter.get('/artistSearch/:input', async (req, res) => {
    const response = await osuApi_1.getClientCredentialsGrant();
    if (osuApi_1.isOsuResponseError(response)) {
        return res.json({ error: `Couldn't get client credentials.` });
    }
    const token = response.access_token;
    const searchResults = await osuApi_1.getBeatmapsSearch(token, `?q=artist%3D"${req.params.input}"&s=any&sort=plays_desc`);
    res.json(searchResults);
});
exports.default = adminRouter;
