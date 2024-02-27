import { Document } from 'mongoose';

export interface Note extends Document {
    _id: any;
    id: string;
    name: string;
    content: string;
}