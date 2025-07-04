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
exports.SpentPointsModel = void 0;
/* eslint-disable @typescript-eslint/no-use-before-define */
const mongoose_1 = __importStar(require("mongoose"));
const spentPointsSchema = new mongoose_1.Schema({
    category: { type: String, enum: ['extendDeadline', 'acceptQuest', 'createQuest', 'reopenQuest', 'rerollShowcaseMissionSong', 'rerollShowcaseMissionArtist'], required: true },
    user: { type: 'ObjectId', ref: 'User', required: true },
    quest: { type: 'ObjectId', ref: 'Quest' },
    mission: { type: 'ObjectId', ref: 'Mission' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
class SpentPointsService {
    static generate(category, userId, questId, missionId) {
        const spentPoints = new SpentPointsModel();
        spentPoints.category = category,
            spentPoints.user = userId;
        spentPoints.quest = questId;
        spentPoints.mission = missionId;
        return spentPoints.save();
    }
}
spentPointsSchema.loadClass(SpentPointsService);
const SpentPointsModel = mongoose_1.default.model('SpentPoints', spentPointsSchema);
exports.SpentPointsModel = SpentPointsModel;
