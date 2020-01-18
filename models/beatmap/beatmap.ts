import mongoose, { Document, Schema } from 'mongoose';
import BaseService from '../baseService';
import { User } from '../user';
import { Task, TaskName } from './task';
import { FeaturedSong } from '../featuredSong';
import { Quest } from '../quest';
import { BasicError } from '../../helpers/helpers';

export enum BeatmapStatus {
    WIP = 'WIP',
    Done = 'Done',
    Qualified = 'Qualified',
    Ranked = 'Ranked',
}

export enum BeatmapMode {
    Osu = 'osu',
    Taiko = 'taiko',
    Catch = 'catch',
    Mania = 'mania',
    Hybrid = 'hybrid',
}

export enum ModeOrAny {
    Osu = 'osu',
    Taiko = 'taiko',
    Catch = 'catch',
    Mania = 'mania',
    Hybrid = 'hybrid',
    Any = 'any',
}

export interface Beatmap extends Document {
    song: FeaturedSong;
    host: User;
    status: BeatmapStatus;
    tasks: Task[];
    tasksLocked: TaskName[];
    modders: User[];
    bns: User[];
    quest: Quest;
    url: string;
    mode: BeatmapMode;
    length: number;
    packId: number;
    mappers: User[];
    updatedAt: Date;
    createdAt: Date;
}

const BeatmapSchema = new Schema({
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

const BeatmapModel = mongoose.model<Beatmap>('Beatmap', BeatmapSchema);

BeatmapSchema.virtual('mappers').get(function(this: Beatmap) {
    const mappers: User[] = [];

    this.tasks.forEach(task => {
        task.mappers.forEach(mapper => {
            if (!mappers.includes(mapper.id)) {
                mappers.push(mapper.id);
            }
        });
    });

    return mappers;
});

class BeatmapService extends BaseService<Beatmap> {
    constructor() {
        super(BeatmapModel, { updatedAt: -1 }, [
            { path: 'host', select: '_id osuId username' },
            { path: 'bns', select: '_id osuId username' },
            { path: 'modders', select: '_id osuId username' },
            { path: 'quest', select: '_id name art color modes' },
            { path: 'song',select: 'artist title' },
            {
                path: 'tasks',
                populate: {
                    path: 'mappers',
                },
            },
        ]);
    }

    async create(
        userId: Beatmap['host'],
        tasks: Beatmap['tasks'],
        locks: Beatmap['tasksLocked'],
        song: Beatmap['song'],
        mode: Beatmap['mode']
    ): Promise<Beatmap | BasicError> {
        try {
            const beatmap: Partial<Beatmap> = new BeatmapModel({
                host: userId,
                tasks,
                tasksLocked: locks,
                song,
                mode,
            });

            return await BeatmapModel.create(beatmap);
        } catch (error) {
            // logs.service.create(null, error, null, 'error');
            return { error: error._message };
        }
    }
}

const service = new BeatmapService();

export { service as BeatmapService };
