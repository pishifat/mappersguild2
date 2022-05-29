import { User } from '../user';
import { Screening } from './screening';
import { Contest } from './contest';
import { Judging } from './judging';

export interface Submission {
    _id: any;
    id: string;
    name: string;
    creator: User;
    url: string;
    /** Virtually populated */
    contest: Contest;
    /** Virtually populated */
    screenings: Screening[];
    /** Virtually populated */
    judgings: Judging[];
    /** Calculated client-side */
    total: number;
}
