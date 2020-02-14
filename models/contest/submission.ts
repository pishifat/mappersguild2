import mongoose, { Document, Schema } from 'mongoose';
import BaseService from '../baseService';
import { BasicError } from '../../helpers/helpers';
import { Submission as ISubmission } from '../../interfaces/contest/submission';
import { User } from '../user';

export interface Submission extends ISubmission, Document {
    id: string;
}

const submissionSchema = new Schema({
    name: { type: String },
    creator: { type: 'ObjectId', ref: 'User' },
    evaluations: [{ type: 'ObjectId', ref: 'Judging' }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const SubmissionModel = mongoose.model<Submission>('Submission', submissionSchema);

class SubmissionService extends BaseService<Submission>
{
    constructor() {
        super(
            SubmissionModel,
            { createdAt: -1 },
            [
                {
                    path: 'evaluations',
                    populate: {
                        path: 'judge',
                        select: '_id osuId username',
                    },
                },
            ]
        );
    }

    async create(name: string, userId: User['_id']): Promise<Submission | BasicError> {
        try {
            return await SubmissionModel.create({
                name,
                userId,
            });
        } catch (error) {
            return { error: error._message };
        }
    }
}

const service = new SubmissionService();

export { service as SubmissionService };
