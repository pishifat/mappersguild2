import express from 'express';
import { isAdmin, isLoggedIn } from '../helpers/middlewares';
import { FeaturedArtistModel } from '../models/featuredArtist';

const artistsRouter = express.Router();

artistsRouter.use(isLoggedIn);
artistsRouter.use(isAdmin);

// population
const defaultPopulate = [
    { path: 'songs', select: 'artist title' },
    { path: 'assignedUser', select: 'username osuId' },
];

/* GET parties page. */
artistsRouter.get('/', (req, res) => {
    res.render('artists', {
        title: 'Artists',
        script: 'artists.js',
        loggedInAs: req.session?.osuId,
        userMongoId: req.session?.mongoId,
        pointsInfo: res.locals.userRequest.pointsInfo,
    });
});

artistsRouter.get('/relevantInfo', async (req, res) => {
    const a = await FeaturedArtistModel
        .find({})
        .populate(defaultPopulate)
        .sort({ updatedAt: -1 });

    res.json({ artists: a, userId: req.session?.mongoId });
});

/* POST new artist. */
artistsRouter.post('/create', async (req, res) => {
    const a = new FeaturedArtistModel();
    a.label = req.body.name;
    await a.save();

    res.json(a);
});

/* POST toggle isContacted */
artistsRouter.post('/toggleIsContacted/:id', async (req, res) => {
    let a = await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { isContacted: req.body.value });
    a = await FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);

    res.json(a);
});

/* POST toggle isResponded */
artistsRouter.post('/toggleisResponded/:id', async (req, res) => {
    let a = await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { isResponded: req.body.value });
    a = await FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);

    res.json(a);
});

/* POST toggle tracksSelected */
artistsRouter.post('/toggleTracksSelected/:id', async (req, res) => {
    let a = await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { tracksSelected: req.body.value });
    a = await FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);

    res.json(a);
});

/* POST toggle isRejected */
artistsRouter.post('/toggleisRejected/:id', async (req, res) => {
    let a = await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { isRejected: req.body.value });
    a = await FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);

    res.json(a);
});

/* POST toggle isDenied */
artistsRouter.post('/toggleIsDenied/:id', async (req, res) => {
    let a = await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { isDenied: req.body.value });
    a = await FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);

    res.json(a);
});

/* POST toggle contractSent */
artistsRouter.post('/toggleContractSent/:id', async (req, res) => {
    let a = await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { contractSent: req.body.value });
    a = await FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);

    res.json(a);
});

/* POST toggle contractSigned */
artistsRouter.post('/toggleContractSigned/:id', async (req, res) => {
    let a = await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { contractSigned: req.body.value });
    a = await FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);

    res.json(a);
});

/* POST toggle contractPaid */
artistsRouter.post('/toggleContractPaid/:id', async (req, res) => {
    let a = await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { contractPaid: req.body.value });
    a = await FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);

    res.json(a);
});

/* POST toggle songsTimed */
artistsRouter.post('/toggleSongsTimed/:id', async (req, res) => {
    let a = await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { songsTimed: req.body.value });
    a = await FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);

    res.json(a);
});

/* POST toggle songsReceived */
artistsRouter.post('/toggleSongsReceived/:id', async (req, res) => {
    let a = await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { songsReceived: req.body.value });
    a = await FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);

    res.json(a);
});

/* POST toggle assetsReceived */
artistsRouter.post('/toggleAssetsReceived/:id', async (req, res) => {
    let a = await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { assetsReceived: req.body.value });
    a = await FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);

    res.json(a);
});

/* POST toggle bioWritten */
artistsRouter.post('/toggleBioWritten/:id', async (req, res) => {
    let a = await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { bioWritten: req.body.value });
    a = await FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);

    res.json(a);
});

/* POST toggle isInvited */
artistsRouter.post('/toggleIsInvited/:id', async (req, res) => {
    let a = await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { isInvited: req.body.value });
    a = await FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);

    res.json(a);
});

/* POST toggle isUpToDate */
artistsRouter.post('/toggleIsUpToDate/:id', async (req, res) => {
    let a = await FeaturedArtistModel.findByIdAndUpdate(req.params.id, {
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
        projectedRelease: undefined,
    });
    a = await FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);

    res.json(a);
});

/* POST update projectedRelease */
artistsRouter.post('/updateProjectedRelease/:id', async (req, res) => {
    let a = await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { projectedRelease: req.body.date });
    a = await FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);

    res.json(a);
});

/* POST update projectedRelease */
artistsRouter.post('/updateLastContacted/:id', async (req, res) => {
    let a = await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { lastContacted: req.body.date });
    a = await FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);

    res.json(a);
});

/* POST update notes */
artistsRouter.post('/updateNotes/:id', async (req, res) => {
    let a = await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { notes: req.body.notes });
    a = await FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);

    res.json(a);
});

/* POST reset progress */
artistsRouter.post('/reset/:id', async (req, res) => {
    let a = await FeaturedArtistModel.findByIdAndUpdate(req.params.id, {
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
    a = await FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);

    res.json(a);
});

/* POST toggle isPriority */
artistsRouter.post('/toggleIsPriority/:id', async (req, res) => {
    let a = await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { isPriority: req.body.value });
    a = await FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);

    res.json(a);
});

/* POST assign user */
artistsRouter.post('/assignUser/:id', async (req, res) => {
    let a = await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { assignedUser: req.session?.mongoId });
    a = await FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);

    res.json(a);
});

/* POST un-assign user */
artistsRouter.post('/unassignUser/:id', async (req, res) => {
    let a = await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { assignedUser: undefined });
    a = await FeaturedArtistModel.findById(req.params.id).populate(defaultPopulate);

    res.json(a);
});

/* POST delete artist */
artistsRouter.post('/deleteArtist/:id', async (req, res) => {
    const a = await FeaturedArtistModel.findByIdAndRemove(req.params.id);

    res.json(a);
});

export default artistsRouter;
