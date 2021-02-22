import { Document } from 'mongoose';
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
    Scheduled = 'scheduled',
}

export type QuestMode = Omit<BeatmapMode, BeatmapMode.Hybrid>;

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
    modes: QuestMode[];
    expiration: Date;
    accepted: Date;
    deadline: Date;
    completed: Date;
    queuedForCompletion: boolean;
    /** (virtual ref) */
    parties: Party[];
    /** (virtual) */
    currentParty: Party;
    /** virtual field to populate */
    associatedMaps: Beatmap[];
    isExpired: boolean;
    /** (virtual) */
    reopenPrice: number;

    /**
     * Unlink quest from all the beatmaps
     * @param userId if need to unlink only an user's specific beatmaps
     */
    dissociateBeatmaps (userId?: string): Promise<void>;

    /** Remove all the parties associated to this quest */
    removeParties (): Promise<void>;

    /**
     * - dissociate beatmaps
     * - remove parties
     * - hide quest
     * - update open quest's modes
     * @return Current open quest
     */
    drop (): Promise<Quest>;
}