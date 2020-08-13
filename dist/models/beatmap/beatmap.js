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
exports.BeatmapModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BeatmapSchema = new mongoose_1.Schema({
    song: { type: 'ObjectId', ref: 'FeaturedSong' },
    host: { type: 'ObjectId', ref: 'User', required: true },
    status: { type: String, enum: ['WIP', 'Done', 'Qualified', 'Ranked'], default: 'WIP' },
    tasks: [{ type: 'ObjectId', ref: 'Task' }],
    tasksLocked: [{ type: String, enum: ['Easy', 'Normal', 'Hard', 'Insane', 'Expert', 'Storyboard'] }],
    modders: [{ type: 'ObjectId', ref: 'User' }],
    bns: [{ type: 'ObjectId', ref: 'User' }],
    quest: { type: 'ObjectId', ref: 'Quest' },
    url: { type: String },
    mode: { type: String, enum: ['osu', 'taiko', 'catch', 'mania', 'hybrid'], default: 'osu' },
    length: { type: Number },
    packId: { type: Number },
    rankedDate: { type: Date },
    isShowcase: { type: Boolean },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
const queryHelpers = {
    sortByLastest() {
        return this.sort({ updatedAt: -1 });
    },
    defaultPopulate() {
        return this.populate([
            { path: 'host', select: '_id osuId username' },
            { path: 'bns', select: '_id osuId username' },
            { path: 'modders', select: '_id osuId username' },
            { path: 'quest', select: '_id name art modes deadline isMbc' },
            { path: 'song', select: 'artist title' },
            {
                path: 'tasks',
                populate: {
                    path: 'mappers',
                    select: '_id osuId username',
                },
            },
        ]);
    },
};
BeatmapSchema.query = queryHelpers;
BeatmapSchema.virtual('mappers').get(function () {
    const mappers = [];
    this.tasks.forEach(task => {
        if (task === null || task === void 0 ? void 0 : task.mappers) {
            task.mappers.forEach(mapper => {
                if (!mappers.includes(mapper.id)) {
                    mappers.push(mapper.id);
                }
            });
        }
    });
    return mappers;
});
const BeatmapModel = mongoose_1.default.model('Beatmap', BeatmapSchema);
exports.BeatmapModel = BeatmapModel;
