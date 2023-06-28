"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../helpers/middlewares");
const mission_1 = require("../models/mission");
const log_1 = require("../models/log");
const beatmap_1 = require("../models/beatmap/beatmap");
const user_1 = require("../models/user");
const mission_2 = require("../../interfaces/mission");
const log_2 = require("../../interfaces/log");
const beatmap_2 = require("../../interfaces/beatmap/beatmap");
const middlewares_2 = require("./beatmaps/middlewares");
const missionsRouter = express_1.default.Router();
missionsRouter.use(middlewares_1.isLoggedIn);
async function isEditable(req, res, next) {
    const id = req.params.id || req.params.missionId;
    if (!id)
        return res.json({ error: 'Invalid' });
    const mission = await mission_1.MissionModel.defaultFindByIdOrFail(id);
    if (mission.status !== mission_2.MissionStatus.Open && res.locals.userRequest.osuId !== 3178418) {
        return res.json({ error: 'Unauthorized' });
    }
    res.locals.mission = mission;
    next();
}
/* GET missions */
missionsRouter.get('/relevantInfo', async (req, res) => {
    const [missions, beatmaps] = await Promise.all([
        mission_1.MissionModel
            .find({
            $or: [
                { status: mission_2.MissionStatus.Open },
                { status: mission_2.MissionStatus.Closed },
            ],
            openingAnnounced: true,
        })
            .defaultPopulate()
            .sortByLatest(),
        beatmap_1.BeatmapModel
            .find({
            host: req.session.mongoId,
            status: { $ne: beatmap_2.BeatmapStatus.Ranked },
            quest: { $exists: false },
            mission: { $exists: false },
        })
            .defaultPopulate(),
    ]);
    res.json({
        missions,
        beatmaps,
    });
});
function meetsRequirements(mission, user) {
    if (mission.userMaximumRankedBeatmapsCount && user.rankedBeatmapsCount > mission.userMaximumRankedBeatmapsCount) {
        return false;
    }
    if (mission.userMaximumGlobalRank && user.globalRank < mission.userMaximumGlobalRank) {
        return false;
    }
    return true;
}
/* GET open missions */
missionsRouter.get('/open/:mode', async (req, res) => {
    const user = await user_1.UserModel.findById(req.session.mongoId).orFail();
    const query = {
        status: mission_2.MissionStatus.Open,
        openingAnnounced: true,
    };
    if (req.params.mode !== beatmap_2.BeatmapMode.Hybrid) {
        query.modes = req.params.mode;
    }
    const missions = await mission_1.MissionModel
        .find(query)
        .defaultPopulate()
        .sortByLatest();
    const filteredMissions = missions.filter(m => meetsRequirements(m, user));
    res.json(filteredMissions);
});
/* POST add beatmap to mission */
missionsRouter.post('/:missionId/:mapId/addBeatmapToMission', isEditable, middlewares_2.isValidBeatmap, middlewares_2.isBeatmapHost, async (req, res) => {
    const mission = res.locals.mission;
    const beatmap = res.locals.beatmap;
    if (beatmap.quest || beatmap.mission) {
        return res.json({ error: 'Beatmap assigned to a quest/mission already!' });
    }
    if (!mission.modes.includes(beatmap.mode) && beatmap.mode !== beatmap_2.BeatmapMode.Hybrid) {
        return res.json({ error: 'Mode not allowed for this quest' });
    }
    await beatmap_1.BeatmapModel
        .findByIdAndUpdate(req.params.mapId, { mission: mission._id, quest: undefined })
        .defaultPopulate()
        .orFail();
    const updatedMission = await mission_1.MissionModel.findById(req.params.missionId).defaultPopulate().orFail();
    res.json(updatedMission);
    log_1.LogModel.generate(req.session?.mongoId, `added "${beatmap.song.artist} - ${beatmap.song.title}" to mission "${mission.name}"`, log_2.LogCategory.Mission);
});
/* POST add beatmap to mission */
missionsRouter.post('/:missionId/:mapId/removeBeatmapFromMission', isEditable, middlewares_2.isValidBeatmap, middlewares_2.isBeatmapHost, async (req, res) => {
    const mission = res.locals.mission;
    const beatmap = res.locals.beatmap;
    res.locals.beatmap.mission = undefined;
    res.locals.beatmap.quest = undefined;
    await res.locals.beatmap.save();
    const updatedMission = await mission_1.MissionModel.findById(req.params.missionId).defaultPopulate().orFail();
    res.json(updatedMission);
    log_1.LogModel.generate(req.session?.mongoId, `removed "${beatmap.song.artist} - ${beatmap.song.title}" from mission "${mission.name}"`, log_2.LogCategory.Mission);
});
exports.default = missionsRouter;
