import { User } from './user';

export enum LogCategory {
    Beatmap = 'beatmap',
    Quest = 'quest',
    Party = 'party',
    User = 'user',
    Artist = 'artist',
    Error= 'error',
}

export interface Log extends Document {
    _id: any;
    id: string;
    user: User;
    action: string;
    category: LogCategory;
}