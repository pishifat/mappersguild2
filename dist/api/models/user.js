"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.populatePointsVirtuals = exports.UserModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const helpers_1 = require("../helpers/helpers");
const UserSchema = new mongoose_1.Schema({
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
            mode: { type: String, enum: ['osu', 'taiko', 'catch', 'mania', 'modding', 'graduation', 'storyboard'], required: true },
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
    missionPoints: { type: Number, default: 0 },
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
    completedMissions: [{ type: 'ObjectId', ref: 'Mission' }],
    rankedBeatmapsCount: { type: Number },
    globalRank: { type: Number },
    pp: { type: Number },
    ppOsu: { type: Number },
    ppTaiko: { type: Number },
    ppCatch: { type: Number },
    ppMania: { type: Number },
    hasMerchAccess: { type: Boolean },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
UserSchema.virtual('totalPoints').get(function () {
    return Math.round((this.easyPoints + this.normalPoints + this.hardPoints + this.insanePoints + this.expertPoints +
        this.storyboardPoints + this.questPoints + this.modPoints + this.hostPoints +
        this.contestCreatorPoints + this.contestParticipantPoints + this.contestScreenerPoints + this.contestJudgePoints +
        this.legacyPoints) * 10) / 10;
});
UserSchema.virtual('availablePoints').get(function () {
    return Math.round((this.totalPoints - this.spentPoints) * 10) / 10;
});
UserSchema.virtual('pointsInfo').get(function () {
    const pointsInfo = {
        total: this.totalPoints,
        available: this.availablePoints,
        mapping: Math.round((this.osuPoints + this.taikoPoints + this.catchPoints + this.maniaPoints) * 10) / 10,
        modding: this.modPoints,
        other: this.storyboardPoints + this.questPoints + this.hostPoints +
            this.contestCreatorPoints + this.contestParticipantPoints + this.contestScreenerPoints + this.contestJudgePoints + this.legacyPoints,
    };
    return pointsInfo;
});
UserSchema.virtual('mainMode').get(function () {
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
UserSchema.query.byUsername = function (username) {
    return this.where({ username: new RegExp('^' + helpers_1.escapeUsername(username) + '$', 'i') });
};
UserSchema.query.byUsernameOrOsuId = function (user) {
    const osuId = parseInt(user, 10);
    if (isNaN(osuId)) {
        this.byUsername(user);
        return this.where({ username: new RegExp('^' + helpers_1.escapeUsername(user) + '$', 'i') });
    }
    else {
        return this.where({ osuId });
    }
};
const UserModel = mongoose_1.default.model('User', UserSchema);
exports.UserModel = UserModel;
const populatePointsVirtuals = 'osuId username rank easyPoints normalPoints hardPoints insanePoints expertPoints storyboardPoints questPoints modPoints hostPoints contestCreatorPoints contestParticipantPoints contestScreenerPoints contestJudgePoints';
exports.populatePointsVirtuals = populatePointsVirtuals;
