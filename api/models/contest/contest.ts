import mongoose, { Document, Schema } from 'mongoose';
import { Contest as IContest } from '../../../interfaces/contest/contest';

export interface Contest extends IContest, Document {
    _id: any;
    id: string;
}

const contestSchema = new Schema<Contest>({
    name: { type: String, required: true },
    status: { type: String, enum: ['beatmapping', 'screening', 'judging', 'complete'], default: 'beatmapping' },
    contestStart: { type: Date },
    submissions: [{ type: 'ObjectId', ref: 'Submission' }],
    screeners: [{ type: 'ObjectId', ref: 'User' }],
    judges: [{ type: 'ObjectId', ref: 'User' }],
    judgingThreshold: { type: Number },
    criterias: [{ type: 'ObjectId', ref: 'Criteria' }],
    download: { type: String },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const ContestModel = mongoose.model<Contest>('Contest', contestSchema);

export { ContestModel };
