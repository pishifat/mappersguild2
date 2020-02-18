import mongoose, { Document, Schema } from 'mongoose';
import BaseService from '../baseService';
import { BasicError } from '../../helpers/helpers';
import { Contest as IContest } from '../../interfaces/contest/contest';

export interface Contest extends IContest, Document {
    id: string;
}

const contestSchema = new Schema({
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    contestStart: { type: Date },
    judgingStart: { type: Date },
    resultsPublished: { type: Date },
    submissions: [{ type: 'ObjectId', ref: 'Submission' }],
    judges: [{ type: 'ObjectId', ref: 'User' }],
    voters: [{ type: 'ObjectId', ref: 'User' }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const ContestModel = mongoose.model<Contest>('Contest', contestSchema);

class ContestService extends BaseService<Contest>
{
    constructor() {
        super(
            ContestModel,
            { name: 1 },
            [
                {
                    path: 'submissions',
                    select: '_id name evaluations',
                    populate: {
                        path: 'evaluations',
                        populate: {
                            path: 'judge',
                            select: '_id osuId username',
                        },
                    },
                },
            ]
        );
    }

    async create(name: string): Promise<Contest | BasicError> {
        try {
            return await ContestModel.create({
                name,
            });
        } catch (error) {
            return { error: error._message };
        }
    }
}

const service = new ContestService();

export { service as ContestService };
