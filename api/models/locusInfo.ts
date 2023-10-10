/* eslint-disable @typescript-eslint/no-use-before-define */
import mongoose, { Schema } from 'mongoose';
import { LocusInfo } from '../../interfaces/locusInfo';

const locusInfoSchema = new Schema<LocusInfo>({
    user: { type: 'ObjectId', ref: 'User', required: true },
    timezone: { type: String },
    availability: { type: String },
    languages: [{ type: String }],
    discord: { type: String },
    email: { type: String },
    about: { type: String },
    isPublic: { type: Boolean, default: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const LocusInfoModel = mongoose.model<LocusInfo>('LocusInfo', locusInfoSchema);

export { LocusInfoModel };
