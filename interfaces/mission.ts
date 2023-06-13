import { Document } from 'mongoose';
import { Beatmap } from './beatmap/beatmap';
import { FeaturedArtist } from './featuredArtist';

export enum MissionStatus {
    Open = 'open',
    Closed = 'closed',
}

export interface Mission extends Document {
    _id: any;
    id: string;
    name: string;
    tier: number;
    deadline: Date;
    objective: string;
    artists: FeaturedArtist[];
    status: string;
    /** virtual field to populate */
    associatedMaps: Beatmap[];
}