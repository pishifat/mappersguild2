import express from 'express';
import { FeaturedArtistModel } from '../models/featuredArtist';
import { FeaturedArtistStatus } from '../../interfaces/featuredArtist';
import { UserGroup } from '../../interfaces/user';
import { isLoggedIn, canEditArtist, isShowcase } from '../helpers/middlewares';
import { devWebhookPost, webhookColors } from '../helpers/discordApi';
import { FeaturedSongModel } from '../models/featuredSong';

const showcaseRouter = express.Router();

showcaseRouter.use(isLoggedIn);
showcaseRouter.use(isShowcase);

/* GET info for page load */
showcaseRouter.get('/relevantInfo', async (req, res) => {
    let query: any = { status: FeaturedArtistStatus.Showcase };

    // show all artists if admin or secret usergroup
    const showAllShowcaseArtists = res.locals.userRequest.group == UserGroup.Admin || res.locals.userRequest.group == UserGroup.Secret;

    if (showAllShowcaseArtists) {
        query = {
            $or: [
                { offeredUsers: { $in: req.session.mongoId } },
                { showcaseMappers: { $in: req.session.mongoId } },
                { status: FeaturedArtistStatus.Showcase },
            ],
            status: { $ne: FeaturedArtistStatus.Public },
        };
    } else {
        query = {
            $or: [
                { offeredUsers: { $in: req.session.mongoId } },
                { showcaseMappers: { $in: req.session.mongoId } },
            ],
            status: { $ne: FeaturedArtistStatus.Public },
        };
    }

    const artists = await FeaturedArtistModel
        .find(query)
        .defaultPopulateWithSongs()
        .sort({ label: 1 });

    res.json({
        artists,
    });
});

/* POST add showcase mapper */
showcaseRouter.post('/addShowcaseMapper/:id', canEditArtist, async (req, res) => {
    let artist = await FeaturedArtistModel
        .findById(req.params.id)
        .defaultPopulateWithSongs()
        .orFail();

    const mapperIds = artist.showcaseMappers.map(u => u.id);

    if (mapperIds.includes(req.session.mongoId)) {
        return res.json({ error: 'Already marked' });
    }

    artist.showcaseMappers.push(req.session.mongoId);
    await artist.save();

    artist = await FeaturedArtistModel
        .findById(req.params.id)
        .defaultPopulateWithSongs()
        .orFail();

    res.json(artist);

    devWebhookPost([{
        author: {
            name: `${res.locals.userRequest.username}`,
            url: `https://osu.ppy.sh/users/${res.locals.userRequest.osuId}`,
            icon_url: `https://a.ppy.sh/${res.locals.userRequest.osuId}`,
        },
        color: webhookColors.lightGreen,
        description: `Added interest in **artist:** [**${artist.label}**](https://mappersguild.com/artists)`,
    }]);
});

/* POST remove showcase mapper */
showcaseRouter.post('/removeShowcaseMapper/:id', canEditArtist, async (req, res) => {
    let artist = await FeaturedArtistModel
        .findById(req.params.id)
        .defaultPopulateWithSongs()
        .orFail();

    const mapperIds = artist.showcaseMappers.map(u => u.id);
    const i = mapperIds.indexOf(req.session.mongoId);

    if (i == -1) {
        return res.json({ error: 'User not in showcase mapper list' });
    }

    for (const song of artist.songs) {
        if (song.songShowcaseMappers && song.songShowcaseMappers.length) {
            const songShowcaseMapperIds = song.songShowcaseMappers.map(u => u.id);

            const userIndex = songShowcaseMapperIds.indexOf(req.session.mongoId);

            if (userIndex >= 0) {
                const newSong = await FeaturedSongModel
                    .findById(song.id)
                    .defaultPopulate()
                    .orFail();

                newSong.songShowcaseMappers.splice(userIndex, 1);
                await newSong.save();
            }
        }
    }

    artist.showcaseMappers.splice(i, 1);
    await artist.save();

    artist = await FeaturedArtistModel
        .findById(req.params.id)
        .defaultPopulateWithSongs()
        .orFail();

    res.json(artist);

    devWebhookPost([{
        author: {
            name: `${res.locals.userRequest.username}`,
            url: `https://osu.ppy.sh/users/${res.locals.userRequest.osuId}`,
            icon_url: `https://a.ppy.sh/${res.locals.userRequest.osuId}`,
        },
        color: webhookColors.lightRed,
        description: `Removed interest in **artist:** [**${artist.label}**](https://mappersguild.com/artists)`,
    }]);
});

/* POST add song showcase mapper */
showcaseRouter.post('/addSongShowcaseMapper/:artistId/:songId', canEditArtist, async (req, res) => {
    const [artist, song] = await Promise.all([
        FeaturedArtistModel
            .findById(req.params.artistId)
            .defaultPopulateWithSongs()
            .orFail(),
        FeaturedSongModel
            .findById(req.params.songId)
            .defaultPopulate()
            .orFail(),
    ]);

    const showcaseMapperIds = artist.showcaseMappers.map(u => u.id);

    if (!showcaseMapperIds.includes(req.session.mongoId)) {
        return res.json({ error: 'Not marked as interested in artist' });
    }

    const songShowcaseMapperIds = song.songShowcaseMappers.map(u => u.id);

    if (songShowcaseMapperIds.includes(req.session.mongoId)) {
        return res.json({ error: 'Already marked for song. Try refreshing!' });
    }

    song.songShowcaseMappers.push(req.session.mongoId);
    await song.save();

    const newArtist = await FeaturedArtistModel
        .findById(req.params.artistId)
        .defaultPopulateWithSongs()
        .orFail();

    res.json(newArtist);

    devWebhookPost([{
        author: {
            name: res.locals.userRequest.username,
            url: `https://osu.ppy.sh/users/${res.locals.userRequest.osuId}`,
            icon_url: `https://a.ppy.sh/${res.locals.userRequest.osuId}`,
        },
        color: webhookColors.lightGreen,
        description: `Added interest in **song:** [**${song.artist} - ${song.title}**](https://mappersguild.com/artists)`,
    }]);
});

/* POST remove song showcase mapper */
showcaseRouter.post('/removeSongShowcaseMapper/:artistId/:songId', canEditArtist, async (req, res) => {
    const song = await FeaturedSongModel
        .findById(req.params.songId)
        .defaultPopulate()
        .orFail();

    const songShowcaseMapperIds = song.songShowcaseMappers.map(u => u.id);
    const i = songShowcaseMapperIds.indexOf(req.session.mongoId);

    if (i == -1) {
        return res.json({ error: 'Not marked for song. Try refreshing!' });
    }

    song.songShowcaseMappers.splice(i, 1);
    await song.save();

    const artist = await FeaturedArtistModel
        .findById(req.params.artistId)
        .defaultPopulateWithSongs()
        .orFail();

    res.json(artist);

    devWebhookPost([{
        author: {
            name: `${res.locals.userRequest.username}`,
            url: `https://osu.ppy.sh/users/${res.locals.userRequest.osuId}`,
            icon_url: `https://a.ppy.sh/${res.locals.userRequest.osuId}`,
        },
        color: webhookColors.lightRed,
        description: `Removed interest in **song:** [**${song.artist} - ${song.title}**](https://mappersguild.com/artists)`,
    }]);
});

export default showcaseRouter;
