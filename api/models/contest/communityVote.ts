import mongoose, { Document, Schema } from 'mongoose';
import { CommunityVote as ICommunityVote } from '../../../interfaces/contest/communityVote';

export interface CommunityVote extends ICommunityVote, Document {
    _id: any;
    id: string;
}

const communityVoteSchema = new Schema({
    voter: { type: 'ObjectId', ref: 'User', required: true },
    submission: { type: 'ObjectId', ref: 'Submission', required: true },
    vote: { type: Number, default: 0 },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const CommunityVoteModel = mongoose.model<CommunityVote>('CommunityVote', communityVoteSchema);

export { CommunityVoteModel };
