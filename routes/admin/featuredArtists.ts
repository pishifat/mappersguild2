import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';
import { FeaturedArtistService } from '../../models/featuredArtist';
import { FeaturedSongService } from '../../models/featuredSong';
import { canFail } from '../../helpers/helpers';

const adminFeaturedArtistsRouter = express.Router();

adminFeaturedArtistsRouter.use(isLoggedIn);
adminFeaturedArtistsRouter.use(isAdmin);

/* GET featured artists */
adminFeaturedArtistsRouter.get('/loadFeaturedArtists/', async (req, res) => {
    const fa = await FeaturedArtistService.queryAll({
        defaultPopulate: true,
        sort: { osuId: 1, label: 1 },
    });

    res.json({ fa });
});

/* POST update artist osuId */
adminFeaturedArtistsRouter.post('/updateFeaturedArtistOsuId/:id', isSuperAdmin, canFail(async (req, res) => {
    let fa = await FeaturedArtistService.updateOrFail(req.params.id, { osuId: req.body.osuId });
    fa = await FeaturedArtistService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

    res.json(fa);
}));

/* POST update artist name */
adminFeaturedArtistsRouter.post('/updateFeaturedArtistName/:id', isSuperAdmin, canFail(async (req, res) => {
    let fa = await FeaturedArtistService.updateOrFail(req.params.id, { label: req.body.name });
    fa = await FeaturedArtistService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

    res.json(fa);
}));

/* POST add song to artist */
adminFeaturedArtistsRouter.post('/addSong/:id', isSuperAdmin, canFail(async (req, res) => {
    const song = await FeaturedSongService.createOrFail(req.body.artist.trim(), req.body.title.trim());
    let fa = await FeaturedArtistService.updateOrFail(req.params.id, { $push: { songs: song } });
    fa = await FeaturedArtistService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

    res.json(fa);
}));

/* POST edit metadata */
adminFeaturedArtistsRouter.post('/editSong/:id', isSuperAdmin, canFail(async (req, res) => {
    await FeaturedSongService.updateOrFail(req.body.songId, { artist: req.body.artist.trim(), title: req.body.title.trim() });
    const fa = await FeaturedArtistService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

    res.json(fa);
}));

/* POST remove song from artist */
adminFeaturedArtistsRouter.post('/deleteSong/:id', isSuperAdmin, canFail(async (req, res) => {
    await FeaturedArtistService.updateOrFail(req.params.id, { $pull: { songs: req.body.songId } });
    await FeaturedSongService.removeOrFail(req.body.songId);
    const fa = await FeaturedArtistService.queryByIdOrFail(req.params.id, { defaultPopulate: true });

    res.json(fa);
}));

export default adminFeaturedArtistsRouter;
