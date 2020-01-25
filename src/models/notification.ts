import { Beatmap } from './beatmap';
import { Party } from './party';

export interface Notification {
    id: string;
}

export enum ActionType {
    Collab = 'collaborate in a difficulty',
    Create = 'create a difficulty',
    Host = 'host',
    Join = 'join',
}

export interface Invite {
    id: string;
    actionType: ActionType;
    map: Beatmap;
    party: Party;
}
