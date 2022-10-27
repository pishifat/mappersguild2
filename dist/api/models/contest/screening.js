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
exports.ScreeningModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const screeningSchema = new mongoose_1.Schema({
    screener: { type: 'ObjectId', ref: 'User', required: true },
    submission: { type: 'ObjectId', ref: 'Submission', required: true },
    comment: { type: String, trim: true },
    vote: { type: Number, enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], default: 0 },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
const ScreeningModel = mongoose_1.default.model('Screening', screeningSchema);
exports.ScreeningModel = ScreeningModel;
