import { Task, TaskName } from './task';
import { FeaturedSong } from '../featuredSong';
import { User } from '../user';
import { Quest } from '../quest';
import { Mission } from '../mission';

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
    host: User;
    status: BeatmapStatus;
    tasks: Task[];
    tasksLocked: TaskName[];
    modders: User[];
    bns: User[];
    quest: Quest | undefined;
    mission: Mission | undefined;
    url: string;
    mode: BeatmapMode;
    packId: number;
    updatedAt: Date;
    createdAt: Date;
    isShowcase: boolean;
    queuedForRank: boolean;
    invalidForPoints: boolean;
    invalidReason: string;
    skipWebhook: boolean;
    isWorldCup: boolean;
    isBundled: boolean;
    /* from osu! API */
    length: number;
    rankedDate: Date;
    submissionDate: Date;
    favorites: number;
    playCount: number;
}