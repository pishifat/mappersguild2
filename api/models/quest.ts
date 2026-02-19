/* eslint-disable @typescript-eslint/no-use-before-define */
import mongoose, { Schema, Model } from 'mongoose';
import { Quest, QuestStatus } from '../../interfaces/quest';
import { BeatmapModel } from './beatmap/beatmap';

interface QuestStatics {
    findAll (limit?: number): Promise<Quest[]>;
    defaultFindByIdOrFail (id: any): Promise<Quest>;
}

const questSchema = new Schema({
    creator: { type: 'ObjectId', ref: 'User' },
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
    descriptionMain: { type: String, required: true },
    timeframe: { type: Number, required: true },
    requiredMapsets: { type: Number },
    minParty: { type: Number, required: true },
    maxParty: { type: Number, required: true },
    minRank: { type: Number, required: true },
    art: { type: Number },
    isMbc: { type: Boolean },
    status: { type: String, enum: ['open', 'wip', 'done', 'pending', 'rejected', 'hidden', 'scheduled'], default: 'open' },
    modes: [{ type: String, default: ['osu', 'taiko', 'catch', 'mania'], required: true }],
    expiration: { type: Date },
    //status is wip
    accepted: { type: Date },
    deadline: { type: Date },
    //status is done
    completed: { type: Date },
    queuedForCompletion: { type: Boolean },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

questSchema.virtual('associatedMaps', {
    ref: 'Beatmap',
    localField: '_id',
    foreignField: 'quest',
});

questSchema.virtual('parties', {
    ref: 'Party',
    localField: '_id',
    foreignField: 'quest',
});

questSchema.virtual('currentParty').get(function (this: Quest) {
    if ((this.status === QuestStatus.WIP || this.status === QuestStatus.Done) && this.parties?.length) return this.parties[0];

    return undefined;
});

questSchema.virtual('isExpired').get(function (this: Quest) {
    return ((+new Date() > +this.expiration) && this.status == 'open');
});

questSchema.virtual('reopenPrice').get(function (this: Quest) {
    return this.price * 0.5 + 25;
});

questSchema.methods.dissociateBeatmaps = async function (this: Quest, userId?: string) {
    if (this.associatedMaps) {
        for (const beatmap of this.associatedMaps) {
            if (userId) {
                for (const task of beatmap.tasks) {
                    if (task.mappers.some(m => m.id == userId)) {
                        await BeatmapModel.findByIdAndUpdate(beatmap._id, { quest: undefined });
                        break;
                    }
                }
            } else {
                await BeatmapModel.findByIdAndUpdate(beatmap._id, { quest: undefined });
            }
        }
    }
};

questSchema.methods.removeParties = async function (this: Quest) {
    if (this.parties.length) {
        for (const party of this.parties) {
            await party.deleteOne();
        }
    }
};

questSchema.methods.drop = async function (this: Quest) {
    await this.dissociateBeatmaps();
    await this.removeParties();

    const openQuest = await QuestModel.findOne({
        name: this.name,
        status: QuestStatus.Open,
    });

    if (openQuest) {
        this.status = QuestStatus.Hidden;
        openQuest.modes.push(...this.modes);
        await openQuest.save();
    } else {
        this.status = QuestStatus.Open;
    }

    await this.save();

    return openQuest || this;
};

const queryHelpers = {
    sortByLatest(this: any) {
        return this.sort({ createdAt: -1 });
    },
    defaultPopulate(this: any) {
        return this.populate([
            { path: 'parties', populate: { path: 'members pendingMembers leader' } },
            {
                path: 'associatedMaps',
                populate: {
                    path: 'song host tasks',
                    populate: {
                        path: 'mappers',
                    },
                },
            },
            { path: 'creator',  select: 'username osuId' },
        ]);
    },
};

questSchema.query = queryHelpers;

questSchema.statics.findAll = function (this: any, limit?: number) {
    if (!limit) limit = 10000;

    return this
        .find({})
        .defaultPopulate()
        .sortByLatest()
        .limit(limit);
};

questSchema.statics.defaultFindByIdOrFail = function (this: any, id: any) {
    return this
        .findById(id)
        .defaultPopulate()
        .orFail();
};

const QuestModel = mongoose.model<Quest, Model<Quest, typeof queryHelpers> & QuestStatics>('Quest', questSchema);

export { QuestModel };
