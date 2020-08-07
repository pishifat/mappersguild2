import mongoose, { Schema } from 'mongoose';
import { User, PointsInfo } from '../interfaces/user';

const UserSchema = new Schema({
    osuId: { type: Number, required: true, unique: true },
    username: { type: String, required: true },
    group: { type: String, enum: ['user', 'admin', 'spectator'], default: 'user' },
    badge: { type: Number, default: 0 },
    bypassLogin: { type: Boolean },

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
    contestScreenerPoints: { type: Number, default: 0 },
    contestVotePoints: { type: Number, default: 0 },
    legacyPoints: { type: Number, default: 0 },
    osuPoints: { type: Number, default: 0 },
    taikoPoints: { type: Number, default: 0 },
    catchPoints: { type: Number, default: 0 },
    maniaPoints: { type: Number, default: 0 },
    spentPoints: { type: Number, default: 0 },
    completedQuests: [{ type: 'ObjectId', ref: 'Quest' }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

UserSchema.virtual('totalPoints').get(function(this: User) {
    return Math.round((this.easyPoints + this.normalPoints + this.hardPoints + this.insanePoints + this.expertPoints +
        this.storyboardPoints + this.questPoints + this.modPoints + this.hostPoints +
        this.contestParticipantPoints + this.contestScreenerPoints + this.contestVotePoints + this.legacyPoints)*10)/10;
});

UserSchema.virtual('availablePoints').get(function(this: User) {
    return Math.round((this.totalPoints - this.spentPoints)*10)/10;
});

UserSchema.virtual('pointsInfo').get(function(this: User) {
    const pointsInfo: PointsInfo = {
        total: this.totalPoints,
        available: this.availablePoints,
        mapping: Math.round((this.osuPoints + this.taikoPoints + this.catchPoints + this.maniaPoints)*10)/10,
        modding: this.modPoints,
        other: this.storyboardPoints + this.questPoints + this.hostPoints +
        this.contestParticipantPoints + this.contestScreenerPoints + this.contestVotePoints + this.legacyPoints,
    };

    return pointsInfo;
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

const populatePointsVirtuals = 'osuId username rank easyPoints normalPoints hardPoints insanePoints expertPoints storyboardPoints questPoints modPoints hostPoints contestParticipantPoints contestScreenerPoints contestVotePoints';

export { UserModel, populatePointsVirtuals };
