import mongoose, { Document, Schema } from 'mongoose';
import { Contest as IContest } from '../../../interfaces/contest/contest';

export interface Contest extends IContest, Document {
    _id: any;
    id: string;
}

const contestSchema = new Schema<Contest>({
    name: { type: String, required: true },
    creator: { type: 'ObjectId', ref: 'User' },
    url: { type: String },
    osuContestListingUrl: { type: String },
    status: { type: String, enum: ['hidden', 'beatmapping', 'screening', 'judging', 'complete'], default: 'hidden' },
    contestStart: { type: Date },
    contestEnd: { type: Date },
    submissions: [{ type: 'ObjectId', ref: 'Submission' }],
    screeners: [{ type: 'ObjectId', ref: 'User' }],
    judges: [{ type: 'ObjectId', ref: 'User' }],
    judgingThreshold: { type: Number, default: 0 },
    criterias: [{ type: 'ObjectId', ref: 'Criteria' }],
    download: { type: String },
    description: { type: String },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const ContestModel = mongoose.model<Contest>('Contest', contestSchema);

export { ContestModel };
