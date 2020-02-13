import { User } from '../user';

export enum JudgingPlacement {
    first = 5,
    second = 4,
    third = 3,
    fourth = 2,
    fifth = 1,
    none = 0,
}

export interface Judging {
    _id: any;
    id: string;
    judge: User;
    comment: string;
    vote: JudgingPlacement;
}