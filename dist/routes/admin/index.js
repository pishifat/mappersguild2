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
const osuApi_1 = require("../../helpers/osuApi");
const helpers_1 = require("../../helpers/helpers");
const spentPoints_1 = require("../../interfaces/spentPoints");
const spentPoints_2 = require("../../models/spentPoints");
const adminRouter = express_1.default.Router();
adminRouter.use(middlewares_1.isLoggedIn);
adminRouter.use(middlewares_1.isAdmin);
adminRouter.get('/loadActionBeatmaps/:queryWip', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const queryWip = req.params.queryWip == 'true';
    const statusQuery = [
        { status: { $ne: beatmap_2.BeatmapStatus.Ranked } },
        { status: { $ne: beatmap_2.BeatmapStatus.Secret } },
    ];
    if (!queryWip) {
        statusQuery.push({ status: { $ne: beatmap_2.BeatmapStatus.WIP } });
    }
    const allBeatmaps = yield beatmap_1.BeatmapModel
        .find({
        url: { $exists: true },
        $and: statusQuery,
    })
        .defaultPopulate()
        .sort({ status: 1, mode: 1 });
    const actionBeatmaps = [];
    for (const bm of allBeatmaps) {
        if (bm.url.indexOf('osu.ppy.sh/beatmapsets/') == -1) {
            bm.status = `${bm.status} (invalid link)`;
            actionBeatmaps.push(bm);
        }
        else {
            const osuId = helpers_1.findBeatmapsetId(bm.url);
            const bmInfo = yield osuApi_1.beatmapsetInfo(osuId);
            let status = '';
            if (!osuApi_1.isOsuResponseError(bmInfo)) {
                switch (bmInfo.approved) {
                    case 4:
                        status = 'Loved';
                        break;
                    case 3:
                        status = beatmap_2.BeatmapStatus.Qualified;
                        break;
                    case 2:
                        status = 'Approved';
                        break;
                    case 1:
                        status = beatmap_2.BeatmapStatus.Ranked;
                        break;
                    default:
                        status = beatmap_2.BeatmapStatus.Done;
                        break;
                }
            }
            if (queryWip) {
                if (bm.status == beatmap_2.BeatmapStatus.WIP && status == beatmap_2.BeatmapStatus.Ranked) {
                    bm.status = `${bm.status} (osu: ${status})`;
                    actionBeatmaps.push(bm);
                }
            }
            else if (bm.status != status) {
                if (status == beatmap_2.BeatmapStatus.Qualified && bm.status == beatmap_2.BeatmapStatus.Done) {
                    bm.status = beatmap_2.BeatmapStatus.Qualified;
                    yield bm.save();
                }
                else if (status == beatmap_2.BeatmapStatus.Done && bm.status == beatmap_2.BeatmapStatus.Qualified) {
                    bm.status = beatmap_2.BeatmapStatus.Done;
                    yield bm.save();
                }
                else {
                    bm.status = `${bm.status} (osu: ${status})`;
                    actionBeatmaps.push(bm);
                }
            }
        }
    }
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
adminRouter.post('/saveSpentPointsEvent', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let category;
    if (req.body.category == 'acceptQuest')
        category = spentPoints_1.SpentPointsCategory.AcceptQuest;
    else if (req.body.category == 'reopenQuest')
        category = spentPoints_1.SpentPointsCategory.ReopenQuest;
    else if (req.body.category == 'createQuest')
        category = spentPoints_1.SpentPointsCategory.CreateQuest;
    else if (req.body.category == 'extendDeadline')
        category = spentPoints_1.SpentPointsCategory.ExtendDeadline;
    else
        return res.json(helpers_1.defaultErrorMessage);
    const user = yield user_1.UserModel
        .findOne()
        .byUsernameOrOsuId(req.body.username)
        .orFail(new Error('user changed name probably'));
    const quest = yield quest_1.QuestModel.findById(req.body.questId).orFail();
    spentPoints_2.SpentPointsModel.generate(category, user._id, quest._id);
    res.json('user points updated');
}));
exports.default = adminRouter;
