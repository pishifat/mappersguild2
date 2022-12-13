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
exports.FeaturedSongModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const featuredSongSchema = new mongoose_1.Schema({
    artist: { type: String, required: true },
    title: { type: String },
    songShowcaseMappers: [{ type: 'ObjectId', ref: 'User' }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
const queryHelpers = {
    defaultPopulate() {
        return this.populate([
            { path: 'songShowcaseMappers', select: 'username osuId' },
        ]);
    },
};
featuredSongSchema.query = queryHelpers;
const FeaturedSongModel = mongoose_1.default.model('FeaturedSong', featuredSongSchema);
exports.FeaturedSongModel = FeaturedSongModel;
