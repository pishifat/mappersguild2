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
const spentPoints_1 = require("../models/spentPoints");
const spentPoints_2 = require("../../interfaces/spentPoints");
const user_1 = require("../models/user");
const mission_2 = require("../../interfaces/mission");
const log_2 = require("../../interfaces/log");
const beatmap_2 = require("../../interfaces/beatmap/beatmap");
const middlewares_2 = require("./beatmaps/middlewares");
const featuredArtist_1 = require("../models/featuredArtist");
const discordApi_1 = require("../helpers/discordApi");
const points_1 = require("../helpers/points");
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
            status: mission_2.MissionStatus.Open,
            openingAnnounced: true,
        })
            .defaultPopulate()
            .sort({ tier: 1, createdAt: -1 }),
        beatmap_1.BeatmapModel
            .find({
            host: req.session.mongoId,
            status: { $ne: beatmap_2.BeatmapStatus.Ranked },
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
/* GET inactive missions */
missionsRouter.get('/loadInactiveMissions', async (req, res) => {
    const missions = await mission_1.MissionModel
        .find({
        status: mission_2.MissionStatus.Closed,
        openingAnnounced: true,
    })
        .defaultPopulate()
        .sort({ tier: 1, createdAt: -1 });
    res.json({ missions });
});
/* GET mission load from URL */
missionsRouter.get('/searchOnLoad/:id', async (req, res) => {
    const urlMission = await mission_1.MissionModel.findOne({ _id: req.params.id }).defaultPopulate();
    if (!urlMission) {
        return res.json({ error: 'Mission ID does not exist!' });
    }
    res.json(urlMission);
});
function meetsRequirements(mission, user, beatmap) {
    /* user requirements */
    if ((mission.userMaximumRankedBeatmapsCount || mission.userMaximumRankedBeatmapsCount == 0) && (user.rankedBeatmapsCount > mission.userMaximumRankedBeatmapsCount)) {
        return false;
    }
    if (mission.userMaximumGlobalRank && (user.globalRank < mission.userMaximumGlobalRank)) {
        return false;
    }
    let modePp = 0;
    switch (beatmap.mode) {
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
        default:
            modePp = user.pp;
    }
    if (mission.userMaximumPp && (modePp > mission.userMaximumPp)) {
        return false;
    }
    if (mission.userMinimumPp && (modePp < mission.userMinimumPp)) {
        return false;
    }
    /* beatmap requirements */
    const submissionDate = beatmap.submissionDate;
    const favorites = beatmap.favorites;
    const playCount = beatmap.playCount;
    if (submissionDate && mission.beatmapEarliestSubmissionDate && (new Date(submissionDate) < new Date(mission.beatmapEarliestSubmissionDate))) {
        return false;
    }
    if (submissionDate && mission.beatmapLatestSubmissionDate && (new Date(submissionDate) > new Date(mission.beatmapLatestSubmissionDate))) {
        return false;
    }
    if (favorites && playCount && mission.beatmapMinimumFavorites && mission.beatmapMinimumPlayCount && favorites < mission.beatmapMinimumFavorites && playCount < mission.beatmapMinimumPlayCount) {
        return false;
    }
    return true;
}
/* GET open missions */
missionsRouter.get('/open/:mode/:id', async (req, res) => {
    const user = await user_1.UserModel.findById(req.session.mongoId).orFail();
    const query = {
        status: mission_2.MissionStatus.Open,
        openingAnnounced: true,
    };
    if (req.params.mode !== beatmap_2.BeatmapMode.Hybrid) {
        query.modes = req.params.mode;
    }
    const [missions, beatmap] = await Promise.all([
        mission_1.MissionModel
            .find(query)
            .defaultPopulate()
            .sortByLatest(),
        beatmap_1.BeatmapModel
            .findById(req.params.id)
            .orFail(),
    ]);
    const filteredMissions = missions.filter(m => meetsRequirements(m, user, beatmap));
    res.json(filteredMissions);
});
/* POST add beatmap to mission */
missionsRouter.post('/:missionId/:mapId/addBeatmapToMission', isEditable, middlewares_2.isValidBeatmap, middlewares_2.isBeatmapHost, async (req, res) => {
    const mission = res.locals.mission;
    const beatmap = res.locals.beatmap;
    if (beatmap.quest || beatmap.mission) {
        return res.json({ error: 'Beatmap assigned to a quest/mission already!' });
    }
    const beatmapValidated = meetsRequirements(mission, res.locals.userRequest, beatmap);
    if (!beatmapValidated) {
        return res.json({ error: 'Beatmap does not meet quest requirements' });
    }
    if (!mission.modes.includes(beatmap.mode) && beatmap.mode !== beatmap_2.BeatmapMode.Hybrid) {
        return res.json({ error: 'Mode not allowed for this quest' });
    }
    if (mission.artists && mission.artists.length) {
        const artistIds = mission.artists.map(a => a._id);
        const artists = await featuredArtist_1.FeaturedArtistModel.find({ _id: { $in: artistIds } }).populate('songs').orFail();
        const songIds = [];
        for (const artist of artists) {
            for (const song of artist.songs) {
                songIds.push(song.id);
            }
        }
        if (!songIds.includes(beatmap.song.id)) {
            return res.json({ error: 'Song not applicable to this quest!' });
        }
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
    const invalidBeatmapIds = mission.invalidBeatmaps.map(b => b.id);
    const alreadyInvalid = invalidBeatmapIds.includes(req.params.mapId);
    if (alreadyInvalid) {
        await mission_1.MissionModel.findByIdAndUpdate(req.params.missionId, { $pull: { invalidBeatmaps: req.params.mapId } });
    }
    res.locals.beatmap.mission = undefined;
    res.locals.beatmap.quest = undefined;
    await res.locals.beatmap.save();
    const updatedMission = await mission_1.MissionModel.findById(req.params.missionId).defaultPopulate().orFail();
    res.json(updatedMission);
    log_1.LogModel.generate(req.session?.mongoId, `removed "${beatmap.song.artist} - ${beatmap.song.title}" from mission "${mission.name}"`, log_2.LogCategory.Mission);
});
/* POST findShowcaseMissionSong */
missionsRouter.post('/:missionId/findShowcaseMissionSong', isEditable, async (req, res) => {
    const mission = res.locals.mission;
    const user = await user_1.UserModel.findById(req.session.mongoId).orFail();
    if (mission.userMinimumRank && user.rank < mission.userMinimumRank) {
        return res.json({ error: `Song not loaded. Your MG rank is too low for this quest.` });
    }
    const missionWithSongs = await mission_1.MissionModel
        .findById(req.params.missionId)
        .populate({
        path: 'showcaseMissionSongs',
        populate: {
            path: 'song user',
        },
    })
        .orFail();
    const userExists = missionWithSongs.showcaseMissionSongs.find(s => s.user.id == user.id);
    if (userExists) {
        if (user.availablePoints < 35) { // rerolling costs 35
            return res.json({ error: 'Not enough available points!' });
        }
        await spentPoints_1.SpentPointsModel.generate(spentPoints_2.SpentPointsCategory.RerollShowcaseMissionSong, req.session.mongoId, null, mission.id);
        await points_1.updateUserPoints(req.session.mongoId);
        const previousArtist = await featuredArtist_1.FeaturedArtistModel.findOne({ songs: userExists.song }).orFail();
        await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(previousArtist.id, { $pull: { showcaseMappers: user._id } });
    }
    const artists = await featuredArtist_1.FeaturedArtistModel
        .find({
        $or: [
            { osuId: 0 },
            { osuId: { $exists: false } },
        ],
        songsTimed: true,
        hasRankedMaps: { $ne: true },
        songs: { $exists: true, $ne: [] },
    })
        .defaultPopulateWithSongs();
    let finalSong;
    let count = 0;
    while (!finalSong) {
        const artistIndex = Math.floor(Math.random() * (artists.length));
        const artist = artists[artistIndex];
        const songIndex = Math.floor(Math.random() * (artist.songs.length));
        const song = artist.songs[songIndex];
        const songSelected = missionWithSongs.showcaseMissionSongs.some(s => s.song.id == song.id);
        if (!song.isExcludedFromClassified && (!songSelected || count > 400)) { // if there's no songs left, it'll choose a duplicate song. this probably won't matter
            finalSong = song;
            await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(artist.id, { $push: { showcaseMappers: user._id } });
        }
        count++;
    }
    if (userExists) {
        const i = missionWithSongs.showcaseMissionSongs.findIndex(s => s.user.id == user.id); // guaranteed to exist
        missionWithSongs.showcaseMissionSongs[i].song = finalSong;
        await missionWithSongs.save();
    }
    else {
        mission.showcaseMissionSongs.push({
            user: req.session.mongoId,
            song: finalSong.id,
        });
        await mission.save();
    }
    const updatedMission = await mission_1.MissionModel.findById(req.params.missionId).defaultPopulate().orFail();
    res.json(updatedMission);
    await discordApi_1.devWebhookPost([{
            title: `showcase mission song ${userExists ? 'rerolled' : 'selected'}`,
            color: userExists ? discordApi_1.webhookColors.lightGreen : discordApi_1.webhookColors.lightOrange,
            description: `[**${user.username}**](https://osu.ppy.sh/users/${user.osuId}) selected **${finalSong.artist} - ${finalSong.title}** for **${mission.name}** priority quest`,
        }]);
    log_1.LogModel.generate(req.session?.mongoId, `${userExists ? 'rerolled' : 'found'} showcase mission song`, log_2.LogCategory.Mission);
});
/* POST findShowcaseMissionArtist */
missionsRouter.post('/:missionId/findShowcaseMissionArtist', isEditable, async (req, res) => {
    const mission = res.locals.mission;
    const user = await user_1.UserModel.findById(req.session.mongoId).orFail();
    if (mission.userMinimumRank && user.rank < mission.userMinimumRank) {
        return res.json({ error: `Artist not loaded. Your MG rank is too low for this quest.` });
    }
    const missionWithArtists = await mission_1.MissionModel
        .findById(req.params.missionId)
        .populate({
        path: 'showcaseMissionArtists',
        populate: {
            path: 'artist user',
        },
    })
        .orFail();
    const userExists = missionWithArtists.showcaseMissionArtists.find(a => a.user.id == user.id);
    if (userExists) {
        // This is a reroll - check points and cost
        const rerollCount = await spentPoints_1.SpentPointsModel.countDocuments({
            user: user.id,
            mission: mission.id,
            category: spentPoints_2.SpentPointsCategory.RerollShowcaseMissionArtist,
        });
        const rerollCost = 10 * Math.pow(2, rerollCount);
        if (user.availablePoints < rerollCost) {
            return res.json({ error: 'Not enough available points!' });
        }
        await spentPoints_1.SpentPointsModel.generate(spentPoints_2.SpentPointsCategory.RerollShowcaseMissionArtist, req.session.mongoId, null, mission.id);
        await points_1.updateUserPoints(req.session.mongoId);
        const previousArtist = userExists.artist;
        await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(previousArtist.id, { $pull: { showcaseMappers: user._id } });
    }
    const artists = await featuredArtist_1.FeaturedArtistModel
        .find({
        $or: [
            { osuId: 0 },
            { osuId: { $exists: false } },
        ],
        songsTimed: true,
        hasRankedMaps: { $ne: true },
        songs: { $exists: true, $ne: [] },
        _id: { $nin: user.previouslyRolledArtists || [] },
    })
        .defaultPopulateWithSongs();
    if (artists.length === 0) {
        return res.json({ error: 'No available artists remaining. Talk to pishifat because something probably went wrong.' });
    }
    const artistIndex = Math.floor(Math.random() * (artists.length));
    const artist = artists[artistIndex];
    await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(artist.id, { $push: { showcaseMappers: user._id } });
    // Add artist to user's previously rolled artists list
    await user_1.UserModel.findByIdAndUpdate(user.id, { $addToSet: { previouslyRolledArtists: artist._id } });
    if (userExists) {
        const i = missionWithArtists.showcaseMissionArtists.findIndex(a => a.user.id == user.id);
        missionWithArtists.showcaseMissionArtists[i].artist = artist;
        await missionWithArtists.save();
    }
    else {
        mission.showcaseMissionArtists.push({
            user: req.session.mongoId,
            artist,
        });
        await mission.save();
    }
    const updatedMission = await mission_1.MissionModel
        .findById(req.params.missionId)
        .populate({
        path: 'showcaseMissionArtists',
        populate: {
            path: 'artist user',
            populate: {
                path: 'songs',
            },
        },
    })
        .orFail();
    res.json(updatedMission);
    await discordApi_1.devWebhookPost([{
            title: `showcase mission artist ${userExists ? 'rerolled' : 'selected'}`,
            color: userExists ? discordApi_1.webhookColors.lightGreen : discordApi_1.webhookColors.lightOrange,
            description: `[**${user.username}**](https://osu.ppy.sh/users/${user.osuId}) selected **${artist.label}** for **${mission.name}** priority quest`,
        }]);
    log_1.LogModel.generate(req.session?.mongoId, `${userExists ? 'rerolled' : 'selected'} showcase mission artist`, log_2.LogCategory.Mission);
});
/* GET findSelectedShowcaseMissionSong */
missionsRouter.get('/:missionId/findSelectedShowcaseMissionSong', async (req, res) => {
    const mission = await mission_1.MissionModel
        .findById(req.params.missionId)
        .populate({
        path: 'showcaseMissionSongs',
        populate: {
            path: 'song user',
        },
    })
        .orFail();
    const song = mission.showcaseMissionSongs.find(s => s.user.id == req.session.mongoId);
    res.json(song);
});
/* GET findSelectedShowcaseMissionArtist */
missionsRouter.get('/:missionId/findSelectedShowcaseMissionArtist', async (req, res) => {
    const mission = await mission_1.MissionModel
        .findById(req.params.missionId)
        .populate({
        path: 'showcaseMissionArtists',
        populate: {
            path: 'artist user',
            populate: {
                path: 'songs',
                populate: {
                    path: 'songShowcaseMappers',
                },
            },
        },
    })
        .orFail();
    const artist = mission.showcaseMissionArtists.find(a => a.user.id == req.session.mongoId);
    res.json(artist);
});
/* GET artist reroll count */
missionsRouter.get('/:missionId/getArtistRerollCount', async (req, res) => {
    const rerollCount = await spentPoints_1.SpentPointsModel.countDocuments({
        user: req.session.mongoId,
        mission: req.params.missionId,
        category: spentPoints_2.SpentPointsCategory.RerollShowcaseMissionArtist,
    });
    res.json(rerollCount);
});
exports.default = missionsRouter;
