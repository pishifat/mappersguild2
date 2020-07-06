import { User } from 'interfaces/user';
import { Submission } from './submission';
import { JudgingScore } from './judgingScore';
import { Document } from 'mongoose';

export interface UserScore {
    creator: User;
    criteriaSum: {
        criteriaId: string;
        sum: number;
    }[];
    judgingSum: {
        judgeId: string;
        sum: number;
        standardized: number;
    }[];
    rawFinalScore: number;
    standardizedFinalScore: number;
}

export interface JudgeCorrel {
    id: string;
    rawAvg: number;
    avg: number;
    sd: number;
    correl: number;
}

export interface Judging extends Document {
    _id: any;
    id: string;
    judge: User;
    submission: Submission;
    judgingScores: JudgingScore[];
}
