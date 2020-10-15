import mongoose, { Schema } from 'mongoose';
import { Criteria } from '../../interfaces/contest/criteria';

const criteriaSchema = new Schema({
    name: { type: String, enum: ['musical representation', 'creativity', 'gameplay', 'limitation', 'theme', 'comments'], required: true },
    maxScore: { type: Number, required: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const CriteriaModel = mongoose.model<Criteria>('Criteria', criteriaSchema);

export { CriteriaModel };
