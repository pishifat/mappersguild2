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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeatmapModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const task_1 = require("../../interfaces/beatmap/task");
const invite_1 = require("../../interfaces/invite");
const user_1 = require("../../interfaces/user");
const beatmap_1 = require("../../interfaces/beatmap/beatmap");
const BeatmapSchema = new mongoose_1.Schema({
    song: { type: 'ObjectId', ref: 'FeaturedSong' },
    host: { type: 'ObjectId', ref: 'User', required: true },
    status: { type: String, enum: ['WIP', 'Done', 'Qualified', 'Ranked', 'Secret'], default: 'WIP' },
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
            { path: 'quest', select: '_id name art modes deadline isMbc status' },
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
BeatmapSchema.methods.checkTaskAvailability = function (user, taskName, taskMode, inviteType, acceptingTaskId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.status == beatmap_1.BeatmapStatus.Ranked || this.status == beatmap_1.BeatmapStatus.Qualified || this.status == beatmap_1.BeatmapStatus.Done) {
            throw new Error(`Mapset already marked as ${this.status.toLowerCase()}`);
        }
        if (this.quest && taskName != task_1.TaskName.Storyboard) {
            yield this.quest.populate({
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
        if (this.bns.some(bn => bn.id == user.id)) {
            throw new Error(`Cannot create a difficulty while in BN list!`);
        }
        if (this.tasks.length > 20 && inviteType !== invite_1.ActionType.Collab) {
            throw new Error('This mapset has too many difficulties!');
        }
        if ((!inviteType || inviteType === invite_1.ActionType.Create) &&
            taskName == task_1.TaskName.Storyboard &&
            this.tasks.some(t => t.name === task_1.TaskName.Storyboard)) {
            throw new Error('There can only be one storyboard on a mapset!');
        }
        if (inviteType !== invite_1.ActionType.Collab &&
            this.host.id != user.id &&
            this.tasksLocked &&
            this.tasksLocked.some(t => t === taskName)) {
            throw new Error('This task is locked by the mapset host!');
        }
        if (acceptingTaskId && inviteType === invite_1.ActionType.Collab) {
            const task = this.tasks.find(t => t.id == acceptingTaskId);
            if (!task) {
                throw new Error(`Task doesn't exist anymore!`);
            }
            if (task.mappers.some(m => m.id == user.id)) {
                throw new Error(`You're already a mapper on this task!`);
            }
        }
        if (this.status == beatmap_1.BeatmapStatus.Secret && user.group !== user_1.UserGroup.Admin && user.group !== user_1.UserGroup.Secret) {
            throw new Error('Cannot invite to non-showcase users!');
        }
        return true;
    });
};
const BeatmapModel = mongoose_1.default.model('Beatmap', BeatmapSchema);
exports.BeatmapModel = BeatmapModel;
