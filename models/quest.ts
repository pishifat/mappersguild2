/* eslint-disable @typescript-eslint/no-use-before-define */
import mongoose, { Document, Schema, Model, DocumentQuery } from 'mongoose';
import { Quest as IQuest } from '../interfaces/quest';
import { User } from '../interfaces/user';

export interface Quest extends IQuest, Document {
    id: string;
}

interface QuestStatics extends Model<Quest> {
    getUserQuests: (userId: User['_id']) => mongoose.Aggregate<Quest[]>;
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
    status: { type: String, enum: ['open', 'wip', 'done', 'pending', 'rejected', 'hidden'], default: 'open' },
    parties: [{ type: 'ObjectId', ref: 'Party' }],
    modes: [{ type: String, default: ['osu', 'taiko', 'catch', 'mania'], required: true }],
    expiration: { type: Date },
    //status is wip
    accepted: { type: Date },
    deadline: { type: Date },
    currentParty: { type: 'ObjectId', ref: 'Party' },
    //status is done
    completed: { type: Date },
    completedMembers: [{ type: 'ObjectId', ref: 'User' }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

questSchema.virtual('associatedMaps', {
    ref: 'Beatmap',
    localField: '_id',
    foreignField: 'quest',
});

questSchema.virtual('isExpired').get(function (this: Quest) {
    return ((+new Date() > +this.expiration) && this.status == 'open');
});

const queryHelpers = {
    sortByLastest<Q extends DocumentQuery<any, Quest>>(this: Q) {
        return this.sort({ createdAt: -1 });
    },
    defaultPopulate<Q extends DocumentQuery<any, Quest>>(this: Q) {
        return this.populate([
            { path: 'parties',  populate: { path: 'members leader' } },
            { path: 'currentParty',  populate: { path: 'members leader' } },
            { path: 'associatedMaps',  populate: { path: 'song host tasks' } },
            { path: 'completedMembers',  select: 'username osuId rank' },
            { path: 'creator',  select: 'username osuId' },
        ]);
    },
};

questSchema.query = queryHelpers;

class QuestService
{
    static getUserQuests(userId: User['_id']): mongoose.Aggregate<Quest[]> {
        return QuestModel.aggregate([
            {
                $match: {
                    status: 'wip',
                },
            },
            {
                $lookup: {
                    from: 'parties',
                    localField: 'currentParty',
                    foreignField: '_id',
                    as: 'currentParty',
                },
            },
            {
                $unwind: '$currentParty',
            },
            {
                $match: {
                    'currentParty.members': mongoose.Types.ObjectId(userId),
                },
            },
            {
                $project: {
                    'name': 1,
                },
            },
        ]);
    }
}

questSchema.loadClass(QuestService);
const QuestModel = mongoose.model<Quest, Model<Quest, typeof queryHelpers> & QuestStatics>('Quest', questSchema);

export { QuestModel };
