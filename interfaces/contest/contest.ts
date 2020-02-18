import { User } from '../user';
import { Submission } from './submission';

export interface Contest {
    _id: any;
    id: string;
    name: string;
    isActive: boolean;
    contestStart: Date;
    judgingStart: Date;
    resultsPublished: Date;
    submissions: Submission[];
    judges: User[];
    voters: User[];
}
