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
    { path: 'assignedUser', select: 'username osuId' },
];
artistsRouter.get('/', (req, res) => {
    var _a;
    res.render('artists', {
        title: 'Artists',
        script: 'artists.js',
        loggedInAs: (_a = req.session) === null || _a === void 0 ? void 0 : _a.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});
artistsRouter.get('/relevantInfo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const a = yield featuredArtist_1.FeaturedArtistService.queryAll({
        populate: defaultPopulate,
        sort: { updatedAt: -1 },
    });
    res.json({ artists: a, userId: (_a = req.session) === null || _a === void 0 ? void 0 : _a.mongoId });
}));
artistsRouter.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const a = yield featuredArtist_1.FeaturedArtistService.create(req.body.name);
    res.json(a);
}));
artistsRouter.post('/toggleIsContacted/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistService.update(req.params.id, { isContacted: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });
    res.json(a);
}));
artistsRouter.post('/toggleisResponded/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistService.update(req.params.id, { isResponded: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });
    res.json(a);
}));
artistsRouter.post('/toggleTracksSelected/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistService.update(req.params.id, { tracksSelected: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });
    res.json(a);
}));
artistsRouter.post('/toggleisRejected/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistService.update(req.params.id, { isRejected: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });
    res.json(a);
}));
artistsRouter.post('/toggleContractSent/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistService.update(req.params.id, { contractSent: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });
    res.json(a);
}));
artistsRouter.post('/toggleContractSigned/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistService.update(req.params.id, { contractSigned: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });
    res.json(a);
}));
artistsRouter.post('/toggleContractPaid/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistService.update(req.params.id, { contractPaid: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });
    res.json(a);
}));
artistsRouter.post('/toggleSongsTimed/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistService.update(req.params.id, { songsTimed: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });
    res.json(a);
}));
artistsRouter.post('/toggleSongsReceived/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistService.update(req.params.id, { songsReceived: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });
    res.json(a);
}));
artistsRouter.post('/toggleAssetsReceived/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistService.update(req.params.id, { assetsReceived: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });
    res.json(a);
}));
artistsRouter.post('/toggleBioWritten/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistService.update(req.params.id, { bioWritten: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });
    res.json(a);
}));
artistsRouter.post('/toggleIsInvited/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistService.update(req.params.id, { isInvited: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });
    res.json(a);
}));
artistsRouter.post('/toggleIsUpToDate/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistService.update(req.params.id, {
        isUpToDate: req.body.value,
        isResponded: false,
        tracksSelected: false,
        contractSent: false,
        contractSigned: false,
        contractPaid: false,
        songsReceived: false,
        songsTimed: false,
        assetsReceived: false,
        bioWritten: false,
        projectedRelease: null,
    });
    a = yield featuredArtist_1.FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });
    res.json(a);
}));
artistsRouter.post('/updateProjectedRelease/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistService.update(req.params.id, { projectedRelease: req.body.date });
    a = yield featuredArtist_1.FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });
    res.json(a);
}));
artistsRouter.post('/updateLastContacted/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistService.update(req.params.id, { lastContacted: req.body.date });
    a = yield featuredArtist_1.FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });
    res.json(a);
}));
artistsRouter.post('/updateNotes/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistService.update(req.params.id, { notes: req.body.notes });
    a = yield featuredArtist_1.FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });
    res.json(a);
}));
artistsRouter.post('/reset/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistService.update(req.params.id, {
        isResponded: false,
        tracksSelected: false,
        isRejected: false,
        isStalled: false,
        contractSent: false,
        contractSigned: false,
        contractPaid: false,
        songsTimed: false,
        assetsReceived: false,
        bioWritten: false,
        isInvited: false,
        isUpToDate: false,
        isPriority: false,
    });
    a = yield featuredArtist_1.FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });
    res.json(a);
}));
artistsRouter.post('/toggleIsPriority/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistService.update(req.params.id, { isPriority: req.body.value });
    a = yield featuredArtist_1.FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });
    res.json(a);
}));
artistsRouter.post('/assignUser/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    let a = yield featuredArtist_1.FeaturedArtistService.update(req.params.id, { assignedUser: (_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId });
    a = yield featuredArtist_1.FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });
    res.json(a);
}));
artistsRouter.post('/unassignUser/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let a = yield featuredArtist_1.FeaturedArtistService.update(req.params.id, { assignedUser: null });
    a = yield featuredArtist_1.FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });
    res.json(a);
}));
artistsRouter.post('/deleteArtist/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const a = yield featuredArtist_1.FeaturedArtistService.remove(req.params.id);
    res.json(a);
}));
exports.default = artistsRouter;
