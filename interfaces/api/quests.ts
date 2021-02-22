import { Quest } from '../quest';
import { ErrorResponse } from './shared';

export interface SubmitQuestData {
    name: string;
    price: number;
    descriptionMain: string;
    timeframe: number;
    minParty: number;
    maxParty: number;
    art: string;
    requiredMapsets: number;
}

export interface ScheduleQuestsData {
    quests: Partial<Quest>[];
}

export interface ScheduleQuests {
    quests: Quest[];
}

export type ScheduleQuestsResponse = ScheduleQuests | ErrorResponse;

export type QuestResponse = Quest | ErrorResponse;

export interface ExtendDeadlineResponse {
    quest: Quest;
    availablePoints: number;
}

export interface PointsRefreshResponse {
    quests: Quest[];
    availablePoints: number;
}
