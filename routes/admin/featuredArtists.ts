import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';
import { FeaturedArtistModel } from '../../models/featuredArtist';
import { FeaturedSongModel } from '../../models/featuredSong';

const adminFeaturedArtistsRouter = express.Router();

adminFeaturedArtistsRouter.use(isLoggedIn);
adminFeaturedArtistsRouter.use(isAdmin);
adminFeaturedArtistsRouter.use(isSuperAdmin);

const defaultPopulate = { path: 'songs', select: 'artist title' };

/* GET users - admin page */
adminFeaturedArtistsRouter.get('/', (req, res) => {
    res.render('admin/featuredArtists', {
        title: 'FA - Admin',
        script: 'adminFeaturedArtists.js',
        loggedInAs: req.session?.osuId,
        userMongoId: req.session?.mongoId,
        pointsInfo: res.locals.userRequest.pointsInfo,
    });
});

/* GET featured artists */
adminFeaturedArtistsRouter.get('/load', async (req, res) => {
    const featuredArtists = await FeaturedArtistModel
        .find({})
        .populate(defaultPopulate)
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

export default adminFeaturedArtistsRouter;
