import { Document } from 'mongoose';

export interface Criteria extends Document {
    _id: any;
    id: string;
    name: string;
    maxScore: number;
}
