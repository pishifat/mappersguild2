import { User } from './user';

export interface FeaturedSong {
    id: string;
    artist: string;
    title: string;
    featuredArtist: FeaturedArtist;
}

export interface FeaturedArtist {
    id: string;
    label: string;
    osuId: number;
    songs: FeaturedSong[];

    isContacted: boolean;
    isResponded: boolean;
    tracksSelected: boolean;
    contractSent: boolean;
    contractSigned: boolean;
    contractPaid: boolean;
    songsTimed: boolean;
    songsReceived: boolean;
    assetsReceived: boolean;
    bioWritten: boolean;
    isInvited: boolean;
    isUpToDate: boolean;
    isStalled: boolean;
    isRejected: boolean;
    isPriority: boolean;

    lastContacted: Date;
    projectedRelease: Date;
    notes: string;
    assignedUser: User;
}
