import { User } from './user';
import { Quest } from './quest';

export enum SpentPointsCategory {
    ExtendDeadline = 'extendDeadline',
    AcceptQuest = 'acceptQuest',
    ReopenQuest = 'reopenQuest',
    CreateQuest = 'createQuest',
}

export interface SpentPoints extends Document {
    _id: any;
    id: string;
    category: SpentPointsCategory;
    user: User['_id'] | User;
    quest: Quest['_id'] | Quest;
}