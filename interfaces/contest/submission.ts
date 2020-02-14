import { User } from '../user';
import { Judging } from './judging';

export interface Submission {
    _id: any;
    id: string;
    name: string;
    creator: User;
    evaluations: Judging[];
}
