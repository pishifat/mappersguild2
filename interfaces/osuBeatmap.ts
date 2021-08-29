import { Document } from 'mongoose';
import { FeaturedArtist } from './featuredArtist';

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
    comment: string;
    administrators: string[];
    lastChecked: Date;
}