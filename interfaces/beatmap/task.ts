import { Document } from 'mongoose';
import { User } from '../user';

export const SortedTasks = [
    'Easy',
    'Normal',
    'Hard',
    'Insane',
    'Expert',
    'Hitsounds',
    'Storyboard',
];

export enum TaskName {
    Easy = 'Easy',
    Normal = 'Normal',
    Hard = 'Hard',
    Insane = 'Insane',
    Expert = 'Expert',
    Hitsounds = 'Hitsounds',
    Storyboard = 'Storyboard',
}

export enum TaskMode {
    Osu = 'osu',
    Taiko = 'taiko',
    Catch = 'catch',
    Mania = 'mania',
    SB = 'sb',
    HS = 'hs',
}

export enum TaskStatus {
    WIP = 'WIP',
    Done = 'Done',
}

export enum SBQuality {
    Meh = 1,
    Ok = 2,
    Nice = 3,
}

export interface Task extends Document {
    _id: any;
    id: string;
    name: TaskName;
    mode: TaskMode;
    mappers: User[];
    status: TaskStatus;
    sbQuality: SBQuality;
}