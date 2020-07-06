import mongoose, { Schema } from 'mongoose';
import { Judging } from '../../interfaces/contest/judging';

const judgingSchema = new Schema({
    judge: { type: 'ObjectId', ref: 'User', required: true },
    submission: { type: 'ObjectId', ref: 'Submission', required: true },
    judgingScores: [{ type: 'ObjectId', ref: 'JudgingScore', required: true }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const JudgingModel = mongoose.model<Judging>('Judging', judgingSchema);

export { JudgingModel };
