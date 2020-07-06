import { Criteria } from './criteria';
import { Document } from 'mongoose';

export interface JudgingScore extends Document {
    _id: any;
    id: string;
    criteria: Criteria;
    score: number;
    comment: string;
}
