import mongoose, { Schema, Model } from 'mongoose';
import { Mission } from '../../interfaces/mission';

interface MissionStatics {
    findAll (limit?: number): Promise<Mission[]>;
    defaultFindByIdOrFail (id: any): Promise<Mission>;
}

const missionSchema = new Schema<Mission>({
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
    isArtistShowcase: { type: Boolean },
    isGenreShowcase: { type: Boolean },
    isSeparate: { type: Boolean },
    remainingArtists: { type: Number },
    genreOptions: [{ type: String }],
    showcaseMissionSongs: [{
        _id: false,
        song: { type: 'ObjectId', ref: 'FeaturedSong', required: true },
        user: { type: 'ObjectId', ref: 'User', required: true },
    }],
    showcaseMissionArtists: [{
        _id: false,
        artist: { type: 'ObjectId', ref: 'FeaturedArtist', required: true },
        user: { type: 'ObjectId', ref: 'User', required: true },
    }],
    showcaseMissionSongsByGenre: [{
        _id: false,
        user: { type: 'ObjectId', ref: 'User', required: true },
        songs: [{ type: 'ObjectId', ref: 'FeaturedSong' }],
        previouslySelectedSongs: [{ type: 'ObjectId', ref: 'FeaturedSong' }],
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
    beatmapDifficulties: [{ type: String , enum: ['Easy', 'Normal', 'Hard', 'Insane', 'Expert'] }], // only requirement label, no validation
    beatmapMinimumLength: { type: Number }, // only requirement label, no validation
    beatmapMaximumLength: { type: Number }, // only requirement label, no validation
    isUniqueToRanked: { type: Boolean }, // only requirement label, no validation
    isUniqueArtistToRanked: { type: Boolean }, // only requirement label, no validation
    isOsuOriginal: { type: Boolean }, // only requirement label, no validation
    additionalRequirement: { type: String }, // only requirement label, no validation
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

missionSchema.virtual('associatedMaps', {
    ref: 'Beatmap',
    localField: '_id',
    foreignField: 'mission',
});

const queryHelpers = {
    sortByLatest(this: any) {
        return this.sort({ createdAt: -1 });
    },
    defaultPopulate(this: any) {
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
    extendedDefaultPopulate(this: any) {
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

missionSchema.statics.findAll = function (this: any, limit?: number) {
    if (!limit) limit = 10000;

    return this
        .find({})
        .defaultPopulate()
        .sortByLatest()
        .limit(limit);
};

missionSchema.statics.defaultFindByIdOrFail = function (this: any, id: any) {
    return this
        .findById(id)
        .defaultPopulate()
        .orFail();
};

const MissionModel = mongoose.model<Mission, Model<Mission, typeof queryHelpers> & MissionStatics>('Mission', missionSchema);

export { MissionModel };
