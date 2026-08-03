import mongoose, { Schema } from 'mongoose';
import { MentorshipRecord } from '../../interfaces/mentorshipRecord';

const mentorshipModes = [
    'osu', 'taiko', 'catch', 'mania',
    'osuModding', 'taikoModding', 'catchModding', 'maniaModding',
    'osuGraduation', 'taikoGraduation', 'catchGraduation', 'maniaGraduation',
    'storyboard',
];

const mentorshipRecordSchema = new Schema({
    user: { type: 'ObjectId', ref: 'User', required: true },
    cycle: { type: 'ObjectId', ref: 'MentorshipCycle', required: true },
    mode: { type: String, enum: mentorshipModes, required: true }, // graduation = mentoring someone on how to mentor. stupid name
    group: { type: String, enum: ['mentor', 'mentee', 'extraMentor'], required: true },
    mentor: { type: 'ObjectId', ref: 'User' },
    phases: [{ type: Number, default: [1, 2, 3] }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// query performance only
mentorshipRecordSchema.index({ user: 1, cycle: 1, mode: 1 });
mentorshipRecordSchema.index({ cycle: 1 });
mentorshipRecordSchema.index({ mentor: 1 });

const MentorshipRecordModel = mongoose.model<MentorshipRecord>('MentorshipRecord', mentorshipRecordSchema);

export { MentorshipRecordModel };
