import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';
import { MissionModel } from '../../models/mission';
import { MissionMode, MissionStatus } from '../../../interfaces/mission';
import { FeaturedArtistModel } from '../../models/featuredArtist';

const adminMissionsRouter = express.Router();

adminMissionsRouter.use(isLoggedIn);
adminMissionsRouter.use(isAdmin);
adminMissionsRouter.use(isSuperAdmin);

/* GET quests */
adminMissionsRouter.get('/load', async (req, res) => {
    const m = await MissionModel
        .find({})
        .defaultPopulate()
        .sort({ status: -1, name: 1 });

    res.json(m);
});

/* POST add quest */
adminMissionsRouter.post('/create', async (req, res) => {
    const { deadline, name, tier, artists, objective, winCondition, userMaximumRankedBeatmapsCount, userMaximumGlobalRank, userMaximumPp, beatmapEarliestSubmissionDate, beatmapLatestSubmissionDate, modes } = req.body;

    const validModes: MissionMode[] = [];

    for (const mode of modes) {
        switch (mode) {
            case 'osu':
                validModes.push(MissionMode.Osu);
                break;
            case 'taiko':
                validModes.push(MissionMode.Taiko);
                break;
            case 'catch':
                validModes.push(MissionMode.Catch);
                break;
            case 'mania':
                validModes.push(MissionMode.Mania);
                break;
            default:
                break;
        }
    }

    if (!validModes.length) {
        validModes.push(MissionMode.Osu, MissionMode.Taiko, MissionMode.Catch, MissionMode.Mania);
    }

    const mission = new MissionModel;
    mission.deadline = deadline;
    mission.tier = tier;
    mission.name = name;
    mission.artists = artists.map(a => a._id);
    mission.objective = objective;
    mission.status = MissionStatus.Hidden;
    mission.winCondition = winCondition;
    mission.modes = validModes;
    mission.openingAnnounced = false;
    mission.closingAnnounced = false;
    mission.userMaximumRankedBeatmapsCount = userMaximumRankedBeatmapsCount;
    mission.userMaximumGlobalRank = userMaximumGlobalRank;
    mission.userMaximumPp = userMaximumPp;
    mission.beatmapEarliestSubmissionDate = new Date(beatmapEarliestSubmissionDate);
    mission.beatmapLatestSubmissionDate = new Date(beatmapLatestSubmissionDate);

    await mission.save();

    res.json(mission);
});

/* POST rename mission */
adminMissionsRouter.post('/:id/rename', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { name: req.body.name }).orFail();

    res.json(req.body.name);
});

/* POST update mission tier */
adminMissionsRouter.post('/:id/updateTier', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { tier: req.body.tier }).orFail();

    res.json(req.body.tier);
});

/* POST update mission objective */
adminMissionsRouter.post('/:id/updateObjective', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { objective: req.body.objective }).orFail();

    res.json(req.body.objective);
});

/* POST update mission status */
adminMissionsRouter.post('/:id/updateStatus', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { status: req.body.status }).orFail();

    res.json(req.body.status);
});

/* POST update mission win condition */
adminMissionsRouter.post('/:id/updateWinCondition', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { winCondition: req.body.winCondition }).orFail();

    res.json(req.body.winCondition);
});

/* POST toggle openingAnnounced */
adminMissionsRouter.post('/:id/toggleOpeningAnnounced', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { openingAnnounced: req.body.openingAnnounced }).orFail();

    res.json(req.body.openingAnnounced);
});

/* POST toggle closingAnnounced */
adminMissionsRouter.post('/:id/toggleClosingAnnounced', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { closingAnnounced: req.body.closingAnnounced }).orFail();

    res.json(req.body.closingAnnounced);
});

/* POST toggle mode */
adminMissionsRouter.post('/:id/toggleMode', async (req, res) => {
    const mission = await MissionModel.findById(req.params.id).orFail();

    if (mission.modes && mission.modes.includes(req.body.mode)) {
        await MissionModel.findByIdAndUpdate(req.params.id, { $pull: { modes: req.body.mode } });
    } else {
        await MissionModel.findByIdAndUpdate(req.params.id, { $push: { modes: req.body.mode } });
    }

    const updatedMission = await MissionModel.findById(req.params.id).defaultPopulate().orFail();

    res.json(updatedMission.modes);
});

/* POST toggle artist */
adminMissionsRouter.post('/:id/toggleArtist', async (req, res) => {
    const mission = await MissionModel.findById(req.params.id).defaultPopulate().orFail();
    const artist = await FeaturedArtistModel.findOne({ label: req.body.artistLabel }).orFail();
    await MissionModel.findByIdAndUpdate(req.params.id, { $pull: { artists: null } });

    let artistIds = [] as string[];

    if (mission.artists && mission.artists.length) {
        artistIds = mission.artists.map(a => a.id);
    }

    if (artistIds.includes(artist.id)) {
        await MissionModel.findByIdAndUpdate(req.params.id, { $pull: { artists: artist.id } });
    } else {
        await MissionModel.findByIdAndUpdate(req.params.id, { $push: { artists: artist.id } });
    }

    const updatedMission = await MissionModel.findById(req.params.id).defaultPopulate().orFail();

    res.json(updatedMission.artists);
});

/* POST update mission maximum ranked maps count */
adminMissionsRouter.post('/:id/updateUserMaximumRankedBeatmapsCount', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { userMaximumRankedBeatmapsCount: req.body.userMaximumRankedBeatmapsCount }).orFail();

    res.json(req.body.userMaximumRankedBeatmapsCount);
});

/* POST update mission maximum global rank */
adminMissionsRouter.post('/:id/updateUserMaximumGlobalRank', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { userMaximumGlobalRank: req.body.userMaximumGlobalRank }).orFail();

    res.json(req.body.userMaximumGlobalRank);
});

/* POST update mission maximum pp */
adminMissionsRouter.post('/:id/updateUserMaximumPp', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { userMaximumPp: req.body.userMaximumPp }).orFail();

    res.json(req.body.userMaximumPp);
});

/* POST update mission earliest beatmap submission date */
adminMissionsRouter.post('/:id/updateBeatmapEarliestSubmissionDate', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { beatmapEarliestSubmissionDate: new Date(req.body.beatmapEarliestSubmissionDate) }).orFail();

    res.json(req.body.beatmapEarliestSubmissionDate);
});

/* POST update mission deadline */
adminMissionsRouter.post('/:id/updateDeadline', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { deadline: new Date(req.body.deadline) }).orFail();

    res.json(req.body.deadline);
});

/* POST update mission latest beatmap submission date */
adminMissionsRouter.post('/:id/updateBeatmapLatestSubmissionDate', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { beatmapLatestSubmissionDate: new Date(req.body.beatmapLatestSubmissionDate) }).orFail();

    res.json(req.body.beatmapLatestSubmissionDate);
});

/* POST toggle winning beatmap for mission */
adminMissionsRouter.post('/:missionId/:beatmapId/toggleWinningBeatmap', async (req, res) => {
    const mission = await MissionModel.findById(req.params.missionId).defaultPopulate().orFail();

    const winningBeatmapIds = mission.winningBeatmaps.map(b => b.id);
    const alreadyWinner = winningBeatmapIds.includes(req.params.beatmapId);

    if (alreadyWinner) {
        await MissionModel.findByIdAndUpdate(req.params.missionId, { $pull: { winningBeatmaps: req.params.beatmapId } });
    } else {
        await MissionModel.findByIdAndUpdate(req.params.missionId, { $push: { winningBeatmaps: req.params.beatmapId } });
    }

    const updatedMission = await MissionModel.findById(req.params.missionId).defaultPopulate().orFail();

    res.json(updatedMission.winningBeatmaps);
});

/* POST toggle invalid beatmap for mission */
adminMissionsRouter.post('/:missionId/:beatmapId/toggleInvalidBeatmap', async (req, res) => {
    const mission = await MissionModel.findById(req.params.missionId).defaultPopulate().orFail();

    const invalidBeatmapIds = mission.invalidBeatmaps.map(b => b.id);
    const alreadyInvalid = invalidBeatmapIds.includes(req.params.beatmapId);

    if (alreadyInvalid) {
        await MissionModel.findByIdAndUpdate(req.params.missionId, { $pull: { invalidBeatmaps: req.params.beatmapId } });
    } else {
        await MissionModel.findByIdAndUpdate(req.params.missionId, { $push: { invalidBeatmaps: req.params.beatmapId } });
    }

    const updatedMission = await MissionModel.findById(req.params.missionId).defaultPopulate().orFail();

    res.json(updatedMission.invalidBeatmaps);
});

export default adminMissionsRouter;
