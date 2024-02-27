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
exports.BeatmapModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const task_1 = require("../../../interfaces/beatmap/task");
const beatmap_1 = require("../../../interfaces/beatmap/beatmap");
const BeatmapSchema = new mongoose_1.Schema({
    song: { type: 'ObjectId', ref: 'FeaturedSong' },
    host: { type: 'ObjectId', ref: 'User', required: true },
    status: { type: String, enum: ['WIP', 'Done', 'Qualified', 'Ranked'], default: 'WIP' },
    tasks: [{ type: 'ObjectId', ref: 'Task' }],
    tasksLocked: [{ type: String, enum: task_1.SortedTasks }],
    modders: [{ type: 'ObjectId', ref: 'User' }],
    bns: [{ type: 'ObjectId', ref: 'User' }],
    quest: { type: 'ObjectId', ref: 'Quest' },
    mission: { type: 'ObjectId', ref: 'Mission' },
    url: { type: String },
    mode: { type: String, enum: ['osu', 'taiko', 'catch', 'mania', 'hybrid'], default: 'osu' },
    length: { type: Number },
    packId: { type: Number },
    rankedDate: { type: Date },
    submissionDate: { type: Date },
    isShowcase: { type: Boolean },
    queuedForRank: { type: Boolean },
    invalidForPoints: { type: Boolean },
    invalidReason: { type: String },
    skipWebhook: { type: Boolean },
    isWorldCup: { type: Boolean },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
const queryHelpers = {
    sortByLatest() {
        return this.sort({ createdAt: -1 });
    },
    defaultPopulate() {
        return this.populate([
            { path: 'host', select: '_id osuId username' },
            { path: 'bns', select: '_id osuId username' },
            { path: 'modders', select: '_id osuId username' },
            { path: 'quest', select: '_id name art modes deadline isMbc status' },
            { path: 'mission', select: '_id name tier status closingAnnounced' },
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
BeatmapSchema.methods.participated = function (userId) {
    if (!this.tasks)
        return false;
    return this.tasks.some(t => t.mappers.some(m => m.id == userId));
};
BeatmapSchema.methods.checkTaskAvailability = async function (user, taskName, taskMode, isAdmin) {
    if (isAdmin) {
        return true;
    }
    if (this.status == beatmap_1.BeatmapStatus.Ranked || this.status == beatmap_1.BeatmapStatus.Qualified || this.status == beatmap_1.BeatmapStatus.Done) {
        throw new Error(`Mapset already marked as ${this.status.toLowerCase()}`);
    }
    if (this.quest && taskName != task_1.TaskName.Storyboard && taskName != task_1.TaskName.Hitsounds) {
        await this.quest.populate({
            path: 'parties',
            populate: {
                path: 'members',
                select: 'id',
            },
        }).execPopulate();
        if (this.quest.currentParty && !this.quest.currentParty.members.some(m => m.id == user.id)) {
            throw new Error(`This mapset is part of a quest, so only members of the quest's current party can add difficulties!`);
        }
        if (!this.quest.modes.includes(taskMode)) {
            throw new Error(`The selected quest doesn't support beatmaps of this mode!`);
        }
    }
    if (this.tasks.length > 50) {
        throw new Error('This mapset has too many difficulties!');
    }
    if (taskName == task_1.TaskName.Storyboard &&
        this.tasks.some(t => t.name === task_1.TaskName.Storyboard)) {
        throw new Error('There can only be one storyboard on a mapset!');
    }
    if (taskName == task_1.TaskName.Hitsounds &&
        this.tasks.some(t => t.name === task_1.TaskName.Hitsounds)) {
        throw new Error('There can only be one set of hitsounds on a mapset!');
    }
    // host can bypass this
    if (this.host.id != user.id &&
        this.tasksLocked &&
        this.tasksLocked.some(t => t === taskName)) {
        throw new Error('This task is locked by the mapset host!');
    }
    return true;
};
const BeatmapModel = mongoose_1.default.model('Beatmap', BeatmapSchema);
exports.BeatmapModel = BeatmapModel;
