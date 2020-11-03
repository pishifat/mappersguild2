import { Document } from 'mongoose';

export enum CriteriaName {
    MusicalRepresentation = 'musical representation',
    Creativity = 'creativity',
    Gameplay = 'gameplay',
    Limitation = 'limitation',
    Theme = 'theme',
}

export interface Criteria extends Document {
    _id: any;
    id: string;
    name: CriteriaName;
    maxScore: number;
}
