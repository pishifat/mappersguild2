import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';
import { FeaturedArtistService } from '../../models/featuredArtist';
import { FeaturedSongService } from '../../models/featuredSong';
import { canFail } from '../../helpers/helpers';

const adminFeaturedArtistsRouter = express.Router();

adminFeaturedArtistsRouter.use(isLoggedIn);
adminFeaturedArtistsRouter.use(isAdmin);
adminFeaturedArtistsRouter.use(isSuperAdmin);

/* GET users - admin page */
adminFeaturedArtistsRouter.get('/', (req, res) => {
    res.render('admin/featuredArtists', {
        title: 'FA - Admin',
        script: '../javascripts/adminFeaturedArtists.js',
        loggedInAs: req.session?.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});

/* GET featured artists */
adminFeaturedArtistsRouter.get('/load', async (req, res) => {
    const featuredArtists = await FeaturedArtistService.queryAll({
        defaultPopulate: true,
        sort: { osuId: 1, label: 1 },
    });

    res.json(featuredArtists);
});

/* POST update artist osuId */
adminFeaturedArtistsRouter.post('/:id/updateOsuId', canFail(async (req, res) => {
    let fa = await FeaturedArtistService.updateOrFail(req.params.id, { osuId: req.body.osuId });
    fa = await FeaturedArtistService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

    res.json(fa);
}));

/* POST update artist name */
adminFeaturedArtistsRouter.post('/:id/updateName', canFail(async (req, res) => {
    let fa = await FeaturedArtistService.updateOrFail(req.params.id, { label: req.body.name });
    fa = await FeaturedArtistService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

    res.json(fa);
}));

/* POST add song to artist */
adminFeaturedArtistsRouter.post('/:id/songs/create', canFail(async (req, res) => {
    const song = await FeaturedSongService.createOrFail(req.body.artist.trim(), req.body.title.trim());
    let fa = await FeaturedArtistService.updateOrFail(req.params.id, { $push: { songs: song } });
    fa = await FeaturedArtistService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

    res.json(fa);
}));

/* POST edit metadata */
adminFeaturedArtistsRouter.post('/:id/songs/:songId/update', canFail(async (req, res) => {
    await FeaturedSongService.updateOrFail(req.params.songId, { artist: req.body.artist.trim(), title: req.body.title.trim() });
    const fa = await FeaturedArtistService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

    res.json(fa);
}));

/* POST remove song from artist */
adminFeaturedArtistsRouter.post('/:id/songs/:songId/delete', canFail(async (req, res) => {
    await FeaturedArtistService.updateOrFail(req.params.id, { $pull: { songs: req.params.songId } });
    await FeaturedSongService.removeOrFail(req.params.songId);
    const fa = await FeaturedArtistService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

    res.json(fa);
}));

export default adminFeaturedArtistsRouter;
