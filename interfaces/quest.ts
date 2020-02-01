import { User } from './user';
import { Beatmap, BeatmapMode } from './beatmap/beatmap';
import { Party } from './party';

export enum QuestStatus {
    Open = 'open',
    WIP = 'wip',
    Done = 'done'
}

export interface Quest extends Document {
    _id: any;
    id: string;
    name: string;
    reward: number;
    descriptionMain: string;
    timeframe: number;
    minParty: number;
    maxParty: number;
    minRank: number;
    art: number;
    status: QuestStatus;
    parties: Party[];
    modes: Omit<BeatmapMode, BeatmapMode.Hybrid>[];
    accepted: Date;
    deadline: Date;
    currentParty: Party;
    completed: Date;
    completedMembers: User[];
    /** virtual field to populate */
    associatedMaps: Beatmap[];
    /** Get the days between today and accepted date */
    overLimit: boolean;
}