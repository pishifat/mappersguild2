import mongoose, { Document, Schema } from 'mongoose';
import BaseService from './baseService';
import { BasicError } from '../helpers/helpers';
import { User } from './user';
import { Quest as IQuest } from '../interfaces/quest';

export interface Quest extends IQuest, Document {
    id: string;
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
    status: { type: String, enum: ['open', 'wip', 'done', 'pending', 'rejected'], default: 'open' },
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

const QuestModel = mongoose.model<Quest>('Quest', questSchema);

class QuestService extends BaseService<Quest>
{
    constructor() {
        super(
            QuestModel,
            { createdAt: -1 },
            [
                { path: 'parties',  populate: { path: 'members leader' } },
                { path: 'currentParty',  populate: { path: 'members leader' } },
                { path: 'associatedMaps',  populate: { path: 'song host tasks' } },
                { path: 'completedMembers',  select: 'username osuId rank' },
            ]
        );
    }

    async create(questData: Partial<Quest>): Promise<Quest | BasicError> {
        try {
            const quest: Partial<Quest> = new QuestModel(questData);

            return await QuestModel.create(quest);
        } catch (error) {
            return { error: error._message };
        }
    }

    async getUserQuests(userId: User['_id']): Promise<Quest[] | BasicError> {
        try {
            return await QuestModel.aggregate([
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
        } catch (error) {
            return { error: 'Something went wrong!' };
        }
    }
}

const service = new QuestService();

export { service as QuestService };
