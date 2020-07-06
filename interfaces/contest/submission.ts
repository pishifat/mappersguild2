import { User } from '../user';
import { Screening } from './screening';
import { Contest } from './contest';
import { Judging } from './judging';

export interface Submission {
    _id: any;
    id: string;
    name: string;
    creator: User;
    evaluations: Screening[];
    /** Virtually populated */
    contest: Contest;
    /** Virtually populated */
    judgings: Judging[];
}
