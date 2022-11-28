/* eslint-disable @typescript-eslint/no-use-before-define */
import mongoose, { Schema } from 'mongoose';
import { MentorshipCycle } from '../../interfaces/mentorshipCycle';

const mentorshipCycleSchema = new Schema<MentorshipCycle>({
    number: { type: Number, required: true },
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    url: { type: String },
    osuMentors: [{ type: 'ObjectId', ref: 'User' }],
    taikoMentors: [{ type: 'ObjectId', ref: 'User' }],
    catchMentors: [{ type: 'ObjectId', ref: 'User' }],
    maniaMentors: [{ type: 'ObjectId', ref: 'User' }],
    osuMentees: [{ type: 'ObjectId', ref: 'User' }],
    taikoMentees: [{ type: 'ObjectId', ref: 'User' }],
    catchMentees: [{ type: 'ObjectId', ref: 'User' }],
    maniaMentees: [{ type: 'ObjectId', ref: 'User' }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

mentorshipCycleSchema.virtual('test', {
    ref: 'User',
    localField: '_id',
    foreignField: 'mentorships.cycle',
});

const MentorshipCycleModel = mongoose.model<MentorshipCycle>('MentorshipCycle', mentorshipCycleSchema);

export { MentorshipCycleModel };
