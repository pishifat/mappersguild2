import mongoose, { Document, Schema } from 'mongoose';
import BaseService from '../baseService';
import { BasicError } from '../../helpers/helpers';
import { Judging as IJudging, JudgingPlacement } from '../../interfaces/contest/judging';
import { User } from '../user';

export interface Judging extends IJudging, Document {
    id: string;
}

const judgingSchema = new Schema({
    judge: { type: 'ObjectId', ref: 'User' },
    comment: { type: String },
    vote: { type: Number, enum: [0, 1, 2, 3, 4, 5], default: 0 },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const JudgingModel = mongoose.model<Judging>('Judging', judgingSchema);

class JudgingService extends BaseService<Judging>
{
    constructor() {
        super(
            JudgingModel,
            { createdAt: -1 },
            [
                {
                    path: 'judge',
                    select: '_id osuId username',
                },
            ]
        );
    }

    async create(userId: User['_id'], comment: string | null, vote: JudgingPlacement | null): Promise<Judging | BasicError> {
        try {
            if (comment) {
                return await JudgingModel.create({
                    judge: userId,
                    comment,
                });
            } else {
                return await JudgingModel.create({
                    judge: userId,
                    vote,
                });
            }
        } catch (error) {
            return { error: error._message };
        }
    }
}

const service = new JudgingService();

export { service as JudgingService };
