import { User } from './user';
import { Task, TaskName } from './task';
import { Quest } from './quest';
import { FeaturedSong } from './featuredSong';

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

export interface Beatmap {
    id: string;
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
    mappers: User[] | User['id'][];
    updatedAt: Date;
    createdAt: Date;
}
