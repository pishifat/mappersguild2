import mongoose, { Document, Schema } from 'mongoose';
import BaseService from './baseService';
import { BasicError } from '../helpers/helpers';
import { User } from './user';
import { Quest } from './quest';
import { SpentPoints as ISpentPoints } from '../interfaces/spentPoints';

export interface SpentPoints extends ISpentPoints, Document {
    id: string;
}

const spentPointsSchema = new Schema({
    category: { type: String, enum: ['extendDeadline', 'acceptQuest', 'createQuest', 'reopenQuest'], required: true },
    user: { type: 'ObjectId', ref: 'User', required: true },
    quest: { type: 'ObjectId', ref: 'Quest', required: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const SpentPointsModel = mongoose.model<SpentPoints>('SpentPoints', spentPointsSchema);

class SpentPointsService extends BaseService<SpentPoints>
{
    constructor() {
        super(
            SpentPointsModel,
            { createdAt: -1 },
            []
        );
    }

    async create(
        category: SpentPoints['category'],
        userId: User['_id'],
        questId: Quest['_id']
    ): Promise<SpentPoints | BasicError> {
        try {
            const spentPoints: SpentPoints = new SpentPointsModel({
                category,
                user: userId,
                quest: questId,
            });

            return await SpentPointsModel.create(spentPoints);
        } catch (error) {
            return { error: error._message };
        }
    }
}

const service = new SpentPointsService();

export { service as SpentPointsService };
