import express from 'express';
import { isLoggedIn } from '../helpers/middlewares';
import { MissionModel } from '../models/mission';
import { LogModel } from '../models/log';
import { BeatmapModel } from '../models/beatmap/beatmap';
import { UserModel } from '../models/user';
import { Mission, MissionStatus } from '../../interfaces/mission';
import { LogCategory } from '../../interfaces/log';
import { Beatmap, BeatmapStatus } from '../../interfaces/beatmap/beatmap';
import { isBeatmapHost, isValidBeatmap } from './beatmaps/middlewares';

const missionsRouter = express.Router();

missionsRouter.use(isLoggedIn);

async function isEditable (req, res, next): Promise<void> {
    const id = req.params.id || req.params.missionId;
    if (!id) return res.json({ error: 'Invalid' });

    const mission = await MissionModel.defaultFindByIdOrFail(id);

    if (mission.status !== MissionStatus.Open) {
        return res.json({ error: 'Unauthorized' });
    }

    res.locals.mission = mission;
    next();
}

/* GET missions */
missionsRouter.get('/relevantInfo', async (req, res) => {
    const [missions, beatmaps] = await Promise.all([
        MissionModel
            .find({
                $or: [
                    { status: MissionStatus.Open },
                    { status: MissionStatus.Closed },
                ],
                openingAnnounced: true,
            })
            .defaultPopulate()
            .sortByLatest(),
        BeatmapModel
            .find({
                host: req.session.mongoId,
                status: { $ne: BeatmapStatus.Ranked },
                quest: { $exists: false },
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
missionsRouter.get('/open', async (req, res) => {
    const user = await UserModel.findById(req.session.mongoId).orFail();

    const missions = await MissionModel
        .find({
            status: MissionStatus.Open,
            openingAnnounced: true,
        })
        .defaultPopulate()
        .sortByLatest();

    const filteredMissions = missions.filter(m => meetsRequirements(m, user));

    res.json(filteredMissions);
});

/* POST add beatmap to mission */
missionsRouter.post('/:missionId/:mapId/addBeatmapToMission', isEditable, isValidBeatmap, isBeatmapHost, async (req, res) => {
    const mission: Mission = res.locals.mission;
    const beatmap: Beatmap = res.locals.beatmap;

    if (beatmap.quest) {
        return res.json({ error: 'Beatmap assigned to a quest/mission already!' });
    }

    await BeatmapModel
        .findByIdAndUpdate(req.params.mapId, { quest: mission._id })
        .defaultPopulate()
        .orFail();

    const updatedMission = await MissionModel.findById(req.params.missionId).defaultPopulate().orFail();

    res.json(updatedMission);

    LogModel.generate(req.session?.mongoId, `added "${beatmap.song.artist} - ${beatmap.song.title}" to mission "${mission.name}"`, LogCategory.Mission );
});

/* POST add beatmap to mission */
missionsRouter.post('/:missionId/:mapId/removeBeatmapFromMission', isEditable, isValidBeatmap, isBeatmapHost, async (req, res) => {
    const mission: Mission = res.locals.mission;
    const beatmap: Beatmap = res.locals.beatmap;

    res.locals.beatmap.quest = undefined;
    await res.locals.beatmap.save();

    const updatedMission = await MissionModel.findById(req.params.missionId).defaultPopulate().orFail();

    res.json(updatedMission);

    LogModel.generate(req.session?.mongoId, `removed "${beatmap.song.artist} - ${beatmap.song.title}" from mission "${mission.name}"`, LogCategory.Mission );
});

export default missionsRouter;
