import { User } from './user';
import { Beatmap, BeatmapMode } from './beatmap/beatmap';
import { Party } from './party';

export enum QuestStatus {
    Open = 'open',
    WIP = 'wip',
    Done = 'done',
    Pending = 'pending',
    Rejected = 'rejected',
    Hidden = 'hidden',
}

export interface Quest extends Document {
    _id: any;
    id: string;
    creator: User | User['_id'];
    name: string;
    price: number;
    descriptionMain: string;
    timeframe: number;
    requiredMapsets: number;
    minParty: number;
    maxParty: number;
    minRank: number;
    art: number;
    isMbc: boolean;
    status: QuestStatus;
    parties: Party[];
    modes: Omit<BeatmapMode, BeatmapMode.Hybrid>[];
    expiration: Date;
    accepted: Date;
    deadline: Date;
    currentParty: Party;
    completed: Date;
    completedMembers: User[];
    /** virtual field to populate */
    associatedMaps: Beatmap[];
    isExpired: boolean;
}