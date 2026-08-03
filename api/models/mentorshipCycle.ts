import mongoose, { Schema } from 'mongoose';
import { MentorshipCycle } from '../../interfaces/mentorshipCycle';

const mentorshipCycleSchema = new Schema<MentorshipCycle>({
    number: { type: Number, required: true },
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    url: { type: String },
    isPublic: { type: Boolean, default: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

mentorshipCycleSchema.virtual('records', {
    ref: 'MentorshipRecord',
    localField: '_id',
    foreignField: 'cycle',
});

// distinct participating users for this cycle
mentorshipCycleSchema.virtual('participants').get(function(this: any) {
    if (!this.records) return [];

    const byUser = new Map<string, any>();

    for (const record of this.records) {
        const user = record.user;

        if (!user) continue;

        const key = user.id;

        if (!byUser.has(key)) {
            byUser.set(key, {
                _id: user._id,
                id: user.id,
                username: user.username,
                osuId: user.osuId,
                mentorships: [],
            });
        }

        byUser.get(key).mentorships.push(record);
    }

    return Array.from(byUser.values());
});

const MentorshipCycleModel = mongoose.model<MentorshipCycle>('MentorshipCycle', mentorshipCycleSchema);

export { MentorshipCycleModel };
