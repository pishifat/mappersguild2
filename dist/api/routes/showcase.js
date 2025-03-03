"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const featuredArtist_1 = require("../models/featuredArtist");
const featuredArtist_2 = require("../../interfaces/featuredArtist");
const user_1 = require("../../interfaces/user");
const middlewares_1 = require("../helpers/middlewares");
const discordApi_1 = require("../helpers/discordApi");
const featuredSong_1 = require("../models/featuredSong");
const showcaseRouter = express_1.default.Router();
showcaseRouter.use(middlewares_1.isLoggedIn);
/* GET info for page load */
showcaseRouter.get('/relevantInfo', middlewares_1.isShowcase, async (req, res) => {
    let query = { status: featuredArtist_2.FeaturedArtistStatus.Showcase };
    // show all artists if admin or secret usergroup
    const showAllShowcaseArtists = res.locals.userRequest.group == user_1.UserGroup.Admin || res.locals.userRequest.group == user_1.UserGroup.Secret;
    if (showAllShowcaseArtists) {
        query = {
            $or: [
                { offeredUsers: { $in: req.session.mongoId } },
                { showcaseMappers: { $in: req.session.mongoId } },
                { status: featuredArtist_2.FeaturedArtistStatus.Showcase },
            ],
            status: { $ne: featuredArtist_2.FeaturedArtistStatus.Public },
        };
    }
    else {
        query = {
            $or: [
                { offeredUsers: { $in: req.session.mongoId } },
                { showcaseMappers: { $in: req.session.mongoId } },
            ],
            status: { $ne: featuredArtist_2.FeaturedArtistStatus.Public },
        };
    }
    const artists = await featuredArtist_1.FeaturedArtistModel
        .find(query)
        .defaultPopulateWithSongs()
        .sort({ label: 1 });
    res.json({
        artists,
    });
});
/* POST add showcase mapper */
showcaseRouter.post('/addShowcaseMapper/:id', async (req, res) => {
    let artist = await featuredArtist_1.FeaturedArtistModel
        .findById(req.params.id)
        .defaultPopulateWithSongs()
        .orFail();
    const mapperIds = artist.showcaseMappers.map(u => u.id);
    if (mapperIds.includes(req.session.mongoId)) {
        return res.json({ error: 'Already marked' });
    }
    artist.showcaseMappers.push(req.session.mongoId);
    await artist.save();
    artist = await featuredArtist_1.FeaturedArtistModel
        .findById(req.params.id)
        .defaultPopulateWithSongs()
        .orFail();
    res.json(artist);
    discordApi_1.devWebhookPost([{
            author: {
                name: `${res.locals.userRequest.username}`,
                url: `https://osu.ppy.sh/users/${res.locals.userRequest.osuId}`,
                icon_url: `https://a.ppy.sh/${res.locals.userRequest.osuId}`,
            },
            color: discordApi_1.webhookColors.lightGreen,
            description: `Added interest in **artist:** [**${artist.label}**](https://mappersguild.com/artists)`,
        }]);
});
/* POST remove showcase mapper */
showcaseRouter.post('/removeShowcaseMapper/:id', async (req, res) => {
    let artist = await featuredArtist_1.FeaturedArtistModel
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
                const newSong = await featuredSong_1.FeaturedSongModel
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
    artist = await featuredArtist_1.FeaturedArtistModel
        .findById(req.params.id)
        .defaultPopulateWithSongs()
        .orFail();
    res.json(artist);
    discordApi_1.devWebhookPost([{
            author: {
                name: `${res.locals.userRequest.username}`,
                url: `https://osu.ppy.sh/users/${res.locals.userRequest.osuId}`,
                icon_url: `https://a.ppy.sh/${res.locals.userRequest.osuId}`,
            },
            color: discordApi_1.webhookColors.lightRed,
            description: `Removed interest in **artist:** [**${artist.label}**](https://mappersguild.com/artists)`,
        }]);
});
/* POST add song showcase mapper */
showcaseRouter.post('/addSongShowcaseMapper/:artistId/:songId', async (req, res) => {
    const [artist, song] = await Promise.all([
        featuredArtist_1.FeaturedArtistModel
            .findById(req.params.artistId)
            .defaultPopulateWithSongs()
            .orFail(),
        featuredSong_1.FeaturedSongModel
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
    const newArtist = await featuredArtist_1.FeaturedArtistModel
        .findById(req.params.artistId)
        .defaultPopulateWithSongs()
        .orFail();
    res.json(newArtist);
    discordApi_1.devWebhookPost([{
            author: {
                name: res.locals.userRequest.username,
                url: `https://osu.ppy.sh/users/${res.locals.userRequest.osuId}`,
                icon_url: `https://a.ppy.sh/${res.locals.userRequest.osuId}`,
            },
            color: discordApi_1.webhookColors.lightGreen,
            description: `Added interest in **song:** [**${song.artist} - ${song.title}**](https://mappersguild.com/artists)`,
        }]);
});
/* POST remove song showcase mapper */
showcaseRouter.post('/removeSongShowcaseMapper/:artistId/:songId', async (req, res) => {
    const song = await featuredSong_1.FeaturedSongModel
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
    const artist = await featuredArtist_1.FeaturedArtistModel
        .findById(req.params.artistId)
        .defaultPopulateWithSongs()
        .orFail();
    res.json(artist);
    discordApi_1.devWebhookPost([{
            author: {
                name: `${res.locals.userRequest.username}`,
                url: `https://osu.ppy.sh/users/${res.locals.userRequest.osuId}`,
                icon_url: `https://a.ppy.sh/${res.locals.userRequest.osuId}`,
            },
            color: discordApi_1.webhookColors.lightRed,
            description: `Removed interest in **song:** [**${song.artist} - ${song.title}**](https://mappersguild.com/artists)`,
        }]);
});
exports.default = showcaseRouter;
