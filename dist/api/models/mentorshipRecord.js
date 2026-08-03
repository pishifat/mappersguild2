"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MentorshipRecordModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const mentorshipModes = [
    'osu', 'taiko', 'catch', 'mania',
    'osuModding', 'taikoModding', 'catchModding', 'maniaModding',
    'osuGraduation', 'taikoGraduation', 'catchGraduation', 'maniaGraduation',
    'storyboard',
];
const mentorshipRecordSchema = new mongoose_1.Schema({
    user: { type: 'ObjectId', ref: 'User', required: true },
    cycle: { type: 'ObjectId', ref: 'MentorshipCycle', required: true },
    mode: { type: String, enum: mentorshipModes, required: true }, // graduation = mentoring someone on how to mentor. stupid name
    group: { type: String, enum: ['mentor', 'mentee', 'extraMentor'], required: true },
    mentor: { type: 'ObjectId', ref: 'User' },
    phases: [{ type: Number, default: [1, 2, 3] }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
// query performance only
mentorshipRecordSchema.index({ user: 1, cycle: 1, mode: 1 });
mentorshipRecordSchema.index({ cycle: 1 });
mentorshipRecordSchema.index({ mentor: 1 });
const MentorshipRecordModel = mongoose_1.default.model('MentorshipRecord', mentorshipRecordSchema);
exports.MentorshipRecordModel = MentorshipRecordModel;
