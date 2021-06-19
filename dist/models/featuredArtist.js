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
    showcaseMappers: [{ type: 'ObjectId', ref: 'User' }],
    isContacted: { type: Boolean },
    isResponded: { type: Boolean },
    tracksSelected: { type: Boolean },
    isRejected: { type: Boolean },
    contractSent: { type: Boolean },
    artistSigned: { type: Boolean },
    ppyPaid: { type: Boolean },
    ppySigned: { type: Boolean },
    projectedRelease: { type: Date },
    songsTimed: { type: Boolean },
    songsReceived: { type: Boolean },
    assetsReceived: { type: Boolean },
    isUpToDate: { type: Boolean },
    hasRankedMaps: { type: Boolean },
    isMinor: { type: Boolean },
    isGroup: { type: Boolean },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
const FeaturedArtistModel = mongoose_1.default.model('FeaturedArtist', featuredArtistSchema);
exports.FeaturedArtistModel = FeaturedArtistModel;
