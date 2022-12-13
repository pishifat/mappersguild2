"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeaturedArtistModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const featuredArtistSchema = new mongoose_1.Schema({
    label: { type: String, required: true },
    osuId: { type: Number },
    status: { type: String, enum: ['public', 'private', 'showcase'], default: 'private' },
    songs: [{ type: 'ObjectId', ref: 'FeaturedSong' }],
    lastContacted: { type: Date },
    notes: { type: String },
    // discussion
    isContacted: { type: Boolean },
    isResponded: { type: Boolean },
    tracksSelected: { type: Boolean },
    isRejected: { type: Boolean },
    // contract
    contractSent: { type: Boolean },
    artistSigned: { type: Boolean },
    ppyPaid: { type: Boolean },
    ppySigned: { type: Boolean },
    // publication
    projectedRelease: { type: Date },
    isNotifiedOfRelease: { type: Boolean },
    songsTimed: { type: Boolean },
    songsReceived: { type: Boolean },
    assetsReceived: { type: Boolean },
    isUpToDate: { type: Boolean },
    // other
    hasRankedMaps: { type: Boolean },
    isMinor: { type: Boolean },
    isMonstercat: { type: Boolean },
    // showcase mappers
    referenceUrl: { type: String },
    oszTemplatesUrl: { type: String },
    showcaseMappers: [{ type: 'ObjectId', ref: 'User' }],
    offeredUsers: [{ type: 'ObjectId', ref: 'User' }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
const queryHelpers = {
    defaultPopulate() {
        return this.populate([
            { path: 'songs', select: 'artist title' },
            { path: 'showcaseMappers', select: 'username osuId' },
            { path: 'offeredUsers', select: 'username osuId' },
            {
                path: 'songs',
                populate: {
                    path: 'songShowcaseMappers',
                    select: '_id osuId username',
                },
            },
        ]);
    },
};
featuredArtistSchema.query = queryHelpers;
const FeaturedArtistModel = mongoose_1.default.model('FeaturedArtist', featuredArtistSchema);
exports.FeaturedArtistModel = FeaturedArtistModel;
