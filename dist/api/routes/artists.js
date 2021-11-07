"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../helpers/middlewares");
const featuredArtist_1 = require("../models/featuredArtist");
const osuBeatmap_1 = require("../models/osuBeatmap");
const user_1 = require("../models/user");
const fs_1 = __importDefault(require("fs"));
const artistsRouter = express_1.default.Router();
artistsRouter.use(middlewares_1.isLoggedIn);
artistsRouter.use(middlewares_1.isAdmin);
// population
const defaultPopulate = [
    { path: 'songs', select: 'artist title' },
    { path: 'showcaseMappers', select: 'username osuId' },
];
// population
const defaultOsuBeatmapPopulate = [
    { path: 'featuredArtists', select: 'label osuId' },
];
artistsRouter.get('/relevantInfo', async (req, res) => {
    const a = await featuredArtist_1.FeaturedArtistModel
        .find({})
        .populate(defaultPopulate)
        .sort({ label: 1 });
    res.json({ artists: a, userId: req.session?.mongoId });
});
/* POST new artist. */
artistsRouter.post('/create', async (req, res) => {
    const a = new featuredArtist_1.FeaturedArtistModel();
    a.label = req.body.name;
    await a.save();
    res.json(a);
});
/* POST toggle isContacted */
artistsRouter.post('/toggleIsContacted/:id', async (req, res) => {
    let a = await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { isContacted: req.body.value });
    a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
});
/* POST toggle isResponded */
artistsRouter.post('/toggleisResponded/:id', async (req, res) => {
    let a = await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { isResponded: req.body.value });
    a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
});
/* POST toggle tracksSelected */
artistsRouter.post('/toggleTracksSelected/:id', async (req, res) => {
    let a = await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { tracksSelected: req.body.value });
    a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
});
/* POST toggle isRejected */
artistsRouter.post('/toggleisRejected/:id', async (req, res) => {
    let a = await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { isRejected: req.body.value });
    a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
});
/* POST toggle contractSent */
artistsRouter.post('/toggleContractSent/:id', async (req, res) => {
    let a = await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { contractSent: req.body.value });
    a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
});
/* POST toggle artistSigned */
artistsRouter.post('/toggleArtistSigned/:id', async (req, res) => {
    let a = await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { artistSigned: req.body.value });
    a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
});
/* POST toggle ppyPaid */
artistsRouter.post('/togglePpyPaid/:id', async (req, res) => {
    let a = await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { ppyPaid: req.body.value });
    a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
});
/* POST toggle ppySigned */
artistsRouter.post('/togglePpySigned/:id', async (req, res) => {
    let a = await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { ppySigned: req.body.value });
    a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
});
/* POST toggle songsTimed */
artistsRouter.post('/toggleSongsTimed/:id', async (req, res) => {
    let a = await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { songsTimed: req.body.value });
    a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
});
/* POST toggle songsReceived */
artistsRouter.post('/toggleSongsReceived/:id', async (req, res) => {
    let a = await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { songsReceived: req.body.value });
    a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
});
/* POST toggle assetsReceived */
artistsRouter.post('/toggleAssetsReceived/:id', async (req, res) => {
    let a = await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { assetsReceived: req.body.value });
    a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
});
/* POST toggle hasRankedMaps */
artistsRouter.post('/toggleHasRankedMaps/:id', async (req, res) => {
    let a = await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { hasRankedMaps: req.body.value });
    a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
});
/* POST toggle isNotifiedOfRelease */
artistsRouter.post('/toggleIsNotifiedOfRelease/:id', async (req, res) => {
    let a = await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { isNotifiedOfRelease: req.body.value });
    a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
});
/* POST toggle isMinor */
artistsRouter.post('/toggleIsMinor/:id', async (req, res) => {
    let a = await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { isMinor: req.body.value });
    a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
});
/* POST toggle isGroup */
artistsRouter.post('/toggleIsGroup/:id', async (req, res) => {
    let a = await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { isGroup: req.body.value });
    a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
});
/* POST toggle isUpToDate */
artistsRouter.post('/toggleIsUpToDate/:id', async (req, res) => {
    let a = await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, {
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
    a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
});
/* POST update projectedRelease */
artistsRouter.post('/updateProjectedRelease/:id', async (req, res) => {
    let a = await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { projectedRelease: req.body.date });
    a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
});
/* POST update projectedRelease */
artistsRouter.post('/updateLastContacted/:id', async (req, res) => {
    let a = await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { lastContacted: req.body.date });
    a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
});
/* POST update notes */
artistsRouter.post('/updateNotes/:id', async (req, res) => {
    let a = await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { notes: req.body.notes });
    a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
});
/* POST update showcase mappers */
artistsRouter.post('/updateShowcaseMappers/:id', async (req, res) => {
    let a;
    if (!req.body.showcaseMappers.length) {
        await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, { showcaseMappers: [] });
        a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
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
        a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    }
    res.json({ artist: a });
});
/* POST reset progress */
artistsRouter.post('/reset/:id', async (req, res) => {
    let a = await featuredArtist_1.FeaturedArtistModel.findByIdAndUpdate(req.params.id, {
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
    a = await featuredArtist_1.FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);
    res.json(a);
});
/* POST delete artist */
artistsRouter.post('/deleteArtist/:id', async (req, res) => {
    const a = await featuredArtist_1.FeaturedArtistModel.findByIdAndRemove(req.params.id);
    res.json(a);
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
        .populate(defaultPopulate)
        .sort({ updatedAt: -1 });
    res.json(a);
});
/* POST generate OsuBeatmaps from csv file */
artistsRouter.post('/osuBeatmaps/generateFromCsv', async (req, res) => {
    if (req.session.osuId !== 3178418) {
        return res.json({ error: 'stop' });
    }
    const buffer = fs_1.default.readFileSync('osumaps.csv');
    const csv = buffer.toString();
    if (!csv) {
        return res.json(`couldn't read csv`);
    }
    res.send('test');
    const data = csv.split('\r\n');
    for (const unsplitRow of data) {
        const row = unsplitRow.split('","');
        const beatmapsetOsuId = parseInt(row[0].slice(1, row[0].length));
        const beatmapOsuId = parseInt(row[1]);
        const artist = row[18];
        const title = row[20];
        const source = row[25];
        const favourites = parseInt(row[29]);
        const playcount = parseInt(row[35]);
        console.log(artist + ' - ' + title);
        console.log(beatmapsetOsuId);
        const existingBeatmap = await osuBeatmap_1.OsuBeatmapModel
            .findOne({ artist, title });
        if (!existingBeatmap) {
            const osuBeatmap = new osuBeatmap_1.OsuBeatmapModel();
            osuBeatmap.artist = artist;
            osuBeatmap.title = title;
            osuBeatmap.beatmapsetOsuIds = [beatmapsetOsuId];
            osuBeatmap.beatmapOsuIds = [beatmapOsuId];
            osuBeatmap.favourites = favourites;
            osuBeatmap.sources = [source];
            osuBeatmap.playcount = playcount;
            osuBeatmap.isLicensed = false;
            await osuBeatmap.save();
        }
        else if (!existingBeatmap.beatmapOsuIds.includes(beatmapOsuId)) {
            existingBeatmap.beatmapOsuIds.push(beatmapOsuId);
            if (!existingBeatmap.beatmapsetOsuIds.includes(beatmapsetOsuId)) {
                existingBeatmap.beatmapsetOsuIds.push(beatmapsetOsuId);
                existingBeatmap.favourites += favourites;
            }
            if (!existingBeatmap.sources.includes(source) && source.length) {
                existingBeatmap.sources.push(source);
            }
            existingBeatmap.playcount += playcount;
            await existingBeatmap.save();
        }
    }
    const osuBeatmaps = await osuBeatmap_1.OsuBeatmapModel
        .find({})
        .sort({ playcount: -1 });
    res.json(osuBeatmaps);
});
/* GET load osu beatmaps */
artistsRouter.get('/osuBeatmaps/loadOsuBeatmaps/:limit', async (req, res) => {
    const osuBeatmaps = await osuBeatmap_1.OsuBeatmapModel
        .find({})
        .sort({ playcount: -1 })
        .populate(defaultOsuBeatmapPopulate)
        .limit(parseInt(req.params.limit));
    res.json(osuBeatmaps);
});
/* POST toggle osuBeatmap isLicensed */
artistsRouter.post('/osuBeatmaps/updateIsLicensed/:id', async (req, res) => {
    const osuBeatmap = await osuBeatmap_1.OsuBeatmapModel
        .findById(req.params.id)
        .orFail();
    const newOsuBeatmap = await osuBeatmap_1.OsuBeatmapModel
        .findByIdAndUpdate(req.params.id, { isLicensed: !osuBeatmap.isLicensed })
        .populate(defaultOsuBeatmapPopulate)
        .orFail();
    res.json(newOsuBeatmap);
});
/* POST update osuBeatmap comment */
artistsRouter.post('/osuBeatmaps/updateComment/:id', async (req, res) => {
    const newOsuBeatmap = await osuBeatmap_1.OsuBeatmapModel
        .findByIdAndUpdate(req.params.id, { comment: req.body.comment })
        .populate(defaultOsuBeatmapPopulate)
        .orFail();
    res.json(newOsuBeatmap);
});
/* POST add FA to song */
artistsRouter.post('/osuBeatmaps/addArtistToOsuBeatmap/:id', async (req, res) => {
    const newOsuBeatmap = await osuBeatmap_1.OsuBeatmapModel
        .findByIdAndUpdate(req.params.id, { $push: { featuredArtists: req.body.artistId } })
        .populate(defaultOsuBeatmapPopulate)
        .orFail();
    res.json(newOsuBeatmap);
});
/* POST remove FA from song */
artistsRouter.post('/osuBeatmaps/removeArtistFromOsuBeatmap/:id', async (req, res) => {
    const newOsuBeatmap = await osuBeatmap_1.OsuBeatmapModel
        .findByIdAndUpdate(req.params.id, { $pull: { featuredArtists: req.body.artistId } })
        .populate(defaultOsuBeatmapPopulate)
        .orFail();
    res.json(newOsuBeatmap);
});
/* POST add administrator to song */
artistsRouter.post('/osuBeatmaps/addAdministratorToOsuBeatmap/:id', async (req, res) => {
    const newOsuBeatmap = await osuBeatmap_1.OsuBeatmapModel
        .findByIdAndUpdate(req.params.id, { $push: { administrators: req.body.administrator } })
        .populate(defaultOsuBeatmapPopulate)
        .orFail();
    res.json(newOsuBeatmap);
});
/* POST remove administrator from song */
artistsRouter.post('/osuBeatmaps/removeAdministratorFromOsuBeatmap/:id', async (req, res) => {
    const newOsuBeatmap = await osuBeatmap_1.OsuBeatmapModel
        .findByIdAndUpdate(req.params.id, { $pull: { administrators: req.body.administrator } })
        .populate(defaultOsuBeatmapPopulate)
        .orFail();
    res.json(newOsuBeatmap);
});
/* POST update lastChecked */
artistsRouter.post('/osuBeatmaps/updateLastChecked/:id', async (req, res) => {
    console.log(req.body.date);
    const newOsuBeatmap = await osuBeatmap_1.OsuBeatmapModel
        .findByIdAndUpdate(req.params.id, { lastChecked: req.body.date })
        .populate(defaultOsuBeatmapPopulate)
        .orFail();
    res.json(newOsuBeatmap);
});
exports.default = artistsRouter;
