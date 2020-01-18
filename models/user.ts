import mongoose, { Document, Schema } from 'mongoose';
import BaseService from './baseService';
import { BeatmapMode } from './beatmap/beatmap';
import { Quest } from './quest';
import { BasicError } from '../helpers/helpers';

export enum UserGroup {
    User = 'user',
    Admin = 'admin',
    Spectator = 'spectator',
}

export interface User extends Document {
    osuId: number;
    username: string;
    group: UserGroup;
    invites: boolean;
    badge: number;
    completedQuests: Quest[];

    rank: number;
    easyPoints: number;
    normalPoints: number;
    hardPoints: number;
    insanePoints: number;
    expertPoints: number;
    storyboardPoints: number;
    questPoints: number;
    modPoints: number;
    hostPoints: number;
    osuPoints: number;
    taikoPoints: number;
    catchPoints: number;
    maniaPoints: number;
    legacyPoints: number;
    penaltyPoints: number;
    totalPoints: number;
    mainMode: Omit<BeatmapMode, BeatmapMode.Hybrid>;
}

const UserSchema = new Schema({
    osuId: { type: Number, required: true, unique: true },
    username: { type: String, required: true },
    group: { type: String, enum: ['user', 'admin', 'spectator'], default: 'user' },
    invites: { type: Boolean, default: true },
    badge: { type: Number, default: 0 },

    rank: { type: Number, default: 0 },
    easyPoints: { type: Number, default: 0 },
    normalPoints: { type: Number, default: 0 },
    hardPoints: { type: Number, default: 0 },
    insanePoints: { type: Number, default: 0 },
    expertPoints: { type: Number, default: 0 },
    storyboardPoints: { type: Number, default: 0 },
    questPoints: { type: Number, default: 0 },
    modPoints: { type: Number, default: 0 },
    hostPoints: { type: Number, default: 0 },
    osuPoints: { type: Number, default: 0 },
    taikoPoints: { type: Number, default: 0 },
    catchPoints: { type: Number, default: 0 },
    maniaPoints: { type: Number, default: 0 },
    legacyPoints: { type: Number, default: 0 },
    penaltyPoints: { type: Number, default: 0 },
    completedQuests: [{ type: 'ObjectId', ref: 'Quest' }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

UserSchema.virtual('totalPoints').get(function(this: User) {
    return Math.round((this.easyPoints + this.normalPoints + this.hardPoints + this.insanePoints + this.expertPoints +
        this.storyboardPoints + this.questPoints + this.modPoints + this.hostPoints + this.legacyPoints - this.penaltyPoints)*10)/10;
});

UserSchema.virtual('mainMode').get(function(this: User) {
    const modes = [
        {
            name: 'osu',
            points: this.osuPoints,
        },
        {
            name: 'catch',
            points: this.catchPoints,
        },
        {
            name: 'taiko',
            points: this.taikoPoints,
        },
        {
            name: 'mania',
            points: this.maniaPoints,
        },
    ];

    modes.sort((a, b) => b.points - a.points);

    return modes[0].name;
});

const UserModel = mongoose.model<User>('User', UserSchema);

class UserService extends BaseService<User>
{
    constructor() {
        super(UserModel, { createdAt: -1 }, [
            { path: 'completedQuests', select: 'name completed' },
        ]);
    }

    async create(
        osuId: User['osuId'],
        username: User['username'],
        group: User['group']
    ): Promise<User | BasicError> {
        const res = await UserModel.findOne({ osuId });

        if (!res) {
            try {
                return await UserModel.create({ osuId, username, group });
            } catch (error) {
                // logs.service.create(null, error, null, 'error');
                return { error: error._message };
            }
        } else {
            return { error: 'User already exists' };
        }
    }
}

const service = new UserService();

export { service as UserService };
