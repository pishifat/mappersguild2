import express from 'express';
import { isAdmin, isLoggedIn, isSuperAdmin } from '../helpers/middlewares';
import { FeaturedArtistModel } from '../models/featuredArtist';
import { OsuBeatmapModel } from '../models/osuBeatmap';
import { UserModel } from '../models/user';
import { User } from '../../interfaces/user';
import fs from 'fs';

const artistsRouter = express.Router();

artistsRouter.use(isLoggedIn);
artistsRouter.use(isAdmin);
artistsRouter.use(isSuperAdmin);


// population
const defaultOsuBeatmapPopulate = [
    { path: 'featuredArtists', select: 'label osuId' },
];

/* GET mostly relevant artists */
artistsRouter.get('/loadArtists', async (req, res) => {
    res.json(await FeaturedArtistModel
        .find({
            isContacted: true,
            isResponded: true,
            isRejected: { $ne: true },
        })
        .defaultPopulate()
    );
});

/* GET the rest of them */
artistsRouter.get('/loadOtherArtists', async (req, res) => {
    res.json(await FeaturedArtistModel
        .find({
            $or: [
                { isContacted: { $ne: true } },
                { isResponded: { $ne: true } },
                { isRejected: true },
            ],
        })
        .defaultPopulate()
    );
});

/* POST new artist. */
artistsRouter.post('/create', async (req, res) => {
    const { name, comment, isContacted, isResponded } = req.body;

    const exists = await FeaturedArtistModel.findOne({ label: name.trim() });

    if (exists) {
        return res.json({ error: 'already exists' });
    }

    const a = new FeaturedArtistModel();

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

    await a.save();

    res.json(a);
});

/* POST toggle isContacted */
artistsRouter.post('/toggleIsContacted/:id', async (req, res) => {
    res.json(await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { isContacted: req.body.value }).defaultPopulate());
});

/* POST toggle isResponded */
artistsRouter.post('/toggleisResponded/:id', async (req, res) => {
    res.json(await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { isResponded: req.body.value }).defaultPopulate());
});

/* POST toggle isRejected */
artistsRouter.post('/toggleisRejected/:id', async (req, res) => {
    res.json(await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { isRejected: req.body.value }).defaultPopulate());
});

/* POST toggle contractSent */
artistsRouter.post('/toggleContractSent/:id', async (req, res) => {
    res.json(await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { contractSent: req.body.value }).defaultPopulate());
});

/* POST toggle artistSigned */
artistsRouter.post('/toggleArtistSigned/:id', async (req, res) => {
    res.json(await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { artistSigned: req.body.value }).defaultPopulate());
});

/* POST toggle ppyPaid */
artistsRouter.post('/togglePpyPaid/:id', async (req, res) => {
    res.json(await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { ppyPaid: req.body.value }).defaultPopulate());
});

/* POST toggle ppySigned */
artistsRouter.post('/togglePpySigned/:id', async (req, res) => {
    res.json(await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { ppySigned: req.body.value }).defaultPopulate());
});

/* POST toggle songsTimed */
artistsRouter.post('/toggleSongsTimed/:id', async (req, res) => {
    res.json(await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { songsTimed: req.body.value }).defaultPopulate());
});

/* POST toggle songsReceived */
artistsRouter.post('/toggleSongsReceived/:id', async (req, res) => {
    res.json(await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { songsReceived: req.body.value }).defaultPopulate());
});

/* POST toggle assetsReceived */
artistsRouter.post('/toggleAssetsReceived/:id', async (req, res) => {
    res.json(await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { assetsReceived: req.body.value }).defaultPopulate());
});

/* POST toggle hasRankedMaps */
artistsRouter.post('/toggleHasRankedMaps/:id', async (req, res) => {
    res.json(await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { hasRankedMaps: req.body.value }).defaultPopulate());
});

/* POST toggle isCommission */
artistsRouter.post('/toggleIsCommission/:id', async (req, res) => {
    res.json(await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { isCommission: req.body.value }).defaultPopulate());
});

/* POST toggle hasNewSongs */
artistsRouter.post('/toggleHasNewSongs/:id', async (req, res) => {
    res.json(await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { hasNewSongs: req.body.value }).defaultPopulate());
});

/* POST toggle isUpToDate */
artistsRouter.post('/toggleIsUpToDate/:id', async (req, res) => {
    let a = await FeaturedArtistModel.findById(req.params.id).orFail();

    if (!req.body.value && !a.isCommission && !a?.hasNewSongs) {
        return res.json({ error: `Can't be not-up-to-date without commission or pending songs!` });
    }

    a = await FeaturedArtistModel
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
    res.json(await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { projectedRelease: req.body.date }).defaultPopulate());
});

/* POST update projectedRelease */
artistsRouter.post('/updateLastContacted/:id', async (req, res) => {
    res.json(await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { lastContacted: req.body.date }).defaultPopulate());
});

/* POST update notes */
artistsRouter.post('/updateNotes/:id', async (req, res) => {
    res.json(await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { notes: req.body.notes }).defaultPopulate());
});

/* POST update showcase mappers */
artistsRouter.post('/updateShowcaseMappers/:id', async (req, res) => {
    let a;

    if (!req.body.showcaseMappers.length) {
        await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { showcaseMappers: [] });
        a = await FeaturedArtistModel.findById(req.params.id).defaultPopulate();
    } else {
        const usersSplit: string[] = req.body.showcaseMappers.split(',');

        const userIds: User['_id'] = [];

        for (const u of usersSplit) {
            const user = await UserModel
                .findOne()
                .byUsernameOrOsuId(u);

            if (!user) {
                return res.json({ error: `Cannot find ${u}!` });
            } else {
                userIds.push(user._id);
            }
        }

        await FeaturedArtistModel.findByIdAndUpdate(req.params.id, { showcaseMappers: userIds });
        a = await FeaturedArtistModel.findById(req.params.id).defaultPopulate();
    }

    res.json({ artist: a });
});

/* POST reset progress */
artistsRouter.post('/reset/:id', async (req, res) => {
    res.json(await FeaturedArtistModel.findByIdAndUpdate(req.params.id, {
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
    res.json(await FeaturedArtistModel.findByIdAndRemove(req.params.id));
});

/* POST set all contacted but unreplied artists as rejected */
artistsRouter.post('/setAllAsRejected/', async (req, res) => {
    const contactedArtists = await FeaturedArtistModel
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

    const a = await FeaturedArtistModel
        .find({})
        .defaultPopulate();

    res.json(a);
});

/* POST generate OsuBeatmaps from csv file */
artistsRouter.post('/osuBeatmaps/generateFromCsv', async (req, res) => {
    if (req.session.osuId !== 3178418) {
        return res.json({ error: 'stop' });
    }

    const buffer = fs.readFileSync('osumaps.csv');
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

        const existingBeatmap = await OsuBeatmapModel
            .findOne({ artist, title });

        if (!existingBeatmap) {
            const osuBeatmap = new OsuBeatmapModel();

            osuBeatmap.artist = artist;
            osuBeatmap.title = title;
            osuBeatmap.beatmapsetOsuIds = [beatmapsetOsuId];
            osuBeatmap.beatmapOsuIds = [beatmapOsuId];
            osuBeatmap.favourites = favourites;
            osuBeatmap.sources = [source];
            osuBeatmap.playcount = playcount;
            osuBeatmap.isLicensed = false;

            await osuBeatmap.save();
        } else if (!existingBeatmap.beatmapOsuIds.includes(beatmapOsuId)) {
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

    const osuBeatmaps = await OsuBeatmapModel
        .find({})
        .sort({ playcount: -1 });

    res.json(osuBeatmaps);
});

/* GET load osu beatmaps */
artistsRouter.get('/osuBeatmaps/loadOsuBeatmaps/:limit', async (req, res) => {
    const osuBeatmaps = await OsuBeatmapModel
        .find({})
        .sort({ playcount: -1 })
        .populate(defaultOsuBeatmapPopulate)
        .limit(parseInt(req.params.limit));

    res.json(osuBeatmaps);
});

/* POST toggle osuBeatmap isLicensed */
artistsRouter.post('/osuBeatmaps/updateIsLicensed/:id', async (req, res) => {
    const osuBeatmap = await OsuBeatmapModel
        .findById(req.params.id)
        .orFail();

    res.json(await OsuBeatmapModel
        .findByIdAndUpdate(req.params.id, { isLicensed: !osuBeatmap.isLicensed })
        .populate(defaultOsuBeatmapPopulate)
        .orFail());
});

/* POST update osuBeatmap comment */
artistsRouter.post('/osuBeatmaps/updateComment/:id', async (req, res) => {
    res.json(await OsuBeatmapModel
        .findByIdAndUpdate(req.params.id, { comment: req.body.comment })
        .populate(defaultOsuBeatmapPopulate)
        .orFail()
    );
});

/* POST add FA to song */
artistsRouter.post('/osuBeatmaps/addArtistToOsuBeatmap/:id', async (req, res) => {
    res.json(await OsuBeatmapModel
        .findByIdAndUpdate(req.params.id, { $push: { featuredArtists: req.body.artistId } })
        .populate(defaultOsuBeatmapPopulate)
        .orFail()
    );
});

/* POST remove FA from song */
artistsRouter.post('/osuBeatmaps/removeArtistFromOsuBeatmap/:id', async (req, res) => {
    res.json(await OsuBeatmapModel
        .findByIdAndUpdate(req.params.id, { $pull: { featuredArtists: req.body.artistId } })
        .populate(defaultOsuBeatmapPopulate)
        .orFail()
    );
});

/* POST add administrator to song */
artistsRouter.post('/osuBeatmaps/addAdministratorToOsuBeatmap/:id', async (req, res) => {
    res.json(await OsuBeatmapModel
        .findByIdAndUpdate(req.params.id, { $push: { administrators: req.body.administrator } })
        .populate(defaultOsuBeatmapPopulate)
        .orFail()
    );
});

/* POST remove administrator from song */
artistsRouter.post('/osuBeatmaps/removeAdministratorFromOsuBeatmap/:id', async (req, res) => {
    res.json(await OsuBeatmapModel
        .findByIdAndUpdate(req.params.id, { $pull: { administrators: req.body.administrator } })
        .populate(defaultOsuBeatmapPopulate)
        .orFail()
    );
});

/* POST update lastChecked */
artistsRouter.post('/osuBeatmaps/updateLastChecked/:id', async (req, res) => {
    res.json(await OsuBeatmapModel
        .findByIdAndUpdate(req.params.id, { lastChecked: req.body.date })
        .populate(defaultOsuBeatmapPopulate)
        .orFail()
    );
});

export default artistsRouter;
