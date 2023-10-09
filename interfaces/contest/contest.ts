import { User } from '../user';
import { Submission } from './submission';
import { Criteria } from './criteria';

export enum ContestStatus {
    Hidden = 'hidden',
    Beatmapping = 'beatmapping',
    Screening = 'screening',
    Judging = 'judging',
    Locked = 'locked',
    Complete = 'complete',
}

export enum ContestMode {
    Osu = 'osu',
    Taiko = 'taiko',
    Catch = 'catch',
    Mania = 'mania',
}

export interface Contest {
    _id: any;
    id: string;
    name: string;
    creators: User[];
    url: string;
    osuContestListingUrl: string;
    resultsUrl: string;
    isApproved: boolean;
    status: ContestStatus;
    contestStart: Date;
    contestEnd: Date;
    submissions: Submission[];
    screeners: User[];
    judges: User[];
    judgingThreshold: number;
    screeningVoteCount: number;
    criterias: Criteria[] | Criteria['_id'];
    download: string;
    description: string;
    mode: ContestMode;
    bannerUrl: string;
    isFeaturedArtistContest: boolean;
    isEligibleForPoints: boolean;
    useRawScoring: boolean;
}
