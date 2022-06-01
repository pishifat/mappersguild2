import { User } from '../user';
import { Submission } from './submission';

export enum ScreeningPlacement {
    First = 5,
    Second = 4,
    Third = 3,
    Fourth = 2,
    Fifth = 1,
    None = 0,
}

export interface Screening {
    _id: any;
    id: string;
    screener: User;
    submission: Submission;
    comment: string;
    vote: ScreeningPlacement;
}
