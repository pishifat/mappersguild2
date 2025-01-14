import { Document } from 'mongoose';
import { Beatmap } from './beatmap/beatmap';
import { FeaturedArtist } from './featuredArtist';
import { User } from './user';
import { FeaturedSong } from './featuredSong';

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
    createdAt: Date;
    name: string;
    tier: number;
    deadline: Date;
    objective: string;
    artists: FeaturedArtist[];
    status: string;
    winCondition: string;
    winningBeatmaps: Beatmap[];
    invalidBeatmaps: Beatmap[];
    modes: MissionMode[];
    isShowcaseMission: boolean;
    isSeparate: boolean;
    remainingArtists: number;
    showcaseMissionSongs: {
        song: FeaturedSong;
        user: User;
    }[];
    /* for webhooks */
    openingAnnounced: boolean;
    closingAnnounced: boolean;
    /* user requirements. optional and growing */
    userMaximumRankedBeatmapsCount: number;
    userMaximumGlobalRank: number;
    userMaximumPp: number;
    userMinimumPp: number;
    userMinimumRank: number;
    /* beatmap requirements. optional and growing */
    beatmapEarliestSubmissionDate: Date;
    beatmapLatestSubmissionDate: Date;
    beatmapMinimumFavorites: number;
    beatmapMinimumPlayCount: number;
    beatmapMinimumLength: number;
    isUniqueToRanked: boolean;
    /** virtual field to populate */
    associatedMaps: Beatmap[];
}