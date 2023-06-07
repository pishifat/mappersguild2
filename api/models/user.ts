import mongoose, { DocumentQuery, Model, Schema } from 'mongoose';
import { User, PointsInfo } from '../../interfaces/user';
import { escapeUsername } from '../helpers/helpers';

const UserSchema = new Schema<User>({
    osuId: { type: Number, required: true, unique: true },
    username: { type: String, required: true },
    group: { type: String, enum: ['user', 'admin', 'secret'], default: 'user' },
    badge: { type: Number, default: 0 },
    queuedBadge: { type: Number, default: 0 },
    discordId: { type: String },
    isShowcaseMapper: { type: Boolean },
    isContestHelper: { type: Boolean },
    isMentorshipAdmin: { type: Boolean },
    mentorships: [{
        _id: false,
        cycle: { type: 'ObjectId', ref: 'MentorshipCycle', required: true },
        mode: { type: String, enum: ['osu', 'taiko', 'catch', 'mania', 'modding', 'graduation', 'storyboard'], required: true }, // graduation = mentoring someone on how to mentor. stupid name
        group: { type: String, enum: ['mentor', 'mentee'], required: true },
        mentor: { type: 'ObjectId', ref: 'User' },
        phases: [{ type: Number, default: [1, 2, 3] }],
    }],
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
    contestCreatorPoints: { type: Number, default: 0 },
    contestParticipantPoints: { type: Number, default: 0 },
    contestScreenerPoints: { type: Number, default: 0 },
    contestJudgePoints: { type: Number, default: 0 },
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
        this.contestCreatorPoints + this.contestParticipantPoints + this.contestScreenerPoints + this.contestJudgePoints +
        this.legacyPoints)*10)/10;
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
        this.contestCreatorPoints + this.contestParticipantPoints + this.contestScreenerPoints + this.contestJudgePoints + this.legacyPoints,
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

UserSchema.virtual('mentees', {
    ref: 'User',
    localField: '_id',
    foreignField: 'mentorships.mentor',
});

interface QueryHelpers {
    byUsername<Q extends DocumentQuery<any, User>>(this: Q, username: string): Q;
    byUsernameOrOsuId<Q extends DocumentQuery<any, User>>(this: Q, user: string): Q;
}

UserSchema.query.byUsername = function (this: DocumentQuery<any, User>, username: string) {
    return this.where({ username: new RegExp('^' + escapeUsername(username) + '$', 'i') });
};

UserSchema.query.byUsernameOrOsuId = function (this: DocumentQuery<any, User> & QueryHelpers, user: string) {
    const osuId = parseInt(user, 10);

    if (isNaN(osuId)) {
        this.byUsername(user);

        return this.where({ username: new RegExp('^' + escapeUsername(user) + '$', 'i') });
    } else {
        return this.where({ osuId });
    }
};

const UserModel = mongoose.model<User, Model<User, QueryHelpers>>('User', UserSchema);

const populatePointsVirtuals = 'osuId username rank easyPoints normalPoints hardPoints insanePoints expertPoints storyboardPoints questPoints modPoints hostPoints contestCreatorPoints contestParticipantPoints contestScreenerPoints contestJudgePoints';

export { UserModel, populatePointsVirtuals };
