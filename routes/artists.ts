import express from 'express';
import { isAdmin, isLoggedIn } from '../helpers/middlewares';
import { FeaturedArtistService } from '../models/featuredArtist';

const artistsRouter = express.Router();

artistsRouter.use(isLoggedIn);
artistsRouter.use(isAdmin);

//population
const defaultPopulate = [
    { path: 'songs', select: 'artist title' },
    { path: 'assignedUser', select: 'username osuId' },
];

/* GET parties page. */
artistsRouter.get('/', (req, res) => {
    res.render('artists', {
        title: 'Artists',
        script: '../javascripts/artists.js',
        loggedInAs: req.session?.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});

artistsRouter.get('/relevantInfo', async (req, res) => {
    const a = await FeaturedArtistService.queryAll({
        populate: defaultPopulate,
        sort: { updatedAt: -1 },
    });

    res.json({ artists: a, userId: req.session?.mongoId });
});

/* POST new artist. */
artistsRouter.post('/create', async (req, res) => {
    const a = await FeaturedArtistService.create(req.body.name);

    res.json(a);
});

/* POST toggle isContacted */
artistsRouter.post('/toggleIsContacted/:id', async (req, res) => {
    let a = await FeaturedArtistService.update(req.params.id, { isContacted: req.body.value });
    a = await FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });

    res.json(a);
});

/* POST toggle isResponded */
artistsRouter.post('/toggleisResponded/:id', async (req, res) => {
    let a = await FeaturedArtistService.update(req.params.id, { isResponded: req.body.value });
    a = await FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });

    res.json(a);
});

/* POST toggle tracksSelected */
artistsRouter.post('/toggleTracksSelected/:id', async (req, res) => {
    let a = await FeaturedArtistService.update(req.params.id, { tracksSelected: req.body.value });
    a = await FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });

    res.json(a);
});

/* POST toggle isRejected */
artistsRouter.post('/toggleisRejected/:id', async (req, res) => {
    let a = await FeaturedArtistService.update(req.params.id, { isRejected: req.body.value });
    a = await FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });

    res.json(a);
});

/* POST toggle contractSent */
artistsRouter.post('/toggleContractSent/:id', async (req, res) => {
    let a = await FeaturedArtistService.update(req.params.id, { contractSent: req.body.value });
    a = await FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });

    res.json(a);
});

/* POST toggle contractSigned */
artistsRouter.post('/toggleContractSigned/:id', async (req, res) => {
    let a = await FeaturedArtistService.update(req.params.id, { contractSigned: req.body.value });
    a = await FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });

    res.json(a);
});

/* POST toggle contractPaid */
artistsRouter.post('/toggleContractPaid/:id', async (req, res) => {
    let a = await FeaturedArtistService.update(req.params.id, { contractPaid: req.body.value });
    a = await FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });

    res.json(a);
});

/* POST toggle songsTimed */
artistsRouter.post('/toggleSongsTimed/:id', async (req, res) => {
    let a = await FeaturedArtistService.update(req.params.id, { songsTimed: req.body.value });
    a = await FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });

    res.json(a);
});

/* POST toggle songsReceived */
artistsRouter.post('/toggleSongsReceived/:id', async (req, res) => {
    let a = await FeaturedArtistService.update(req.params.id, { songsReceived: req.body.value });
    a = await FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });

    res.json(a);
});

/* POST toggle assetsReceived */
artistsRouter.post('/toggleAssetsReceived/:id', async (req, res) => {
    let a = await FeaturedArtistService.update(req.params.id, { assetsReceived: req.body.value });
    a = await FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });

    res.json(a);
});

/* POST toggle bioWritten */
artistsRouter.post('/toggleBioWritten/:id', async (req, res) => {
    let a = await FeaturedArtistService.update(req.params.id, { bioWritten: req.body.value });
    a = await FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });

    res.json(a);
});

/* POST toggle isInvited */
artistsRouter.post('/toggleIsInvited/:id', async (req, res) => {
    let a = await FeaturedArtistService.update(req.params.id, { isInvited: req.body.value });
    a = await FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });

    res.json(a);
});

/* POST toggle isUpToDate */
artistsRouter.post('/toggleIsUpToDate/:id', async (req, res) => {
    let a = await FeaturedArtistService.update(req.params.id, {
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
    a = await FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });

    res.json(a);
});

/* POST update projectedRelease */
artistsRouter.post('/updateProjectedRelease/:id', async (req, res) => {
    let a = await FeaturedArtistService.update(req.params.id, { projectedRelease: req.body.date });
    a = await FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });

    res.json(a);
});

/* POST update projectedRelease */
artistsRouter.post('/updateLastContacted/:id', async (req, res) => {
    let a = await FeaturedArtistService.update(req.params.id, { lastContacted: req.body.date });
    a = await FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });

    res.json(a);
});

/* POST update notes */
artistsRouter.post('/updateNotes/:id', async (req, res) => {
    let a = await FeaturedArtistService.update(req.params.id, { notes: req.body.notes });
    a = await FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });

    res.json(a);
});

/* POST reset progress */
artistsRouter.post('/reset/:id', async (req, res) => {
    let a = await FeaturedArtistService.update(req.params.id, {
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
    a = await FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });

    res.json(a);
});

/* POST toggle isPriority */
artistsRouter.post('/toggleIsPriority/:id', async (req, res) => {
    let a = await FeaturedArtistService.update(req.params.id, { isPriority: req.body.value });
    a = await FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });

    res.json(a);
});

/* POST assign user */
artistsRouter.post('/assignUser/:id', async (req, res) => {
    let a = await FeaturedArtistService.update(req.params.id, { assignedUser: req.session?.mongoId });
    a = await FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });

    res.json(a);
});

/* POST un-assign user */
artistsRouter.post('/unassignUser/:id', async (req, res) => {
    let a = await FeaturedArtistService.update(req.params.id, { assignedUser: null });
    a = await FeaturedArtistService.queryById(req.params.id, { populate: defaultPopulate });

    res.json(a);
});

/* POST delete artist */
artistsRouter.post('/deleteArtist/:id', async (req, res) => {
    const a = await FeaturedArtistService.remove(req.params.id);

    res.json(a);
});

export default artistsRouter;
