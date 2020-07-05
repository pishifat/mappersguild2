import { User } from '../user';

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
    comment: string;
    vote: ScreeningPlacement;
}
