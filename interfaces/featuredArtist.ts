import { FeaturedSong } from './featuredSong';
import { User } from './user';

export enum FeaturedArtistStatus {
    Public = 'public',
    Private = 'private',
    Showcase = 'showcase',
}

export interface FeaturedArtist {
    _id: any;
    id: string;
    label: string;
    osuId: number;
    status: FeaturedArtistStatus;
    songs: FeaturedSong[];
    lastContacted: Date;
    notes: string;
    showcaseMappers: User[];

    // discussion
    isContacted: boolean;
    isResponded: boolean;
    tracksSelected: boolean;
    isRejected: boolean;

    // contract
    contractSent: boolean;
    artistSigned: boolean;
    ppyPaid: boolean;
    ppySigned: boolean;

    // publication
    projectedRelease?: Date;
    songsReceived: boolean;
    songsTimed: boolean;
    assetsReceived: boolean;
    isUpToDate: boolean;

    // other
    hasRankedMaps: boolean;
    isMinor: boolean;
    isGroup: boolean;
}