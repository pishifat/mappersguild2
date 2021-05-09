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
const middlewares_1 = require("../helpers/middlewares");
const featuredArtist_1 = require("../models/featuredArtist");
const artistsRouter = express_1.default.Router();
artistsRouter.use(middlewares_1.isLoggedIn);
artistsRouter.use(middlewares_1.isAdmin);
const defaultPopulate = [
    { path: 'songs', select: 'artist title' },
];
artistsRouter.get('/relevantInfo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const a = yield featuredArtist_1.FeaturedArtistModel
        .find({})
        .populate(defaultPopulate)
        .sort({ updatedAt: -1 });
    res.json({ artists: a, userId: (_a = req.session) === null || _a === void 0 ? void 0 : _a.mongoId });
}));
artistsRouter.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const a = new featuredArtist_1.FeaturedArtistModel();
    a.label = req.body.name;
    yield a.save();
    res.json(a);
}));
artistsRouter.post('/toggleIsContacted/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { isContacted: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
}));
artistsRouter.post('/toggleisResponded/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { isResponded: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
}));
artistsRouter.post('/toggleTracksSelected/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { tracksSelected: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
}));
artistsRouter.post('/toggleisRejected/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { isRejected: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
}));
artistsRouter.post('/toggleContractSent/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { contractSent: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
}));
artistsRouter.post('/toggleArtistSigned/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { artistSigned: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
}));
artistsRouter.post('/togglePpyPaid/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { ppyPaid: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
}));
artistsRouter.post('/togglePpySigned/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { ppySigned: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
}));
artistsRouter.post('/toggleSongsTimed/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { songsTimed: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
}));
artistsRouter.post('/toggleSongsReceived/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { songsReceived: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
}));
artistsRouter.post('/toggleAssetsReceived/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { assetsReceived: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
}));
artistsRouter.post('/toggleHasRankedMaps/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { hasRankedMaps: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
}));
artistsRouter.post('/toggleIsMinor/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { isMinor: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
}));
artistsRouter.post('/toggleIsGroup/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { isGroup: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
}));
artistsRouter.post('/toggleIsUpToDate/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, {
        isUpToDate: req.body.value,
        isResponded: false,
        tracksSelected: false,
        contractSent: false,
        artistSigned: false,
        ppyPaid: false,
        ppySigned: false,
        songsReceived: false,
        songsTimed: false,
        hasRankedMaps: false,
        projectedRelease: undefined,
    });
    a = yield featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
}));
artistsRouter.post('/updateProjectedRelease/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { projectedRelease: req.body.date });
    a = yield featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
}));
artistsRouter.post('/updateLastContacted/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { lastContacted: req.body.date });
    a = yield featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
}));
artistsRouter.post('/updateNotes/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { notes: req.body.notes });
    a = yield featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
}));
artistsRouter.post('/reset/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, {
        isResponded: false,
        tracksSelected: false,
        isRejected: false,
        contractSent: false,
        artistSigned: false,
        ppyPaid: false,
        ppySigned: false,
        songsTimed: false,
        assetsReceived: false,
        hasRankedMaps: false,
        isUpToDate: false,
        projectedRelease: undefined,
    });
    a = yield featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
}));
artistsRouter.post('/deleteArtist/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const a = yield featuredArtist_1.FeaturedArtistModel.findByIdAndRemove(req.params.id);
    res.json(a);
}));
artistsRouter.post('/setAllAsRejected/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contactedArtists = yield featuredArtist_1.FeaturedArtistModel
        .find({
        isContacted: true,
        projectedRelease: { $exists: false },
        isUpToDate: { $ne: true },
        isRejected: { $ne: true },
        isResponded: { $ne: true },
        $or: [
            { osuId: 0 },
            { osuId: { $exists: false } },
        ],
    });
    for (const artist of contactedArtists) {
        artist.isRejected = true;
        yield artist.save();
    }
    const a = yield featuredArtist_1.FeaturedArtistModel
        .find({})
        .populate(defaultPopulate)
        .sort({ updatedAt: -1 });
    res.json(a);
}));
exports.default = artistsRouter;
