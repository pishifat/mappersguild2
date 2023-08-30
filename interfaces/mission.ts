import { Document } from 'mongoose';
import { Beatmap } from './beatmap/beatmap';
import { FeaturedArtist } from './featuredArtist';

export enum MissionStatus {
    Open = 'open',
    Closed = 'closed',
    Hidden = 'hidden',
}

export enum MissionMode {
    Osu = 'osu',
    Taiko = 'taiko',
    Catch = 'catch',
    Mania = 'mania',
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
    invalidBeatmaps: Beatmap[];
    modes: MissionMode[]
    /* for webhooks */
    openingAnnounced: boolean;
    closingAnnounced: boolean;
    /* user requirements. optional and growing */
    userMaximumRankedBeatmapsCount: number;
    userMaximumGlobalRank: number;
    userMaximumPp: number;
    /* beatmap requirements. optional and growing */
    beatmapEarliestSubmissionDate: Date;
    beatmapLatestSubmissionDate: Date;
    /** virtual field to populate */
    associatedMaps: Beatmap[];
}