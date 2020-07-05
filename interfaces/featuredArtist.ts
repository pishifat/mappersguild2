import { User } from './user';
import { FeaturedSong } from './featuredSong';

export interface FeaturedArtist {
    _id: any;
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
    isRejected: boolean; // no response
    isDenied: boolean; // literally said no
    isPriority: boolean;

    lastContacted: Date;
    projectedRelease?: Date;
    notes: string;
    assignedUser?: User;
}