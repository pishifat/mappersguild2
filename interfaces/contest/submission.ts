import { User } from '../user';
import { Screening } from './screening';
import { Contest } from './contest';
import { Judging } from './judging';
import { CommunityVote } from './communityVote';

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
    communityVotes: CommunityVote[];
    /** Calculated client-side */
    total: number;
}
