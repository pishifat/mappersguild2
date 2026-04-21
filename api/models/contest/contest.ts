import mongoose, { Document, Schema } from 'mongoose';
import { Contest as IContest } from '../../../interfaces/contest/contest';

export interface Contest extends IContest, Document {
    _id: any;
    id: string;
}

const contestSchema = new Schema({
    name: { type: String, required: true },
    creators: [{ type: 'ObjectId', ref: 'User' }],
    url: { type: String },
    osuContestListingUrl: { type: String },
    resultsUrl: { type: String },
    isApproved: { type: Boolean },
    status: { type: String, enum: ['hidden', 'beatmapping', 'screening', 'judging', 'vote', 'locked', 'complete'], default: 'hidden' },
    contestStart: { type: Date },
    contestEnd: { type: Date },
    submissions: [{ type: 'ObjectId', ref: 'Submission' }],
    screeners: [{ type: 'ObjectId', ref: 'User' }],
    screeningVoteCount: { type: Number, default: 5 },
    judges: [{ type: 'ObjectId', ref: 'User' }],
    judgingThreshold: { type: Number, default: 0 },
    screeningBonus: { type: Boolean, default: false },
    criterias: [{ type: 'ObjectId', ref: 'Criteria' }],
    download: { type: String },
    description: { type: String },
    mode: { type: String },
    bannerUrl: { type: String },
    isFeaturedArtistContest: { type: Boolean, default: false },
    isEligibleForPoints: { type: Boolean, default: true }, // for multi-part contests that use FA
    useRawScoring: { type: Boolean, default: false },
    skipWebhook: { type: Boolean, default: false },
    hasPublicJudges: { type: Boolean, default: false },
    communityVoteCount: { type: Number, default: 5 },
    communityVoteEnd: { type: Date },
    communityVoteOrderedPriority: { type: Boolean, default: false },
    communityVoteDescription: { type: String },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const ContestModel = mongoose.model<Contest>('Contest', contestSchema);

export { ContestModel };
