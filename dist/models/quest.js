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
const QuestModel = mongoose_1.default.model('Quest', questSchema);
class QuestService extends baseService_1.default {
    constructor() {
        super(QuestModel, { createdAt: -1 }, [
            { path: 'parties', populate: { path: 'members leader' } },
            { path: 'currentParty', populate: { path: 'members leader' } },
            { path: 'associatedMaps', populate: { path: 'song host tasks' } },
            { path: 'completedMembers', select: 'username osuId rank' },
            { path: 'creator', select: 'username osuId' },
        ]);
    }
    create(questData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const quest = new QuestModel(questData);
                return yield QuestModel.create(quest);
            }
            catch (error) {
                return { error: error._message };
            }
        });
    }
    getUserQuests(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield QuestModel.aggregate([
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
            catch (error) {
                return { error: 'Something went wrong!' };
            }
        });
    }
}
const service = new QuestService();
exports.QuestService = service;
