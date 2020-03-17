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
const helpers_1 = require("../../helpers/helpers");
const adminFeaturedArtistsRouter = express_1.default.Router();
adminFeaturedArtistsRouter.use(middlewares_1.isLoggedIn);
adminFeaturedArtistsRouter.use(middlewares_1.isAdmin);
adminFeaturedArtistsRouter.use(middlewares_1.isSuperAdmin);
adminFeaturedArtistsRouter.get('/', (req, res) => {
    var _a, _b;
    res.render('admin/featuredArtists', {
        title: 'FA - Admin',
        script: 'adminFeaturedArtists.js',
        loggedInAs: (_a = req.session) === null || _a === void 0 ? void 0 : _a.osuId,
        userMongoId: (_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});
adminFeaturedArtistsRouter.get('/load', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const featuredArtists = yield featuredArtist_1.FeaturedArtistService.queryAll({
        defaultPopulate: true,
        sort: { osuId: 1, label: 1 },
    });
    res.json(featuredArtists);
}));
adminFeaturedArtistsRouter.post('/:id/updateOsuId', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield featuredArtist_1.FeaturedArtistService.updateOrFail(req.params.id, { osuId: req.body.osuId });
    res.json(parseInt(req.body.osuId, 10));
})));
adminFeaturedArtistsRouter.post('/:id/updateName', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield featuredArtist_1.FeaturedArtistService.updateOrFail(req.params.id, { label: req.body.name });
    res.json(req.body.name);
})));
adminFeaturedArtistsRouter.post('/:id/songs/create', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const song = yield featuredSong_1.FeaturedSongService.createOrFail(req.body.artist.trim(), req.body.title.trim());
    yield featuredArtist_1.FeaturedArtistService.updateOrFail(req.params.id, { $push: { songs: song } });
    res.json(song);
})));
adminFeaturedArtistsRouter.post('/:id/songs/:songId/update', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const song = yield featuredSong_1.FeaturedSongService.updateOrFail(req.params.songId, { artist: req.body.artist.trim(), title: req.body.title.trim() });
    res.json(song);
})));
adminFeaturedArtistsRouter.post('/:id/songs/:songId/delete', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield featuredArtist_1.FeaturedArtistService.updateOrFail(req.params.id, { $pull: { songs: req.params.songId } });
    yield featuredSong_1.FeaturedSongService.removeOrFail(req.params.songId);
    res.json({ success: 'ok' });
})));
exports.default = adminFeaturedArtistsRouter;
