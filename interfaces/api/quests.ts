import { User } from '@interfaces/user';
import { Quest } from '@interfaces/quest';
import { BasicError } from 'helpers/helpers';

export interface QuestPageOnLoad {
    quests: Quest[];
    mainMode: User['mainMode'];
}

export interface QuestsSearch {
    quests: Quest[];
}

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

export interface PublishQuestsData {
    quests: Partial<Quest>[];
}

export interface PublishQuests {
    quests: Quest[];
}

export type PublishQuestsResponse = PublishQuests | BasicError

export interface BasicResponse {
    success: string;
}

export type StatusResponse = BasicResponse | BasicError;
export type QuestResponse = Quest | BasicError;