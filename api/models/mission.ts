/* eslint-disable @typescript-eslint/no-use-before-define */
import mongoose, { Schema, Model, DocumentQuery } from 'mongoose';
import { Mission } from '../../interfaces/mission';

interface MissionStatics extends Model<Mission, typeof queryHelpers> {
    findAll (limit?: number): Promise<Mission[]>;
    defaultFindByIdOrFail (id: any): Promise<Mission>;
}

const missionSchema = new Schema<Mission, MissionStatics>({
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
    beatmapMinimumLength: { type: Number }, // only requirement label, no validation
    isUniqueToRanked: { type: Boolean }, // only requirement label, no validation
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

missionSchema.virtual('associatedMaps', {
    ref: 'Beatmap',
    localField: '_id',
    foreignField: 'mission',
});

const queryHelpers = {
    sortByLatest<Q extends DocumentQuery<any, Mission>>(this: Q) {
        return this.sort({ createdAt: -1 });
    },
    defaultPopulate<Q extends DocumentQuery<any, Mission>>(this: Q) {
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
    extendedDefaultPopulate<Q extends DocumentQuery<any, Mission>>(this: Q) {
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

missionSchema.statics.findAll = function (this: MissionStatics, limit?: number) {
    if (!limit) limit = 10000;

    return this
        .find({})
        .defaultPopulate()
        .sortByLatest()
        .limit(limit);
};

missionSchema.statics.defaultFindByIdOrFail = function (this: MissionStatics, id: any) {
    return this
        .findById(id)
        .defaultPopulate()
        .orFail();
};

const MissionModel = mongoose.model<Mission, Model<Mission, typeof queryHelpers> & MissionStatics>('Mission', missionSchema);

export { MissionModel };
