import express from 'express';
import { FeaturedArtistModel } from '../../models/featuredArtist';
import { FeaturedArtistStatus } from '../../../interfaces/featuredArtist';
import { isLoggedIn } from '../../helpers/middlewares';

const featuredArtistsRouter = express.Router();

featuredArtistsRouter.use(isLoggedIn);

/* GET artists for new map entry */
featuredArtistsRouter.get('/', async (req, res) => {
    const featuredArtists = await FeaturedArtistModel.find({ $or: [ { status: FeaturedArtistStatus.Public }, { status: FeaturedArtistStatus.Playlist } ] });

    res.json(featuredArtists);
});

/* GET songs for new map entry */
featuredArtistsRouter.get('/:id/songs', async (req, res) => {
    const fa = await FeaturedArtistModel
        .findOne({ _id: req.params.id, $or: [ { status: FeaturedArtistStatus.Public }, { status: FeaturedArtistStatus.Playlist } ] })
        .populate({ path: 'songs', select: 'artist title' })
        .sort({ label: -1 })
        .orFail();

    res.json(fa.songs);
});

export default featuredArtistsRouter;
