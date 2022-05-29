import { User } from '../user';
import { Submission } from './submission';
import { Criteria } from './criteria';

export enum ContestStatus {
    Hidden = 'hidden',
    Beatmapping = 'beatmapping',
    Screening = 'screening',
    Judging = 'judging',
    Complete = 'complete',
}

export interface Contest {
    _id: any;
    id: string;
    name: string;
    creator: User;
    url: string;
    osuContestListingUrl: string;
    resultsUrl: string;
    status: ContestStatus;
    contestStart: Date;
    contestEnd: Date;
    submissions: Submission[];
    screeners: User[];
    judges: User[];
    judgingThreshold: number;
    criterias: Criteria[] | Criteria['_id'];
    download: string;
    description: string;
}
