/* eslint-disable @typescript-eslint/no-use-before-define */
import mongoose, { Schema } from 'mongoose';
import { MentorshipCycle } from '../../interfaces/mentorshipCycle';

const mentorshipCycleSchema = new Schema<MentorshipCycle>({
    number: { type: Number, required: true },
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    url: { type: String },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

mentorshipCycleSchema.virtual('participants', {
    ref: 'User',
    localField: '_id',
    foreignField: 'mentorships.cycle',
});

const MentorshipCycleModel = mongoose.model<MentorshipCycle>('MentorshipCycle', mentorshipCycleSchema);

export { MentorshipCycleModel };
