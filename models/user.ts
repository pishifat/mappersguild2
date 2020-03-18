import mongoose, { Document, Schema } from 'mongoose';
import BaseService from './baseService';
import { BasicError } from '../helpers/helpers';
import { User as IUser } from '../interfaces/user';

export interface User extends IUser, Document {
    id: string;
}

const UserSchema = new Schema({
    osuId: { type: Number, required: true, unique: true },
    username: { type: String, required: true },
    group: { type: String, enum: ['user', 'admin', 'spectator'], default: 'user' },
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
    contestParticipantPoints: { type: Number, default: 0 },
    contestJudgePoints: { type: Number, default: 0 },
    contestVotePoints: { type: Number, default: 0 },
    osuPoints: { type: Number, default: 0 },
    taikoPoints: { type: Number, default: 0 },
    catchPoints: { type: Number, default: 0 },
    maniaPoints: { type: Number, default: 0 },
    penaltyPoints: { type: Number, default: 0 },
    spentPoints: { type: Number, default: 0 },
    completedQuests: [{ type: 'ObjectId', ref: 'Quest' }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

UserSchema.virtual('totalPoints').get(function(this: User) {
    return Math.round((this.easyPoints + this.normalPoints + this.hardPoints + this.insanePoints + this.expertPoints +
        this.storyboardPoints + this.questPoints + this.modPoints + this.hostPoints +
        this.contestParticipantPoints + this.contestJudgePoints + this.contestVotePoints - this.penaltyPoints)*10)/10;
});

UserSchema.virtual('availablePoints').get(function(this: User) {
    return this.totalPoints - this.spentPoints;
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
        super(
            UserModel,
            { createdAt: -1 },
            [
                { path: 'completedQuests', select: 'name completed' },
            ]
        );
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

const populatePointsVirtuals = 'osuId username rank easyPoints normalPoints hardPoints insanePoints expertPoints storyboardPoints questPoints modPoints hostPoints contestParticipantPoints contestJudgePoints contestVotePoints penaltyPoints';

export { service as UserService, populatePointsVirtuals };
