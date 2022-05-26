import mongoose, { Document, Schema } from 'mongoose';
import { Screening as IScreening } from '../../../interfaces/contest/screening';

export interface Screening extends IScreening, Document {
    _id: any;
    id: string;
}

const screeningSchema = new Schema<Screening>({
    screener: { type: 'ObjectId', ref: 'User', required: true },
    submission: { type: 'ObjectId', ref: 'Submission', required: true },
    comment: { type: String, trim: true },
    vote: { type: Number, enum: [0, 1, 2, 3, 4, 5], default: 0 },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const ScreeningModel = mongoose.model<Screening>('Screening', screeningSchema);

export { ScreeningModel };
