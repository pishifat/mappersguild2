import { Document } from 'mongoose';
import { FeaturedArtist } from './featuredArtist';

export enum Comment {
    Exclusive = 'Exclusive',
    Price = 'Too expensive',
    Denied = 'Administrator rejected',
    NoResponse = 'No response',
    Unknown = `Can't contact administrator`,
    Other = 'Other',
    None = 'None',
}

export enum Administrator {
    Unknown = 'Unknown',
    Independent = 'Independent',
    Universal = 'Universal',
    Sony = 'Sony',
    Warner = 'Warner',
    JVCKenwood = 'JVCKenwood',
    // add more later
}

export interface OsuBeatmap extends Document {
    _id: any;
    id: string;
    beatmapsetOsuIds: number[];
    beatmapOsuIds: number[];
    artist: string;
    title: string;
    favourites: number;
    playcount: number;
    sources: string[];
    isLicensed: boolean;
    featuredArtists: FeaturedArtist[];
    comment: Comment;
    customComment: string;
    administrators: string[];
    lastChecked: Date;
}