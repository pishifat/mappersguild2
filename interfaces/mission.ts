import { Document } from 'mongoose';
import { Beatmap } from './beatmap/beatmap';
import { FeaturedArtist } from './featuredArtist';

export enum MissionStatus {
    Open = 'open',
    Closed = 'closed',
    Hidden = 'hidden',
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
    winCondition: string;
    winningBeatmaps: Beatmap[];
    /* for webhooks */
    openingAnnounced: boolean;
    closingAnnounced: boolean;
    /* user requirements. optional and growing */
    userMaximumRankedBeatmapsCount: number;
    userMaximumGlobalRank: number;
    /** virtual field to populate */
    associatedMaps: Beatmap[];
}