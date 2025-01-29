import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';
import { MissionModel } from '../../models/mission';
import { UserModel } from '../../models/user';
import { MissionMode, MissionStatus } from '../../../interfaces/mission';
import { FeaturedArtistModel } from '../../models/featuredArtist';
import { FeaturedArtist } from '../../../interfaces/featuredArtist';

const adminMissionsRouter = express.Router();

adminMissionsRouter.use(isLoggedIn);
adminMissionsRouter.use(isAdmin);
adminMissionsRouter.use(isSuperAdmin);

/* GET quests */
adminMissionsRouter.get('/load', async (req, res) => {
    const m = await MissionModel
        .find({})
        .extendedDefaultPopulate()
        .sort({ createdAt: -1, status: -1, name: 1 });

    res.json(m);
});

/* GET quests */
adminMissionsRouter.get('/loadClassifiedArtists', async (req, res) => {
    const artists: FeaturedArtist[] = await FeaturedArtistModel
        .find({
            $or: [
                { osuId: 0 },
                { osuId: { $exists: false } },
            ],
            songsTimed: true,
            hasRankedMaps: { $ne: true },
            songs: { $exists: true, $ne: [] },
        })
        .collation({ locale: 'en' }) // ignores case sensitivity
        .sort({ label: 1 })
        .defaultPopulateWithSongs();

    res.json(artists);
});

/* POST add quest */
adminMissionsRouter.post('/create', async (req, res) => {
    const { deadline, name, tier, artists, objective, winCondition, isShowcaseMission, isArtistShowcase, userMaximumRankedBeatmapsCount, userMaximumGlobalRank, userMaximumPp, userMinimumPp, userMinimumRank, beatmapEarliestSubmissionDate, beatmapLatestSubmissionDate, beatmapMinimumFavorites, beatmapMinimumPlayCount, beatmapMinimumLength, isUniqueToRanked, modes } = req.body;

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
    mission.isShowcaseMission = isShowcaseMission;
    mission.isArtistShowcase = isArtistShowcase;
    mission.isSeparate = false;
    mission.openingAnnounced = false;
    mission.closingAnnounced = false;
    mission.userMaximumRankedBeatmapsCount = userMaximumRankedBeatmapsCount;
    mission.userMaximumGlobalRank = userMaximumGlobalRank;
    mission.userMaximumPp = userMaximumPp;
    mission.userMinimumPp = userMinimumPp;
    mission.userMinimumRank = userMinimumRank;
    mission.beatmapEarliestSubmissionDate = new Date(beatmapEarliestSubmissionDate);
    mission.beatmapLatestSubmissionDate = new Date(beatmapLatestSubmissionDate);
    mission.beatmapMinimumFavorites = beatmapMinimumFavorites;
    mission.beatmapMinimumPlayCount = beatmapMinimumPlayCount;
    mission.beatmapMinimumLength = beatmapMinimumLength;
    mission.isUniqueToRanked = isUniqueToRanked;

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

/* POST update mission win condition */
adminMissionsRouter.post('/:id/updateWinCondition', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { winCondition: req.body.winCondition }).orFail();

    res.json(req.body.winCondition);
});

/* POST update mission status */
adminMissionsRouter.post('/:id/updateStatus', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { status: req.body.status }).orFail();

    res.json(req.body.status);
});

/* POST toggle mode */
adminMissionsRouter.post('/:id/toggleMode', async (req, res) => {
    const mission = await MissionModel.findById(req.params.id).orFail();

    if (mission.modes && mission.modes.includes(req.body.mode)) {
        await MissionModel.findByIdAndUpdate(req.params.id, { $pull: { modes: req.body.mode } });
    } else {
        await MissionModel.findByIdAndUpdate(req.params.id, { $push: { modes: req.body.mode } });
    }

    const updatedMission = await MissionModel.findById(req.params.id).extendedDefaultPopulate().orFail();

    res.json(updatedMission.modes);
});

/* POST toggle artist */
adminMissionsRouter.post('/:id/toggleArtist', async (req, res) => {
    const mission = await MissionModel.findById(req.params.id).extendedDefaultPopulate().orFail();
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

    const updatedMission = await MissionModel.findById(req.params.id).extendedDefaultPopulate().orFail();

    res.json(updatedMission.artists);
});

/* POST update mission deadline */
adminMissionsRouter.post('/:id/updateDeadline', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { deadline: new Date(req.body.deadline) }).extendedDefaultPopulate().orFail();

    res.json(req.body.deadline);
});

/* POST toggle isShowcaseMission */
adminMissionsRouter.post('/:id/toggleIsShowcaseMission', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { isShowcaseMission: req.body.isShowcaseMission }).orFail();

    res.json(req.body.isShowcaseMission);
});

/* POST toggle isArtistShowcase */
adminMissionsRouter.post('/:id/toggleIsArtistShowcase', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { isArtistShowcase: req.body.isArtistShowcase }).orFail();

    res.json(req.body.isArtistShowcase);
});

/* POST toggle isSeparate */
adminMissionsRouter.post('/:id/toggleIsSeparate', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { isSeparate: req.body.isSeparate }).orFail();

    res.json(req.body.isSeparate);
});

/* POST update mission tier */
adminMissionsRouter.post('/:id/updateRemainingArtists', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { remainingArtists: req.body.remainingArtists }).orFail();

    res.json(req.body.remainingArtists);
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

/* POST update mission requirement for maximum ranked maps count */
adminMissionsRouter.post('/:id/updateUserMaximumRankedBeatmapsCount', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { userMaximumRankedBeatmapsCount: req.body.userMaximumRankedBeatmapsCount }).orFail();

    res.json(req.body.userMaximumRankedBeatmapsCount);
});

/* POST update mission requirement for maximum global rank */
adminMissionsRouter.post('/:id/updateUserMaximumGlobalRank', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { userMaximumGlobalRank: req.body.userMaximumGlobalRank }).orFail();

    res.json(req.body.userMaximumGlobalRank);
});

/* POST update mission requirement for maximum pp */
adminMissionsRouter.post('/:id/updateUserMaximumPp', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { userMaximumPp: req.body.userMaximumPp }).orFail();

    res.json(req.body.userMaximumPp);
});

/* POST update mission requirement for minimum pp */
adminMissionsRouter.post('/:id/updateUserMinimumPp', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { userMinimumPp: req.body.userMinimumPp }).orFail();

    res.json(req.body.userMinimumPp);
});

/* POST update mission requirement for minimum mg rank */
adminMissionsRouter.post('/:id/updateUserMinimumRank', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { userMinimumRank: req.body.userMinimumRank }).orFail();

    res.json(req.body.userMinimumRank);
});

/* POST update mission requirement for earliest beatmap submission date */
adminMissionsRouter.post('/:id/updateBeatmapEarliestSubmissionDate', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { beatmapEarliestSubmissionDate: new Date(req.body.beatmapEarliestSubmissionDate) }).orFail();

    res.json(req.body.beatmapEarliestSubmissionDate);
});

/* POST update mission requirement for latest beatmap submission date */
adminMissionsRouter.post('/:id/updateBeatmapLatestSubmissionDate', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { beatmapLatestSubmissionDate: new Date(req.body.beatmapLatestSubmissionDate) }).orFail();

    res.json(req.body.beatmapLatestSubmissionDate);
});

/* POST update mission requirement for beatmap minimum favorites */
adminMissionsRouter.post('/:id/updateBeatmapMinimumFavorites', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { beatmapMinimumFavorites: req.body.beatmapMinimumFavorites }).orFail();

    res.json(req.body.beatmapMinimumFavorites);
});

/* POST update mission requirement for beatmap minimum playcount */
adminMissionsRouter.post('/:id/updateBeatmapMinimumPlayCount', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { beatmapMinimumPlayCount: req.body.beatmapMinimumPlayCount }).orFail();

    res.json(req.body.beatmapMinimumPlayCount);
});

/* POST update mission requirement for beatmap minimum length */
adminMissionsRouter.post('/:id/updateBeatmapMinimumLength', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { beatmapMinimumLength: req.body.beatmapMinimumLength }).orFail();

    res.json(req.body.beatmapMinimumLength);
});

/* POST update mission requirement for is unique to ranked */
adminMissionsRouter.post('/:id/toggleIsUniqueToRanked', async (req, res) => {
    await MissionModel.findByIdAndUpdate(req.params.id, { isUniqueToRanked: req.body.isUniqueToRanked }).orFail();

    res.json(req.body.isUniqueToRanked);
});

/* POST toggle winning beatmap for mission */
adminMissionsRouter.post('/:missionId/:beatmapId/toggleWinningBeatmap', async (req, res) => {
    const mission = await MissionModel.findById(req.params.missionId).extendedDefaultPopulate().orFail();

    const winningBeatmapIds = mission.winningBeatmaps.map(b => b.id);
    const alreadyWinner = winningBeatmapIds.includes(req.params.beatmapId);

    if (alreadyWinner) {
        await MissionModel.findByIdAndUpdate(req.params.missionId, { $pull: { winningBeatmaps: req.params.beatmapId } });
    } else {
        await MissionModel.findByIdAndUpdate(req.params.missionId, { $push: { winningBeatmaps: req.params.beatmapId } });
    }

    const updatedMission = await MissionModel.findById(req.params.missionId).extendedDefaultPopulate().orFail();

    res.json(updatedMission.winningBeatmaps);
});

/* POST toggle invalid beatmap for mission */
adminMissionsRouter.post('/:missionId/:beatmapId/toggleInvalidBeatmap', async (req, res) => {
    const mission = await MissionModel.findById(req.params.missionId).extendedDefaultPopulate().orFail();

    const invalidBeatmapIds = mission.invalidBeatmaps.map(b => b.id);
    const alreadyInvalid = invalidBeatmapIds.includes(req.params.beatmapId);

    if (alreadyInvalid) {
        await MissionModel.findByIdAndUpdate(req.params.missionId, { $pull: { invalidBeatmaps: req.params.beatmapId } });
    } else {
        await MissionModel.findByIdAndUpdate(req.params.missionId, { $push: { invalidBeatmaps: req.params.beatmapId } });
    }

    const updatedMission = await MissionModel.findById(req.params.missionId).extendedDefaultPopulate().orFail();

    res.json(updatedMission.invalidBeatmaps);
});

/* POST toggle isQuestTrailblazer for a user */
adminMissionsRouter.post('/toggleIsQuestTrailblazer', async (req, res) => {
    const userOsuId = req.body.userOsuId;
    const user = await UserModel.findOne({ osuId: userOsuId }).orFail();
    await UserModel.findByIdAndUpdate(user._id, { isQuestTrailblazer: true });

    res.json(true);
});

export default adminMissionsRouter;
