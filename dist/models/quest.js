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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const questSchema = new mongoose_1.Schema({
    creator: { type: 'ObjectId', ref: 'User' },
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
    descriptionMain: { type: String, required: true },
    timeframe: { type: Number, required: true },
    requiredMapsets: { type: Number },
    minParty: { type: Number, required: true },
    maxParty: { type: Number, required: true },
    minRank: { type: Number, required: true },
    art: { type: Number },
    isMbc: { type: Boolean },
    status: { type: String, enum: ['open', 'wip', 'done', 'pending', 'rejected', 'hidden'], default: 'open' },
    parties: [{ type: 'ObjectId', ref: 'Party' }],
    modes: [{ type: String, default: ['osu', 'taiko', 'catch', 'mania'], required: true }],
    expiration: { type: Date },
    accepted: { type: Date },
    deadline: { type: Date },
    currentParty: { type: 'ObjectId', ref: 'Party' },
    completed: { type: Date },
    completedMembers: [{ type: 'ObjectId', ref: 'User' }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
questSchema.virtual('associatedMaps', {
    ref: 'Beatmap',
    localField: '_id',
    foreignField: 'quest',
});
questSchema.virtual('isExpired').get(function () {
    return ((+new Date() > +this.expiration) && this.status == 'open');
});
const queryHelpers = {
    sortByLastest() {
        return this.sort({ createdAt: -1 });
    },
    defaultPopulate() {
        return this.populate([
            { path: 'parties', populate: { path: 'members leader' } },
            { path: 'currentParty', populate: { path: 'members leader' } },
            { path: 'associatedMaps', populate: { path: 'song host tasks' } },
            { path: 'completedMembers', select: 'username osuId rank' },
            { path: 'creator', select: 'username osuId' },
        ]);
    },
};
questSchema.query = queryHelpers;
class QuestService {
    static getUserQuests(userId) {
        return QuestModel.aggregate([
            {
                $match: {
                    status: 'wip',
                },
            },
            {
                $lookup: {
                    from: 'parties',
                    localField: 'currentParty',
                    foreignField: '_id',
                    as: 'currentParty',
                },
            },
            {
                $unwind: '$currentParty',
            },
            {
                $match: {
                    'currentParty.members': mongoose_1.default.Types.ObjectId(userId),
                },
            },
            {
                $project: {
                    'name': 1,
                },
            },
        ]);
    }
}
questSchema.loadClass(QuestService);
const QuestModel = mongoose_1.default.model('Quest', questSchema);
exports.QuestModel = QuestModel;
