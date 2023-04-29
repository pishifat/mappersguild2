import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';
import { FeaturedArtistModel } from '../../models/featuredArtist';
import { FeaturedSongModel } from '../../models/featuredSong';
import { UserModel } from '../../models/user';
import { User } from '../../../interfaces/user';

const adminFeaturedArtistsRouter = express.Router();

adminFeaturedArtistsRouter.use(isLoggedIn);
adminFeaturedArtistsRouter.use(isAdmin);
adminFeaturedArtistsRouter.use(isSuperAdmin);

/* GET featured artists */
adminFeaturedArtistsRouter.get('/load', async (req, res) => {
    const featuredArtists = await FeaturedArtistModel
        .find({})
        .defaultPopulateWithSongs()
        .sort({ osuId: 1, label: 1 });

    /* log artists who haven't had a ranked map in x timeframe. convert to more user friendly system
    for (let i = 0; i < featuredArtists.length; i++) {
        const fa = featuredArtists[i];
        // console.log(fa.songs);

        const songs = fa.songs.map(s => s.id);

        const date = new Date('12-31-2019');

        if (fa.status == FeaturedArtistStatus.Public) {
            const bm = await BeatmapModel.find({ song: songs, status: BeatmapStatus.Ranked, rankedDate: { $gt: date } });

            if (!bm.length) console.log(fa.label);
        }
    } */

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
    await song.save();
    await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { $push: { songs: song } }).orFail();

    res.json(song);
});

/* POST edit metadata */
adminFeaturedArtistsRouter.post('/:id/songs/:songId/update', async (req, res) => {
    const song = await FeaturedSongModel
        .findByIdAndUpdate(req.params.songId, {
            artist: req.body.artist.trim(),
            title: req.body.title.trim(),
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

/* POST remove song from artist */
adminFeaturedArtistsRouter.get('/findRecentlyLicensedSongs', async (req, res) => {
    const startDate = new Date('2022-01-01');
    const endDate = new Date('2022-07-27');

    const songs = await FeaturedSongModel.find({ createdAt: { $gt: startDate, $lt: endDate } }).sort({ createdAt: -1 });

    console.log(songs.length);

    res.json({ songs });
});

/* POST update review comment */
adminFeaturedArtistsRouter.post('/:id/updateReviewComment', async (req, res) => {
    await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { reviewComment: req.body.reviewComment }).orFail();

    res.json(req.body.reviewComment);
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
