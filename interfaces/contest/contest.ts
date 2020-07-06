import { User } from '../user';
import { Submission } from './submission';

export interface Contest {
    _id: any;
    id: string;
    name: string;
    isActive: boolean;
    contestStart: Date;
    screeningStart: Date;
    judgingStart: Date;
    resultsPublished: Date;
    submissions: Submission[];
    screeners: User[];
    judges: User[];
    voters: User[];
}
