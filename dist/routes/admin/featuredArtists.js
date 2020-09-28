"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
adminFeaturedArtistsRouter.get('/', (req, res) => {
    var _a, _b;
    res.render('admin/featuredArtists', {
        title: 'FA - Admin',
        script: 'adminFeaturedArtists.js',
        loggedInAs: (_a = req.session) === null || _a === void 0 ? void 0 : _a.osuId,
        userMongoId: (_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId,
        pointsInfo: res.locals.userRequest.pointsInfo,
    });
});
adminFeaturedArtistsRouter.get('/load', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const featuredArtists = yield featuredArtist_1.FeaturedArtistModel
        .find({})
        .populate(defaultPopulate)
        .sort({ osuId: 1, label: 1 });
    res.json(featuredArtists);
}));
adminFeaturedArtistsRouter.post('/:id/updateOsuId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { osuId: req.body.osuId }).orFail();
    res.json(parseInt(req.body.osuId, 10));
}));
adminFeaturedArtistsRouter.post('/:id/updateName', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { label: req.body.name }).orFail();
    res.json(req.body.name);
}));
adminFeaturedArtistsRouter.post('/:id/updateStatus', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { status: req.body.status }).orFail();
    res.json(req.body.status);
}));
adminFeaturedArtistsRouter.post('/:id/songs/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const song = new featuredSong_1.FeaturedSongModel();
    song.artist = req.body.artist.trim();
    song.title = req.body.title.trim();
    yield song.save();
    yield featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { $push: { songs: song } }).orFail();
    res.json(song);
}));
adminFeaturedArtistsRouter.post('/:id/songs/:songId/update', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const song = yield featuredSong_1.FeaturedSongModel
        .findByIdAndUpdate(req.params.songId, {
        artist: req.body.artist.trim(),
        title: req.body.title.trim(),
    })
        .orFail();
    res.json(song);
}));
adminFeaturedArtistsRouter.post('/:id/songs/:songId/delete', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { $pull: { songs: req.params.songId } }).orFail();
    yield featuredSong_1.FeaturedSongModel.findByIdAndRemove(req.params.songId).orFail();
    res.json({ success: 'ok' });
}));
exports.default = adminFeaturedArtistsRouter;
