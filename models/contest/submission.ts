import mongoose, { Document, Schema } from 'mongoose';
import { Submission as ISubmission } from '../../interfaces/contest/submission';

export interface Submission extends ISubmission, Document {
    id: string;
}

const submissionSchema = new Schema({
    name: { type: String, required: true },
    creator: { type: 'ObjectId', ref: 'User', required: true },
    evaluations: [{ type: 'ObjectId', ref: 'Judging' }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const SubmissionModel = mongoose.model<Submission>('Submission', submissionSchema);

export { SubmissionModel };
