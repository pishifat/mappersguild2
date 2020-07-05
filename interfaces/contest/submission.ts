import { User } from '../user';
import { Screening } from './screening';

export interface Submission {
    _id: any;
    id: string;
    name: string;
    creator: User;
    evaluations: Screening[];
}
