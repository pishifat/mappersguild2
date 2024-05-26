import express from 'express';
import { findBeatmapsetId, sleep } from '../helpers/helpers';
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
import { devWebhookPost, webhookColors } from '../helpers/discordApi';
import { updateUserPoints } from '../helpers/points';
import { getClientCredentialsGrant, isOsuResponseError, getBeatmapsetV2Info } from '../helpers/osuApi';

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

function meetsRequirements(mission, user, beatmap, mode) {
    /* user requirements */
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


    console.log(favorites);
    console.log(playCount);

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

    const filteredMissions = missions.filter(m => meetsRequirements(m, user, beatmap, req.params.mode));

    res.json(filteredMissions);
});

/* POST add beatmap to mission */
missionsRouter.post('/:missionId/:mapId/addBeatmapToMission', isEditable, isValidBeatmap, isBeatmapHost, async (req, res) => {
    const mission: Mission = res.locals.mission;
    const beatmap: Beatmap = res.locals.beatmap;

    if (beatmap.quest || beatmap.mission) {
        return res.json({ error: 'Beatmap assigned to a quest/mission already!' });
    }

    const beatmapValidated = meetsRequirements(mission, res.locals.userRequest, beatmap, req.params.mode);

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

    if (!user.rank || user.rank === 0) {
        return res.json({ error: `Song not loaded. Your MG rank is too low for this quest.` });
    }

    if (user.availablePoints < 50) { // rerolling costs 50
        return res.json({ error: 'Not enough available points!' });
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

        if (!songSelected || count > 400) { // if there's no songs left, it'll choose a duplicate song. this probably won't matter
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

/* GET findShowcaseMissionSong */
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

export default missionsRouter;
