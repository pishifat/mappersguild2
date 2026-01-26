"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../helpers/middlewares");
const featuredArtist_1 = require("../models/featuredArtist");
const user_1 = require("../models/user");
const artistsRouter = express_1.default.Router();
artistsRouter.use(middlewares_1.isLoggedIn);
artistsRouter.use(middlewares_1.isAdmin);
artistsRouter.use(middlewares_1.isSuperAdmin);
/* GET mostly relevant artists */
artistsRouter.get('/loadArtists', async (req, res) => {
    res.json(await featuredArtist_1.FeaturedArtistModel
        .find({
        $or: [
            { isContacted: true },
            { osuId: { $exists: true } },
        ],
    })
        .defaultPopulate());
});
/* GET the rest of them */
artistsRouter.get('/loadOtherArtists', async (req, res) => {
    res.json(await featuredArtist_1.FeaturedArtistModel
        .find({
        $or: [
            { isContacted: { $ne: true } },
            { osuId: { $exists: false } },
        ],
    })
        .defaultPopulate());
});
/* POST new artist. */
artistsRouter.post('/create', async (req, res) => {
    const { name, comment, isContacted, isResponded, isAnnounced } = req.body;
    const exists = await featuredArtist_1.FeaturedArtistModel.findOne({ label: name.trim() });
    if (exists) {
        return res.json({ error: 'already exists' });
    }
    const a = new featuredArtist_1.FeaturedArtistModel();
    a.label = req.body.name.trim();
    if (comment && comment.length) {
        a.notes = comment;
    }
    if (isContacted || isResponded) {
        a.isContacted = true;
        a.lastContacted = new Date();
    }
    if (isResponded) {
        a.isResponded = true;
    }
    if (isAnnounced) {
        a.isContacted = true;
        a.lastContacted = new Date();
        a.isResponded = true;
        a.contractSent = true;
        a.artistSigned = true;
        a.ppyPaid = true;
        a.ppySigned = true;
        a.songsTimed = true;
        a.songsReceived = true;
        a.assetsReceived = true;
        a.isUpToDate = true;
        a.hasRankedMaps = true;
    }
    await a.save();
    res.json(a);
});
/* POST toggle isContacted */
artistsRouter.post('/toggleIsContacted/:id', async (req, res) => {
    res.json(await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { isContacted: req.body.value }).defaultPopulate());
});
/* POST toggle isResponded */
artistsRouter.post('/toggleisResponded/:id', async (req, res) => {
    res.json(await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { isResponded: req.body.value }).defaultPopulate());
});
/* POST toggle isRejected */
artistsRouter.post('/toggleisRejected/:id', async (req, res) => {
    res.json(await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { isRejected: req.body.value }).defaultPopulate());
});
/* POST toggle contractSent */
artistsRouter.post('/toggleContractSent/:id', async (req, res) => {
    res.json(await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { contractSent: req.body.value }).defaultPopulate());
});
/* POST toggle artistSigned */
artistsRouter.post('/toggleArtistSigned/:id', async (req, res) => {
    res.json(await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { artistSigned: req.body.value }).defaultPopulate());
});
/* POST toggle ppyPaid */
artistsRouter.post('/togglePpyPaid/:id', async (req, res) => {
    res.json(await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { ppyPaid: req.body.value }).defaultPopulate());
});
/* POST toggle ppySigned */
artistsRouter.post('/togglePpySigned/:id', async (req, res) => {
    res.json(await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { ppySigned: req.body.value }).defaultPopulate());
});
/* POST toggle songsTimed */
artistsRouter.post('/toggleSongsTimed/:id', async (req, res) => {
    res.json(await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { songsTimed: req.body.value }).defaultPopulate());
});
/* POST toggle songsReceived */
artistsRouter.post('/toggleSongsReceived/:id', async (req, res) => {
    res.json(await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { songsReceived: req.body.value }).defaultPopulate());
});
/* POST toggle assetsReceived */
artistsRouter.post('/toggleAssetsReceived/:id', async (req, res) => {
    res.json(await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { assetsReceived: req.body.value }).defaultPopulate());
});
/* POST toggle hasRankedMaps */
artistsRouter.post('/toggleHasRankedMaps/:id', async (req, res) => {
    res.json(await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { hasRankedMaps: req.body.value }).defaultPopulate());
});
/* POST toggle hasNewSongs */
artistsRouter.post('/toggleHasNewSongs/:id', async (req, res) => {
    res.json(await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { hasNewSongs: req.body.value }).defaultPopulate());
});
/* POST toggle isUpToDate */
artistsRouter.post('/toggleIsUpToDate/:id', async (req, res) => {
    let a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).orFail();
    if (!req.body.value && !a?.hasNewSongs) {
        return res.json({ error: `Can't be not-up-to-date without pending songs!` });
    }
    a = await featuredArtist_1.FeaturedArtistModel
        .findByIdAndUpdate(req.params.id, {
        isUpToDate: req.body.value,
        isResponded: false,
        contractSent: false,
        artistSigned: false,
        ppyPaid: false,
        ppySigned: false,
        songsReceived: false,
        songsTimed: false,
        projectedRelease: undefined,
    })
        .defaultPopulate()
        .orFail();
    res.json(a);
});
/* POST update projectedRelease */
artistsRouter.post('/updateProjectedRelease/:id', async (req, res) => {
    res.json(await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { projectedRelease: req.body.date }).defaultPopulate());
});
/* POST update projectedRelease */
artistsRouter.post('/updateLastContacted/:id', async (req, res) => {
    res.json(await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { lastContacted: req.body.date }).defaultPopulate());
});
/* POST update notes */
artistsRouter.post('/updateNotes/:id', async (req, res) => {
    res.json(await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { notes: req.body.notes }).defaultPopulate());
});
/* POST update showcase mappers */
artistsRouter.post('/updateShowcaseMappers/:id', async (req, res) => {
    let a;
    if (!req.body.showcaseMappers.length) {
        await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { showcaseMappers: [] });
        a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).defaultPopulate();
    }
    else {
        const usersSplit = req.body.showcaseMappers.split(',');
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
        await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { showcaseMappers: userIds });
        a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).defaultPopulate();
    }
    res.json({ artist: a });
});
/* POST reset progress */
artistsRouter.post('/reset/:id', async (req, res) => {
    res.json(await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, {
        isResponded: false,
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
    }).defaultPopulate());
});
/* POST delete artist */
artistsRouter.post('/deleteArtist/:id', async (req, res) => {
    res.json(await featuredArtist_1.FeaturedArtistModel.findByIdAndRemove(req.params.id));
});
/* POST set all contacted but unreplied artists as rejected */
artistsRouter.post('/setAllAsRejected/', async (req, res) => {
    const contactedArtists = await featuredArtist_1.FeaturedArtistModel
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
        await artist.save();
    }
    const a = await featuredArtist_1.FeaturedArtistModel
        .find({})
        .defaultPopulate();
    res.json(a);
});
exports.default = artistsRouter;
