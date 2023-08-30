import express from 'express';
import { isLoggedIn } from '../helpers/middlewares';
import { MissionModel } from '../models/mission';
import { LogModel } from '../models/log';
import { BeatmapModel } from '../models/beatmap/beatmap';
import { UserModel } from '../models/user';
import { Mission, MissionStatus, MissionMode } from '../../interfaces/mission';
import { LogCategory } from '../../interfaces/log';
import { Beatmap, BeatmapStatus, BeatmapMode } from '../../interfaces/beatmap/beatmap';
import { isBeatmapHost, isValidBeatmap } from './beatmaps/middlewares';

const missionsRouter = express.Router();

missionsRouter.use(isLoggedIn);

async function isEditable (req, res, next): Promise<void> {
    const id = req.params.id || req.params.missionId;
    if (!id) return res.json({ error: 'Invalid' });

    const mission = await MissionModel.defaultFindByIdOrFail(id);

    if (mission.status !== MissionStatus.Open && res.locals.userRequest.osuId !== 3178418) {
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
            .sort({ tier: 1 }),
        BeatmapModel
            .find({
                host: req.session.mongoId,
                status: { $ne: BeatmapStatus.Ranked },
                $or: [
                    { quest: { $exists: false } },
                    { quest: undefined },
                ],
                mission: { $exists: false },
            })
            .defaultPopulate(),
    ]);

    res.json({
        missions,
        beatmaps,
    });
});

function meetsRequirements(mission, user, mode, submissionDate) {
    if (submissionDate && mission.beatmapEarliestSubmissionDate && (new Date(submissionDate) < new Date(mission.beatmapEarliestSubmissionDate))) {
        return false;
    }

    if (submissionDate && mission.beatmapLatestSubmissionDate && (new Date(submissionDate) > new Date(mission.beatmapLatestSubmissionDate))) {
        return false;
    }

    if ((mission.userMaximumRankedBeatmapsCount || mission.userMaximumRankedBeatmapsCount == 0) && (user.rankedBeatmapsCount > mission.userMaximumRankedBeatmapsCount)) {
        return false;
    }

    if (mission.userMaximumGlobalRank && (user.globalRank < mission.userMaximumGlobalRank)) {
        return false;
    }

    let modePp = 0;

    switch (mode) {
        case 'osu':
            modePp = user.ppOsu;
            break;
        case 'taiko':
            modePp = user.ppTaiko;
            break;
        case 'catch':
            modePp = user.ppCatch;
            break;
        case 'mania':
            modePp = user.ppMania;
            break;
    }

    if (mission.userMaximumPp && (modePp > mission.userMaximumPp)) {
        return false;
    }

    return true;
}

/* GET open missions */
missionsRouter.get('/open/:mode/:id', async (req, res) => {
    const user = await UserModel.findById(req.session.mongoId).orFail();

    const query: any = {
        status: MissionStatus.Open,
        openingAnnounced: true,
    };

    if (req.params.mode !== BeatmapMode.Hybrid) {
        query.modes = req.params.mode;
    }

    const [missions, beatmap] = await Promise.all([
        MissionModel
            .find(query)
            .defaultPopulate()
            .sortByLatest(),
        BeatmapModel
            .findById(req.params.id)
            .orFail(),
    ]);

    const filteredMissions = missions.filter(m => meetsRequirements(m, user, req.params.mode, beatmap.submissionDate));

    res.json(filteredMissions);
});

/* POST add beatmap to mission */
missionsRouter.post('/:missionId/:mapId/addBeatmapToMission', isEditable, isValidBeatmap, isBeatmapHost, async (req, res) => {
    const mission: Mission = res.locals.mission;
    const beatmap: Beatmap = res.locals.beatmap;

    if (beatmap.quest || beatmap.mission) {
        return res.json({ error: 'Beatmap assigned to a quest/mission already!' });
    }

    if (!mission.modes.includes(beatmap.mode as unknown as MissionMode) && beatmap.mode !== BeatmapMode.Hybrid) {
        return res.json({ error: 'Mode not allowed for this quest' });
    }

    await BeatmapModel
        .findByIdAndUpdate(req.params.mapId, { mission: mission._id, quest: undefined })
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

    const invalidBeatmapIds = mission.invalidBeatmaps.map(b => b.id);
    const alreadyInvalid = invalidBeatmapIds.includes(req.params.mapId);

    if (alreadyInvalid) {
        await MissionModel.findByIdAndUpdate(req.params.missionId, { $pull: { invalidBeatmaps: req.params.mapId } });
    }

    res.locals.beatmap.mission = undefined;
    res.locals.beatmap.quest = undefined;
    await res.locals.beatmap.save();

    const updatedMission = await MissionModel.findById(req.params.missionId).defaultPopulate().orFail();

    res.json(updatedMission);

    LogModel.generate(req.session?.mongoId, `removed "${beatmap.song.artist} - ${beatmap.song.title}" from mission "${mission.name}"`, LogCategory.Mission );
});

export default missionsRouter;
