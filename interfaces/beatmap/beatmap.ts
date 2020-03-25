import { Task, TaskName } from './task';
import { FeaturedSong } from '../featuredSong';
import { User } from '../user';
import { Quest } from '../quest';

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

export interface Beatmap {
    _id: any;
    id: string;
    song: FeaturedSong;
    host: User | User['_id'];
    status: BeatmapStatus;
    tasks: Task[] | Task['_id'][];
    tasksLocked: TaskName[];
    modders: User[];
    bns: User[];
    quest: Quest;
    url: string;
    mode: BeatmapMode;
    length: number;
    packId: number;
    mappers: User[];
    rankedDate: Date;
    updatedAt: Date;
    createdAt: Date;
}