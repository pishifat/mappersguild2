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
    isNotifiedOfRelease: boolean;
    songsReceived: boolean;
    songsTimed: boolean;
    assetsReceived: boolean;
    isUpToDate: boolean;

    // other
    hasRankedMaps: boolean;
    isMinor: boolean;
    isMonstercat: boolean;

    // showcase mappers
    referenceUrl: string;
    oszTemplatesUrl: string;
    showcaseMappers: User[];
    offeredUsers: User[];
}