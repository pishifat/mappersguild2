import express from 'express';
import { FeaturedArtistService } from '../../models/featuredArtist';
import { isLoggedIn } from '../../helpers/middlewares';
import { canFail } from '../../helpers/helpers';

const featuredArtistsRouter = express.Router();

featuredArtistsRouter.use(isLoggedIn);

/* GET artists for new map entry */
featuredArtistsRouter.get('/', async (req, res) => {
    const featuredArtists = await FeaturedArtistService.queryAll({
        query: { osuId: { $exists: true } },
    });

    res.json(featuredArtists);
});

/* GET songs for new map entry */
featuredArtistsRouter.get('/:id/songs', canFail(async (req, res) => {
    const fa = await FeaturedArtistService.queryByIdOrFail(req.params.id, {
        useDefaults: true,
    });

    res.json(fa.songs);
}));

export default featuredArtistsRouter;
