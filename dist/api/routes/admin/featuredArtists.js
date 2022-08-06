"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../../helpers/middlewares");
const featuredArtist_1 = require("../../models/featuredArtist");
const featuredSong_1 = require("../../models/featuredSong");
const adminFeaturedArtistsRouter = express_1.default.Router();
adminFeaturedArtistsRouter.use(middlewares_1.isLoggedIn);
adminFeaturedArtistsRouter.use(middlewares_1.isAdmin);
adminFeaturedArtistsRouter.use(middlewares_1.isSuperAdmin);
const defaultPopulate = { path: 'songs', select: 'artist title' };
/* GET featured artists */
adminFeaturedArtistsRouter.get('/load', async (req, res) => {
    const featuredArtists = await featuredArtist_1.FeaturedArtistModel
        .find({})
        .populate(defaultPopulate)
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
    await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { osuId: req.body.osuId }).orFail();
    res.json(parseInt(req.body.osuId, 10));
});
/* POST update artist name */
adminFeaturedArtistsRouter.post('/:id/updateName', async (req, res) => {
    await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { label: req.body.name }).orFail();
    res.json(req.body.name);
});
/* POST update artist status */
adminFeaturedArtistsRouter.post('/:id/updateStatus', async (req, res) => {
    await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { status: req.body.status }).orFail();
    res.json(req.body.status);
});
/* POST add song to artist */
adminFeaturedArtistsRouter.post('/:id/songs/create', async (req, res) => {
    const song = new featuredSong_1.FeaturedSongModel();
    song.artist = req.body.artist.trim();
    song.title = req.body.title.trim();
    await song.save();
    await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { $push: { songs: song } }).orFail();
    res.json(song);
});
/* POST edit metadata */
adminFeaturedArtistsRouter.post('/:id/songs/:songId/update', async (req, res) => {
    const song = await featuredSong_1.FeaturedSongModel
        .findByIdAndUpdate(req.params.songId, {
        artist: req.body.artist.trim(),
        title: req.body.title.trim(),
    })
        .orFail();
    res.json(song);
});
/* POST remove song from artist */
adminFeaturedArtistsRouter.post('/:id/songs/:songId/delete', async (req, res) => {
    await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { $pull: { songs: req.params.songId } }).orFail();
    await featuredSong_1.FeaturedSongModel.findByIdAndRemove(req.params.songId).orFail();
    res.json({ success: 'ok' });
});
/* POST remove song from artist */
adminFeaturedArtistsRouter.get('/findRecentlyLicensedSongs', async (req, res) => {
    const startDate = new Date('2022-01-01');
    const endDate = new Date('2022-07-27');
    const songs = await featuredSong_1.FeaturedSongModel.find({ createdAt: { $gt: startDate, $lt: endDate } }).sort({ createdAt: -1 });
    console.log(songs.length);
    res.json({ songs });
});
exports.default = adminFeaturedArtistsRouter;
