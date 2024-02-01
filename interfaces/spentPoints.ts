import { User } from './user';
import { Quest } from './quest';
import { Mission } from './mission';
import { Document } from 'mongoose';

export enum SpentPointsCategory {
    ExtendDeadline = 'extendDeadline',
    AcceptQuest = 'acceptQuest',
    ReopenQuest = 'reopenQuest',
    CreateQuest = 'createQuest',
    RerollShowcaseMissionSong = 'rerollShowcaseMissionSong',
}

export interface SpentPoints extends Document {
    _id: any;
    id: string;
    category: SpentPointsCategory;
    user: User['_id'] | User;
    quest?: Quest['_id'] | Quest;
    mission?: Mission['_id'] | Mission;
}