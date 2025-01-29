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
exports.LocusInfoModel = void 0;
/* eslint-disable @typescript-eslint/no-use-before-define */
const mongoose_1 = __importStar(require("mongoose"));
const locusInfoSchema = new mongoose_1.Schema({
    user: { type: 'ObjectId', ref: 'User', required: true },
    timezone: { type: String },
    availability: { type: String },
    roles: [{ type: String }],
    languages: [{ type: String }],
    discord: { type: String },
    email: { type: String },
    about: { type: String },
    isPublic: { type: Boolean, default: false },
    isOnTeam: { type: Boolean, default: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
const LocusInfoModel = mongoose_1.default.model('LocusInfo', locusInfoSchema);
exports.LocusInfoModel = LocusInfoModel;
