"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const featuredArtist_1 = require("../../models/featuredArtist");
const featuredArtist_2 = require("../../../interfaces/featuredArtist");
const middlewares_1 = require("../../helpers/middlewares");
const featuredArtistsRouter = express_1.default.Router();
featuredArtistsRouter.use(middlewares_1.isLoggedIn);
/* GET artists for new map entry */
featuredArtistsRouter.get('/', async (req, res) => {
    const featuredArtists = await featuredArtist_1.FeaturedArtistModel.find({ $or: [{ status: featuredArtist_2.FeaturedArtistStatus.Public }, { status: featuredArtist_2.FeaturedArtistStatus.Playlist }] });
    res.json(featuredArtists);
});
/* GET songs for new map entry */
featuredArtistsRouter.get('/:id/songs', async (req, res) => {
    const fa = await featuredArtist_1.FeaturedArtistModel
        .findOne({ _id: req.params.id, $or: [{ status: featuredArtist_2.FeaturedArtistStatus.Public }, { status: featuredArtist_2.FeaturedArtistStatus.Playlist }] })
        .populate({ path: 'songs', select: 'artist title' })
        .sort({ label: -1 })
        .orFail();
    res.json(fa.songs);
});
exports.default = featuredArtistsRouter;
