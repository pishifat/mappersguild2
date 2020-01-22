import { User } from './user';

export enum TaskName {
    Easy = 'Easy',
    Normal = 'Normal',
    Hard = 'Hard',
    Insane = 'Insane',
    Expert = 'Expert',
    Storyboard = 'Storyboard',
}

export enum TaskMode {
    Osu = 'osu',
    Taiko = 'taiko',
    Catch = 'catch',
    Mania = 'mania',
    SB = 'sb',
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

export interface Task {
    id: string;
    name: TaskName;
    mode: TaskMode;
    mappers: User[];
    status: TaskStatus;
    sbQuality: SBQuality;
}
