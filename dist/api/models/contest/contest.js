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
exports.ContestModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const contestSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    creators: [{ type: 'ObjectId', ref: 'User' }],
    url: { type: String },
    osuContestListingUrl: { type: String },
    resultsUrl: { type: String },
    isApproved: { type: Boolean },
    status: { type: String, enum: ['hidden', 'beatmapping', 'screening', 'judging', 'locked', 'complete'], default: 'hidden' },
    contestStart: { type: Date },
    contestEnd: { type: Date },
    submissions: [{ type: 'ObjectId', ref: 'Submission' }],
    screeners: [{ type: 'ObjectId', ref: 'User' }],
    screeningVoteCount: { type: Number, default: 5 },
    judges: [{ type: 'ObjectId', ref: 'User' }],
    judgingThreshold: { type: Number, default: 0 },
    screeningBonus: { type: Boolean },
    criterias: [{ type: 'ObjectId', ref: 'Criteria' }],
    download: { type: String },
    description: { type: String },
    mode: { type: String },
    bannerUrl: { type: String },
    isFeaturedArtistContest: { type: Boolean, default: false },
    isEligibleForPoints: { type: Boolean, default: true },
    useRawScoring: { type: Boolean },
    skipWebhook: { type: Boolean },
    hasPublicJudges: { type: Boolean },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
const ContestModel = mongoose_1.default.model('Contest', contestSchema);
exports.ContestModel = ContestModel;
