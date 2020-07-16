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
exports.SubmissionModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const submissionSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    creator: { type: 'ObjectId', ref: 'User', required: true },
    evaluations: [{ type: 'ObjectId', ref: 'Screening' }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
submissionSchema.virtual('contest', {
    ref: 'Contest',
    localField: '_id',
    foreignField: 'submissions',
    justOne: true,
});
submissionSchema.virtual('judgings', {
    ref: 'Judging',
    localField: '_id',
    foreignField: 'submission',
});
const SubmissionModel = mongoose_1.default.model('Submission', submissionSchema);
exports.SubmissionModel = SubmissionModel;
