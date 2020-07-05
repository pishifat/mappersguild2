import mongoose, { Document, Schema } from 'mongoose';
import { Judging as IJudging } from '../../interfaces/contest/judging';

export interface Judging extends IJudging, Document {
    id: string;
}

const judgingSchema = new Schema({
    judge: { type: 'ObjectId', ref: 'User', required: true },
    comment: { type: String, trim: true },
    vote: { type: Number, enum: [0, 1, 2, 3, 4, 5], default: 0 },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const JudgingModel = mongoose.model<Judging>('Judging', judgingSchema);

export { JudgingModel };
