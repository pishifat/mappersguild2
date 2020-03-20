"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const baseService_1 = __importDefault(require("./baseService"));
const UserSchema = new mongoose_1.Schema({
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
    spentPoints: { type: Number, default: 0 },
    completedQuests: [{ type: 'ObjectId', ref: 'Quest' }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
UserSchema.virtual('totalPoints').get(function () {
    return Math.round((this.easyPoints + this.normalPoints + this.hardPoints + this.insanePoints + this.expertPoints +
        this.storyboardPoints + this.questPoints + this.modPoints + this.hostPoints +
        this.contestParticipantPoints + this.contestJudgePoints + this.contestVotePoints) * 10) / 10;
});
UserSchema.virtual('availablePoints').get(function () {
    return Math.round((this.totalPoints - this.spentPoints) * 10) / 10;
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
const UserModel = mongoose_1.default.model('User', UserSchema);
class UserService extends baseService_1.default {
    constructor() {
        super(UserModel, { createdAt: -1 }, [
            { path: 'completedQuests', select: 'name completed' },
        ]);
    }
    create(osuId, username, group) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield UserModel.findOne({ osuId });
            if (!res) {
                try {
                    return yield UserModel.create({ osuId, username, group });
                }
                catch (error) {
                    return { error: error._message };
                }
            }
            else {
                return { error: 'User already exists' };
            }
        });
    }
}
const service = new UserService();
exports.UserService = service;
const populatePointsVirtuals = 'osuId username rank easyPoints normalPoints hardPoints insanePoints expertPoints storyboardPoints questPoints modPoints hostPoints contestParticipantPoints contestJudgePoints contestVotePoints';
exports.populatePointsVirtuals = populatePointsVirtuals;
