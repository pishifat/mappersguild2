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
const adminRouter = express_1.default.Router();
adminRouter.use(middlewares_1.isLoggedIn);
adminRouter.use(middlewares_1.isAdmin);
adminRouter.get('/', (req, res) => {
    var _a;
    res.render('admin', {
        title: 'Admin',
        script: 'admin.js',
        loggedInAs: (_a = req.session) === null || _a === void 0 ? void 0 : _a.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});
adminRouter.get('/relevantInfo/', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allBeatmaps = yield beatmap_1.BeatmapService.queryAll({
        defaultPopulate: true,
        sort: { status: 1, mode: 1 },
    });
    const actionBeatmaps = [];
    if (!beatmap_1.BeatmapService.isError(allBeatmaps)) {
        for (let i = 0; i < allBeatmaps.length; i++) {
            const bm = allBeatmaps[i];
            if ((bm.status == beatmap_2.BeatmapStatus.Done || bm.status == beatmap_2.BeatmapStatus.Qualified) && bm.url) {
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
                    if (bm.status != status) {
                        if (status == 'Qualified' && bm.status == 'Done') {
                            bm.status = beatmap_2.BeatmapStatus.Qualified;
                            yield beatmap_1.BeatmapService.saveOrFail(bm);
                        }
                        else if (status == 'Done' && bm.status == 'Qualified') {
                            bm.status = beatmap_2.BeatmapStatus.Done;
                            yield beatmap_1.BeatmapService.saveOrFail(bm);
                        }
                        else {
                            bm.status = `${bm.status} (osu: ${status})`;
                            actionBeatmaps.push(bm);
                        }
                    }
                }
            }
        }
    }
    const allQuests = yield quest_1.QuestService.queryAll({
        query: { status: quest_2.QuestStatus.WIP },
        defaultPopulate: true,
    });
    const actionQuests = [];
    if (!quest_1.QuestService.isError(allQuests)) {
        for (let i = 0; i < allQuests.length; i++) {
            const q = allQuests[i];
            let valid = true;
            if (!q.associatedMaps.length) {
                valid = false;
            }
            else {
                q.associatedMaps.forEach(b => {
                    if (b.status != beatmap_2.BeatmapStatus.Ranked) {
                        valid = false;
                    }
                });
            }
            if (valid) {
                actionQuests.push(q);
            }
        }
    }
    const allUsers = yield user_1.UserService.queryAll({});
    const actionUsers = [];
    if (!user_1.UserService.isError(allUsers)) {
        for (let i = 0; i < allUsers.length; i++) {
            const u = allUsers[i];
            if (u.badge != u.rank) {
                actionUsers.push(u);
            }
        }
    }
    res.json({ actionBeatmaps, actionQuests, actionUsers });
})));
exports.default = adminRouter;
