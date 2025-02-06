import { User } from './user';

export enum LogCategory {
    Beatmap = 'beatmap',
    Quest = 'quest',
    Party = 'party',
    User = 'user',
    Artist = 'artist',
    Error = 'error',
    Mission = 'mission',
    Mentorship = 'mentorship',
}

export interface Log extends Document {
    _id: any;
    id: string;
    user: User;
    action: string;
    category: LogCategory;
    createdAt?: Date;
}