import mongoose, { Schema } from 'mongoose';
import { TeamInfo } from '../../interfaces/teamInfo';

const teamInfoSchema = new Schema({
    user: { type: 'ObjectId', ref: 'User', required: true },
    timezone: { type: String },
    availability: { type: String },
    roles: [{ type: String }],
    languages: [{ type: String }],
    discord: { type: String },
    email: { type: String },
    about: { type: String },
    isPublic: { type: Boolean, default: false },
    isOnTeam: { type: Boolean, default: false },
    isHiddenByAdmin: { type: Boolean, default: false },
    contest: { type: String },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const TeamInfoModel = mongoose.model<TeamInfo>('TeamInfo', teamInfoSchema);

export { TeamInfoModel };
