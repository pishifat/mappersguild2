import { User } from '../user';
import { Submission } from './submission';

export interface Contest {
    _id: any;
    id: string;
    name: string;
    isActive: boolean;
    submissions: Submission[];
    judges: User[];
    voters: User[];
}
