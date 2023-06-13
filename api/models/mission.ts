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
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    tier: { type: Number, required: true },
    objective: { type: String, required: true },
    deadline: { type: Date, required: true },
    userRequirements: {
        _id: false,
        // fill this with things
    },
    beatmapRequirements: {
        _id: false,
        mode: { type: String, enum: ['osu', 'taiko', 'catch', 'mania'] },

    },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

missionSchema.virtual('associatedMaps', {
    ref: 'Beatmap',
    localField: '_id',
    foreignField: 'quest',
});

const queryHelpers = {
    sortByLatest<Q extends DocumentQuery<any, Mission>>(this: Q) {
        return this.sort({ createdAt: -1 });
    },
    defaultPopulate<Q extends DocumentQuery<any, Mission>>(this: Q) {
        return this.populate([{
            path: 'artists', select: 'label osuId',
        }]);
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
