import { User } from '../user';

export enum JudgingPlacement {
    First = 5,
    Second = 4,
    Third = 3,
    Fourth = 2,
    Fifth = 1,
    None = 0,
}

export interface Judging {
    _id: any;
    id: string;
    judge: User;
    comment: string;
    vote: JudgingPlacement;
}
