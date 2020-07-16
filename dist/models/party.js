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
exports.PartyModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const partySchema = new mongoose_1.Schema({
    leader: { type: 'ObjectId', ref: 'User' },
    members: [{ type: 'ObjectId', ref: 'User' }],
    lock: { type: Boolean, default: false },
    rank: { type: Number, default: 0 },
    modes: [{ type: String, required: true }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
const queryHelpers = {
    defaultPopulate() {
        return this.populate([
            { path: 'members', select: 'username osuId rank' },
            { path: 'leader', select: 'username osuId' },
        ]);
    },
};
partySchema.query = queryHelpers;
const PartyModel = mongoose_1.default.model('Party', partySchema);
exports.PartyModel = PartyModel;
