import mongoose, { Schema } from 'mongoose';
import { JudgingScore } from '../../interfaces/contest/judgingScore';

const judgingScoreSchema = new Schema({
    criteria: { type: 'ObjectId', ref: 'Criteria', required: true },
    score: { type: Number },
    comment: { type: String, trim: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const JudgingScoreModel = mongoose.model<JudgingScore>('JudgingScore', judgingScoreSchema);

export { JudgingScoreModel };
