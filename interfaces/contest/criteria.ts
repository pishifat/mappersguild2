import { Document } from 'mongoose';

export enum CriteriaName {
    Creativity = 'creativity',
    JudgeImpression = 'judge impression',
}

export interface Criteria extends Document {
    _id: any;
    id: string;
    name: CriteriaName;
    maxScore: number;
}
