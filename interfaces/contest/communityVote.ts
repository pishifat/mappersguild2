import { User } from '../user';
import { Submission } from './submission';

export interface CommunityVote {
    _id: any;
    id: string;
    voter: User;
    submission: Submission;
    vote: number;
}
