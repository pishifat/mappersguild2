"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const baseService_1 = __importDefault(require("../baseService"));
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
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
const BeatmapModel = mongoose_1.default.model('Beatmap', BeatmapSchema);
BeatmapSchema.virtual('mappers').get(function () {
    const mappers = [];
    this.tasks.forEach(task => {
        var _a;
        if ((_a = task) === null || _a === void 0 ? void 0 : _a.mappers) {
            task.mappers.forEach(mapper => {
                if (!mappers.includes(mapper.id)) {
                    mappers.push(mapper.id);
                }
            });
        }
    });
    return mappers;
});
class BeatmapService extends baseService_1.default {
    constructor() {
        super(BeatmapModel, { updatedAt: -1 }, [
            { path: 'host', select: '_id osuId username' },
            { path: 'bns', select: '_id osuId username' },
            { path: 'modders', select: '_id osuId username' },
            { path: 'quest', select: '_id name art modes' },
            { path: 'song', select: 'artist title' },
            {
                path: 'tasks',
                populate: {
                    path: 'mappers',
                    select: '_id osuId username',
                },
            },
        ]);
    }
    create(userId, tasks, locks, song, mode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const beatmap = new BeatmapModel({
                    host: userId,
                    tasks,
                    tasksLocked: locks,
                    song,
                    mode,
                });
                return yield BeatmapModel.create(beatmap);
            }
            catch (error) {
                return { error: error._message };
            }
        });
    }
}
const service = new BeatmapService();
exports.BeatmapService = service;
