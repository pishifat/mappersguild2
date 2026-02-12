import express from 'express';
import { isLoggedIn } from '../helpers/middlewares';
import { MissionModel } from '../models/mission';
import { LogModel } from '../models/log';
import { BeatmapModel } from '../models/beatmap/beatmap';
import { SpentPointsModel } from '../models/spentPoints';
import { SpentPointsCategory } from '../../interfaces/spentPoints';
import { UserModel } from '../models/user';
import { Mission, MissionStatus, MissionMode } from '../../interfaces/mission';
import { FeaturedArtist } from '../../interfaces/featuredArtist';
import { User } from '../../interfaces/user';
import { LogCategory } from '../../interfaces/log';
import { Beatmap, BeatmapStatus, BeatmapMode } from '../../interfaces/beatmap/beatmap';
import { isBeatmapHost, isValidBeatmap } from './beatmaps/middlewares';
import { FeaturedArtistModel } from '../models/featuredArtist';
import { FeaturedSongModel } from '../models/featuredSong';
import { devWebhookPost, webhookColors } from '../helpers/discordApi';
import { updateUserPoints } from '../helpers/points';

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
                status: MissionStatus.Open,
                openingAnnounced: true,
            })
            .defaultPopulate()
            .sort({ tier: 1, name: 1, createdAt: -1 }),
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

/* GET inactive missions */
missionsRouter.get('/loadInactiveMissions', async (req, res) => {
    const missions = await MissionModel
        .find({
            status: MissionStatus.Closed,
            openingAnnounced: true,
        })
        .defaultPopulate()
        .sort({ tier: 1, createdAt: -1 });

    res.json({ missions });
});

/* GET mission load from URL */
missionsRouter.get('/searchOnLoad/:id', async (req, res) => {
    const urlMission = await MissionModel.findOne({ _id: req.params.id }).defaultPopulate();

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

    const filteredMissions = missions.filter(m => meetsRequirements(m, user, beatmap));

    res.json(filteredMissions);
});

/* POST add beatmap to mission */
missionsRouter.post('/:missionId/:mapId/addBeatmapToMission', isEditable, isValidBeatmap, isBeatmapHost, async (req, res) => {
    const mission: Mission = res.locals.mission;
    const beatmap: Beatmap = res.locals.beatmap;

    if (beatmap.quest || beatmap.mission) {
        return res.json({ error: 'Beatmap assigned to a quest/mission already!' });
    }

    const beatmapValidated = meetsRequirements(mission, res.locals.userRequest, beatmap);

    if (!beatmapValidated) {
        return res.json({ error: 'Beatmap does not meet quest requirements' });
    }

    if (!mission.modes.includes(beatmap.mode as unknown as MissionMode) && beatmap.mode !== BeatmapMode.Hybrid) {
        return res.json({ error: 'Mode not allowed for this quest' });
    }

    if (mission.artists && mission.artists.length) {
        const artistIds = mission.artists.map(a => a._id);
        const artists = await FeaturedArtistModel.find({ _id: { $in: artistIds } }).populate('songs').orFail();
        const songIds: string[] = [];

        for (const artist of artists) {
            for (const song of artist.songs) {
                songIds.push(song.id);
            }
        }

        if (!songIds.includes(beatmap.song.id)) {
            return res.json({ error: 'Song not applicable to this quest!' });
        }
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

/* POST findShowcaseMissionSong */
missionsRouter.post('/:missionId/findShowcaseMissionSong', isEditable, async (req, res) => {
    const mission: Mission = res.locals.mission;
    const user: User = await UserModel.findById(req.session.mongoId).orFail();

    if (mission.userMinimumRank && user.rank < mission.userMinimumRank) {
        return res.json({ error: `Song not loaded. Your MG rank is too low for this quest.` });
    }

    const missionWithSongs: Mission = await MissionModel
        .findById(req.params.missionId)
        .populate(
            {
                path: 'showcaseMissionSongs',
                populate: {
                    path: 'song user',
                },
            }
        )
        .orFail();

    const userExists = missionWithSongs.showcaseMissionSongs.find(s => s.user.id == user.id);

    if (userExists) {
        if (user.availablePoints < 35) { // rerolling costs 35
            return res.json({ error: 'Not enough available points!' });
        }

        await SpentPointsModel.generate(SpentPointsCategory.RerollShowcaseMissionSong, req.session.mongoId, null, mission.id);
        await updateUserPoints(req.session.mongoId);

        const previousArtist = await FeaturedArtistModel.findOne({ songs: userExists.song }).orFail();
        await FeaturedArtistModel.findByIdAndUpdate(previousArtist.id, { $pull: { showcaseMappers: user._id } });
    }

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

            await FeaturedArtistModel.findByIdAndUpdate(artist.id, { $push: { showcaseMappers: user._id } });
        }

        count++;
    }

    if (userExists) {
        const i = missionWithSongs.showcaseMissionSongs.findIndex(s => s.user.id == user.id); // guaranteed to exist

        missionWithSongs.showcaseMissionSongs[i].song = finalSong;

        await missionWithSongs.save();
    } else {
        mission.showcaseMissionSongs.push({
            user: req.session.mongoId,
            song: finalSong.id,
        });

        await mission.save();
    }

    const updatedMission = await MissionModel.findById(req.params.missionId).defaultPopulate().orFail();

    res.json(updatedMission);

    await devWebhookPost([{
        title: `showcase mission song ${userExists ? 'rerolled' : 'selected'}`,
        color: userExists ? webhookColors.lightGreen : webhookColors.lightOrange,
        description: `[**${user.username}**](https://osu.ppy.sh/users/${user.osuId}) selected **${finalSong.artist} - ${finalSong.title}** for **${mission.name}** priority quest`,
    }]);

    LogModel.generate(req.session?.mongoId, `${userExists ? 'rerolled' : 'found'} showcase mission song`, LogCategory.Mission );
});

/* POST findShowcaseMissionArtist */
missionsRouter.post('/:missionId/findShowcaseMissionArtist', isEditable, async (req, res) => {
    const mission: Mission = res.locals.mission;
    const user: User = await UserModel.findById(req.session.mongoId).orFail();

    if (mission.userMinimumRank && user.rank < mission.userMinimumRank) {
        return res.json({ error: `Artist not loaded. Your MG rank is too low for this quest.` });
    }

    const missionWithArtists: Mission = await MissionModel
        .findById(req.params.missionId)
        .populate(
            {
                path: 'showcaseMissionArtists',
                populate: {
                    path: 'artist user',
                },
            }
        )
        .orFail();

    const userExists = missionWithArtists.showcaseMissionArtists.find(a => a.user.id == user.id);

    if (userExists) {
        // This is a reroll - check points and cost
        const rerollCount = await SpentPointsModel.countDocuments({
            user: user.id,
            mission: mission.id,
            category: SpentPointsCategory.RerollShowcaseMissionArtist,
        });

        const rerollCost = 10 * Math.pow(2, rerollCount);

        if (user.availablePoints < rerollCost) {
            return res.json({ error: 'Not enough available points!' });
        }

        await SpentPointsModel.generate(SpentPointsCategory.RerollShowcaseMissionArtist, req.session.mongoId, null, mission.id);
        await updateUserPoints(req.session.mongoId);

        const previousArtist = userExists.artist;
        await FeaturedArtistModel.findByIdAndUpdate(previousArtist.id, { $pull: { showcaseMappers: user._id } });
    }

    const artists: FeaturedArtist[] = await FeaturedArtistModel
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

    await FeaturedArtistModel.findByIdAndUpdate(artist.id, { $push: { showcaseMappers: user._id } });

    // Add artist to user's previously rolled artists list
    await UserModel.findByIdAndUpdate(user.id, { $addToSet: { previouslyRolledArtists: artist._id } });

    if (userExists) {
        const i = missionWithArtists.showcaseMissionArtists.findIndex(a => a.user.id == user.id);
        missionWithArtists.showcaseMissionArtists[i].artist = artist;
        await missionWithArtists.save();
    } else {
        mission.showcaseMissionArtists.push({
            user: req.session.mongoId,
            artist,
        });
        await mission.save();
    }

    const updatedMission: Mission = await MissionModel
        .findById(req.params.missionId)
        .populate(
            {
                path: 'showcaseMissionArtists',
                populate: {
                    path: 'artist user',
                    populate: {
                        path: 'songs',
                    },
                },
            }
        )
        .orFail();

    res.json(updatedMission);

    await devWebhookPost([{
        title: `showcase mission artist ${userExists ? 'rerolled' : 'selected'}`,
        color: userExists ? webhookColors.lightGreen : webhookColors.lightOrange,
        description: `[**${user.username}**](https://osu.ppy.sh/users/${user.osuId}) selected **${artist.label}** for **${mission.name}** priority quest`,
    }]);

    LogModel.generate(req.session?.mongoId, `${userExists ? 'rerolled' : 'selected'} showcase mission artist`, LogCategory.Mission );
});

/* GET findSelectedShowcaseMissionSong */
missionsRouter.get('/:missionId/findSelectedShowcaseMissionSong', async (req, res) => {
    const mission: Mission = await MissionModel
        .findById(req.params.missionId)
        .populate(
            {
                path: 'showcaseMissionSongs',
                populate: {
                    path: 'song user',
                },
            }
        )
        .orFail();

    const song = mission.showcaseMissionSongs.find(s => s.user.id == req.session.mongoId);

    res.json(song);
});

/* GET findSelectedShowcaseMissionArtist */
missionsRouter.get('/:missionId/findSelectedShowcaseMissionArtist', async (req, res) => {
    const mission: Mission = await MissionModel
        .findById(req.params.missionId)
        .populate(
            {
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
            }
        )
        .orFail();

    const artist = mission.showcaseMissionArtists.find(a => a.user.id == req.session.mongoId);

    res.json(artist);
});

/* GET artist reroll count */
missionsRouter.get('/:missionId/getArtistRerollCount', async (req, res) => {
    const rerollCount = await SpentPointsModel.countDocuments({
        user: req.session.mongoId,
        mission: req.params.missionId,
        category: SpentPointsCategory.RerollShowcaseMissionArtist,
    });

    res.json(rerollCount);
});

/* POST add song showcase mapper */
missionsRouter.post('/addSongShowcaseMapper/:artistId/:songId', async (req, res) => {
    const [artist, song] = await Promise.all([
        FeaturedArtistModel
            .findById(req.params.artistId)
            .defaultPopulateWithSongs()
            .orFail(),
        FeaturedSongModel
            .findById(req.params.songId)
            .defaultPopulate()
            .orFail(),
    ]);

    const showcaseMapperIds = artist.showcaseMappers.map(u => u.id);

    if (!showcaseMapperIds.includes(req.session.mongoId)) {
        return res.json({ error: 'Not marked as interested in artist' });
    }

    const songShowcaseMapperIds = song.songShowcaseMappers.map(u => u.id);

    if (songShowcaseMapperIds.includes(req.session.mongoId)) {
        return res.json({ error: 'Already marked for song. Try refreshing!' });
    }

    song.songShowcaseMappers.push(req.session.mongoId);
    await song.save();

    const newArtist = await FeaturedArtistModel
        .findById(req.params.artistId)
        .defaultPopulateWithSongs()
        .orFail();

    res.json(newArtist);

    devWebhookPost([{
        author: {
            name: res.locals.userRequest.username,
            url: `https://osu.ppy.sh/users/${res.locals.userRequest.osuId}`,
            icon_url: `https://a.ppy.sh/${res.locals.userRequest.osuId}`,
        },
        color: webhookColors.lightGreen,
        description: `Added interest in **song:** [**${song.artist} - ${song.title}**](https://mappersguild.com/artists)`,
    }]);
});

/* POST remove song showcase mapper */
missionsRouter.post('/removeSongShowcaseMapper/:artistId/:songId', async (req, res) => {
    const song = await FeaturedSongModel
        .findById(req.params.songId)
        .defaultPopulate()
        .orFail();

    const songShowcaseMapperIds = song.songShowcaseMappers.map(u => u.id);
    const i = songShowcaseMapperIds.indexOf(req.session.mongoId);

    if (i == -1) {
        return res.json({ error: 'Not marked for song. Try refreshing!' });
    }

    song.songShowcaseMappers.splice(i, 1);
    await song.save();

    const artist = await FeaturedArtistModel
        .findById(req.params.artistId)
        .defaultPopulateWithSongs()
        .orFail();

    res.json(artist);

    devWebhookPost([{
        author: {
            name: `${res.locals.userRequest.username}`,
            url: `https://osu.ppy.sh/users/${res.locals.userRequest.osuId}`,
            icon_url: `https://a.ppy.sh/${res.locals.userRequest.osuId}`,
        },
        color: webhookColors.lightRed,
        description: `Removed interest in **song:** [**${song.artist} - ${song.title}**](https://mappersguild.com/artists)`,
    }]);
});

export default missionsRouter;
