import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';
import { FeaturedArtistModel } from '../../models/featuredArtist';
import { FeaturedSongModel } from '../../models/featuredSong';
import { UserModel } from '../../models/user';
import { BeatmapModel } from '../../models/beatmap/beatmap';
import { User } from '../../../interfaces/user';
import { BeatmapStatus } from '../../../interfaces/beatmap/beatmap';

const adminFeaturedArtistsRouter = express.Router();

adminFeaturedArtistsRouter.use(isLoggedIn);
adminFeaturedArtistsRouter.use(isAdmin);
adminFeaturedArtistsRouter.use(isSuperAdmin);

/* GET featured artists */
adminFeaturedArtistsRouter.get('/loadRelevant', async (req, res) => {
    const featuredArtists = await FeaturedArtistModel
        .find({ isContacted: true })
        .defaultPopulateWithSongs()
        .sort({ osuId: 1, label: 1 });

    res.json(featuredArtists);
});

/* GET featured artists (including ones that haven't been contacted) */
adminFeaturedArtistsRouter.get('/loadAll', async (req, res) => {
    const featuredArtists = await FeaturedArtistModel
        .find({})
        .defaultPopulateWithSongs()
        .sort({ osuId: 1, label: 1 });

    res.json(featuredArtists);
});

/* POST update artist osuId */
adminFeaturedArtistsRouter.post('/:id/updateOsuId', async (req, res) => {
    await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { osuId: req.body.osuId }).orFail();

    res.json(parseInt(req.body.osuId, 10));
});

/* POST update artist name */
adminFeaturedArtistsRouter.post('/:id/updateName', async (req, res) => {
    await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { label: req.body.name }).orFail();

    res.json(req.body.name);
});

/* POST update artist status */
adminFeaturedArtistsRouter.post('/:id/updateStatus', async (req, res) => {
    await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { status: req.body.status }).orFail();

    res.json(req.body.status);
});

/* POST update reference URL */
adminFeaturedArtistsRouter.post('/:id/updateReferenceUrl', async (req, res) => {
    await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { referenceUrl: req.body.referenceUrl }).orFail();

    res.json(req.body.referenceUrl);
});

/* POST update osz templates URL */
adminFeaturedArtistsRouter.post('/:id/updateOszTemplatesUrl', async (req, res) => {
    await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { oszTemplatesUrl: req.body.oszTemplatesUrl }).orFail();

    res.json(req.body.oszTemplatesUrl);
});

/* POST update offered users for showcase mapping */
adminFeaturedArtistsRouter.post('/:id/updateOfferedUsers', async (req, res) => {
    let a;

    if (!req.body.offeredUsers.length) {
        a = await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { offeredUsers: [] });
        a = await FeaturedArtistModel.findById(req.params.id).defaultPopulateWithSongs();
    } else {
        const usersSplit: string[] = req.body.offeredUsers.split(',');

        const userIds: User['_id'] = [];

        for (const u of usersSplit) {
            const user = await UserModel
                .findOne()
                .byUsernameOrOsuId(u);

            if (!user) {
                return res.json({ error: `Cannot find ${u}!` });
            } else {
                userIds.push(user._id);
            }
        }

        await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { offeredUsers: userIds });
        a = await FeaturedArtistModel.findById(req.params.id).defaultPopulateWithSongs();
    }

    res.json(a.offeredUsers);
});

/* POST add song to artist */
adminFeaturedArtistsRouter.post('/:id/songs/create', async (req, res) => {
    const song = new FeaturedSongModel();
    song.artist = req.body.artist.trim();
    song.title = req.body.title.trim();

    if (req.body.oszUrl && req.body.oszUrl.length) {
        song.oszUrl = req.body.oszUrl.trim();
    } else {
        song.oszUrl = null;
    }

    await song.save();
    await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { $push: { songs: song } }).orFail();

    res.json(song);
});

/* POST edit metadata */
adminFeaturedArtistsRouter.post('/:id/songs/:songId/update', async (req, res) => {
    let oszUrl = null;

    if (req.body.oszUrl && req.body.oszUrl.length) {
        oszUrl = req.body.oszUrl.trim();
    }

    const song = await FeaturedSongModel
        .findByIdAndUpdate(req.params.songId, {
            artist: req.body.artist.trim(),
            title: req.body.title.trim(),
            oszUrl,
        })
        .orFail();

    res.json(song);
});

/* POST remove song from artist */
adminFeaturedArtistsRouter.post('/:id/songs/:songId/delete', async (req, res) => {
    await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { $pull: { songs: req.params.songId as any } }).orFail();
    await FeaturedSongModel.findByIdAndRemove(req.params.songId).orFail();

    res.json({ success: 'ok' });
});

/* GET find recently licensed songs */
adminFeaturedArtistsRouter.get('/findRecentlyLicensedSongs', async (req, res) => {
    const startDate = new Date('2019-01-01');
    const endDate = new Date();

    const songs = await FeaturedSongModel.find({ createdAt: { $gt: startDate, $lt: endDate } }).sort({ createdAt: -1 });

    res.json({ songs });
});

/* POST load artists without ranked maps since relevant date */
adminFeaturedArtistsRouter.post('/loadArtistsWithoutRankedMaps', async (req, res) => {
    const { date, threshold } = req.body;

    const allArtists = await FeaturedArtistModel.find({ osuId: { $exists: true } }).defaultPopulate();
    const allRankedBeatmaps = await BeatmapModel.find({ status: BeatmapStatus.Ranked, rankedDate: { $gt: date } }).defaultPopulate();

    const outputArtists: any = [];

    for (const artist of allArtists) {
        let rankedMapCount = 0;

        for (const song of artist.songs) {
            const rankedMap = allRankedBeatmaps.find(b => b.song.id == song.id);


            if (rankedMap) {
                rankedMapCount ++;
            }
        }


        if (rankedMapCount < threshold) {
            outputArtists.push({
                name: artist.label,
                osuId: artist.osuId,
                rankedMaps: rankedMapCount,
            });
        }
    }

    res.json({ artists: outputArtists });
});

/* POST update review comment */
adminFeaturedArtistsRouter.post('/:id/updateNotes', async (req, res) => {
    await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { notes: req.body.notes }).orFail();

    res.json(req.body.notes);
});

/* POST update last reviewed */
adminFeaturedArtistsRouter.post('/:id/updateLastReviewed', async (req, res) => {
    await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { lastReviewed: new Date() }).orFail();

    res.json(new Date());
});

/* POST toggle permanently dismiss */
adminFeaturedArtistsRouter.post('/:id/togglePermanentlyDismiss', async (req, res) => {
    const artist = await FeaturedArtistModel.findByIdAndUpdate(req.params.id).orFail();
    await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { permanentlyDismiss: !artist.permanentlyDismiss }).orFail();

    res.json(!artist.permanentlyDismiss);
});

export default adminFeaturedArtistsRouter;
