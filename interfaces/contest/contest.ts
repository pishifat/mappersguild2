import { User } from '../user';
import { Submission } from './submission';

export enum ContestStatus {
    Beatmapping = 'beatmapping',
    Screening = 'screening',
    Judging = 'judging',
    Complete = 'complete',
}

export interface Contest {
    _id: any;
    id: string;
    name: string;
    status: ContestStatus;
    contestStart: Date;
    submissions: Submission[];
    screeners: User[];
    judges: User[];
    voters: User[];
    judgingThreshold: number;
}
