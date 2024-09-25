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
exports.MissionModel = void 0;
/* eslint-disable @typescript-eslint/no-use-before-define */
const mongoose_1 = __importStar(require("mongoose"));
const missionSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    artists: [{ type: 'ObjectId', ref: 'FeaturedArtist' }],
    status: { type: String, enum: ['open', 'closed', 'hidden'], default: 'open' },
    tier: { type: Number, required: true },
    objective: { type: String, required: true },
    deadline: { type: Date, required: true },
    winCondition: { type: String },
    openingAnnounced: { type: Boolean, default: false },
    closingAnnounced: { type: Boolean, default: false },
    winningBeatmaps: [{ type: 'ObjectId', ref: 'Beatmap' }],
    invalidBeatmaps: [{ type: 'ObjectId', ref: 'Beatmap' }],
    modes: [{ type: String, required: true }],
    isShowcaseMission: { type: Boolean },
    isSeparate: { type: Boolean },
    showcaseMissionSongs: [{
            _id: false,
            song: { type: 'ObjectId', ref: 'FeaturedSong', required: true },
            user: { type: 'ObjectId', ref: 'User', required: true },
        }],
    /* user requirements. optional and growing */
    userMaximumRankedBeatmapsCount: { type: Number },
    userMaximumGlobalRank: { type: Number },
    userMaximumPp: { type: Number },
    userMinimumPp: { type: Number },
    userMinimumRank: { type: Number },
    /* beatmap requirements. optional and growing */
    beatmapEarliestSubmissionDate: { type: Date },
    beatmapLatestSubmissionDate: { type: Date },
    beatmapMinimumFavorites: { type: Number },
    beatmapMinimumPlayCount: { type: Number },
    beatmapMinimumLength: { type: Number },
    isUniqueToRanked: { type: Boolean }, // only requirement label, no validation
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
missionSchema.virtual('associatedMaps', {
    ref: 'Beatmap',
    localField: '_id',
    foreignField: 'mission',
});
const queryHelpers = {
    sortByLatest() {
        return this.sort({ createdAt: -1 });
    },
    defaultPopulate() {
        return this.populate([
            { path: 'artists', select: 'label osuId' },
            {
                path: 'associatedMaps',
                populate: {
                    path: 'song host',
                },
            },
            {
                path: 'winningBeatmaps',
                populate: {
                    path: 'song host',
                },
            },
            {
                path: 'invalidBeatmaps',
                select: 'id',
            },
        ]);
    },
    extendedDefaultPopulate() {
        return this.populate([
            { path: 'artists', select: 'label osuId' },
            {
                path: 'associatedMaps',
                populate: {
                    path: 'song host tasks',
                    populate: {
                        path: 'mappers',
                    },
                },
            },
            {
                path: 'winningBeatmaps',
                populate: {
                    path: 'song host tasks',
                    populate: {
                        path: 'mappers',
                    },
                },
            },
            {
                path: 'invalidBeatmaps',
                select: 'id',
            },
        ]);
    },
};
missionSchema.query = queryHelpers;
missionSchema.statics.findAll = function (limit) {
    if (!limit)
        limit = 10000;
    return this
        .find({})
        .defaultPopulate()
        .sortByLatest()
        .limit(limit);
};
missionSchema.statics.defaultFindByIdOrFail = function (id) {
    return this
        .findById(id)
        .defaultPopulate()
        .orFail();
};
const MissionModel = mongoose_1.default.model('Mission', missionSchema);
exports.MissionModel = MissionModel;
