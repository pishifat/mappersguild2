import { User } from '../user';
import { Entry } from './entry';

export interface Contest {
    _id: any;
    id: string;
    name: string;
    isActive: boolean;
    entries: Entry[];
    judges: User[];
    voters: User[];
}