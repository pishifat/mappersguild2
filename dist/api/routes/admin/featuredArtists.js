"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../../helpers/middlewares");
const featuredArtist_1 = require("../../models/featuredArtist");
const featuredSong_1 = require("../../models/featuredSong");
const user_1 = require("../../models/user");
const beatmap_1 = require("../../models/beatmap/beatmap");
const beatmap_2 = require("../../../interfaces/beatmap/beatmap");
const adminFeaturedArtistsRouter = express_1.default.Router();
adminFeaturedArtistsRouter.use(middlewares_1.isLoggedIn);
adminFeaturedArtistsRouter.use(middlewares_1.isAdmin);
adminFeaturedArtistsRouter.use(middlewares_1.isSuperAdmin);
/* GET featured artists */
adminFeaturedArtistsRouter.get('/load', async (req, res) => {
    const featuredArtists = await featuredArtist_1.FeaturedArtistModel
        .find({})
        .defaultPopulateWithSongs()
        .sort({ osuId: 1, label: 1 });
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
/* POST update reference URL */
adminFeaturedArtistsRouter.post('/:id/updateReferenceUrl', async (req, res) => {
    await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { referenceUrl: req.body.referenceUrl }).orFail();
    res.json(req.body.referenceUrl);
});
/* POST update osz templates URL */
adminFeaturedArtistsRouter.post('/:id/updateOszTemplatesUrl', async (req, res) => {
    await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { oszTemplatesUrl: req.body.oszTemplatesUrl }).orFail();
    res.json(req.body.oszTemplatesUrl);
});
/* POST update offered users for showcase mapping */
adminFeaturedArtistsRouter.post('/:id/updateOfferedUsers', async (req, res) => {
    let a;
    if (!req.body.offeredUsers.length) {
        a = await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { offeredUsers: [] });
        a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).defaultPopulateWithSongs();
    }
    else {
        const usersSplit = req.body.offeredUsers.split(',');
        const userIds = [];
        for (const u of usersSplit) {
            const user = await user_1.UserModel
                .findOne()
                .byUsernameOrOsuId(u);
            if (!user) {
                return res.json({ error: `Cannot find ${u}!` });
            }
            else {
                userIds.push(user._id);
            }
        }
        await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { offeredUsers: userIds });
        a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).defaultPopulateWithSongs();
    }
    res.json(a.offeredUsers);
});
/* POST add song to artist */
adminFeaturedArtistsRouter.post('/:id/songs/create', async (req, res) => {
    const song = new featuredSong_1.FeaturedSongModel();
    song.artist = req.body.artist.trim();
    song.title = req.body.title.trim();
    if (song.oszUrl && song.oszUrl.length) {
        song.oszUrl = req.body.oszUrl.trim();
    }
    else {
        song.oszUrl = null;
    }
    await song.save();
    await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { $push: { songs: song } }).orFail();
    res.json(song);
});
/* POST edit metadata */
adminFeaturedArtistsRouter.post('/:id/songs/:songId/update', async (req, res) => {
    let oszUrl = null;
    if (req.body.oszUrl && req.body.oszUrl.length) {
        oszUrl = req.body.oszUrl.trim();
    }
    const song = await featuredSong_1.FeaturedSongModel
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
    await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { $pull: { songs: req.params.songId } }).orFail();
    await featuredSong_1.FeaturedSongModel.findByIdAndRemove(req.params.songId).orFail();
    res.json({ success: 'ok' });
});
/* GET find recently licensed songs */
adminFeaturedArtistsRouter.get('/findRecentlyLicensedSongs', async (req, res) => {
    const startDate = new Date('2022-01-01');
    const endDate = new Date('2022-07-27');
    const songs = await featuredSong_1.FeaturedSongModel.find({ createdAt: { $gt: startDate, $lt: endDate } }).sort({ createdAt: -1 });
    res.json({ songs });
});
/* POST load artists without ranked maps since relevant date */
adminFeaturedArtistsRouter.post('/loadArtistsWithoutRankedMaps', async (req, res) => {
    const { date, threshold } = req.body;
    const allArtists = await featuredArtist_1.FeaturedArtistModel.find({ osuId: { $exists: true } }).defaultPopulate();
    const allRankedBeatmaps = await beatmap_1.BeatmapModel.find({ status: beatmap_2.BeatmapStatus.Ranked, rankedDate: { $gt: date } }).defaultPopulate();
    const outputArtists = [];
    for (const artist of allArtists) {
        let rankedMapCount = 0;
        for (const song of artist.songs) {
            const rankedMap = allRankedBeatmaps.find(b => b.song.id == song.id);
            if (rankedMap) {
                rankedMapCount++;
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
    await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { notes: req.body.notes }).orFail();
    res.json(req.body.notes);
});
/* POST update last reviewed */
adminFeaturedArtistsRouter.post('/:id/updateLastReviewed', async (req, res) => {
    await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { lastReviewed: new Date() }).orFail();
    res.json(new Date());
});
/* POST toggle permanently dismiss */
adminFeaturedArtistsRouter.post('/:id/togglePermanentlyDismiss', async (req, res) => {
    const artist = await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id).orFail();
    await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { permanentlyDismiss: !artist.permanentlyDismiss }).orFail();
    res.json(!artist.permanentlyDismiss);
});
exports.default = adminFeaturedArtistsRouter;
