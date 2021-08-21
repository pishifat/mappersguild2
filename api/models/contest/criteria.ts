import mongoose, { Schema } from 'mongoose';
import { Criteria } from '../../../interfaces/contest/criteria';

const criteriaSchema = new Schema<Criteria>({
    name: { type: String, required: true },
    maxScore: { type: Number, required: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const CriteriaModel = mongoose.model<Criteria>('Criteria', criteriaSchema);

export { CriteriaModel };
