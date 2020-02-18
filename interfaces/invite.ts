import { User } from './user';
import { Beatmap } from './beatmap/beatmap';
import { Party } from './party';
import { Quest } from './quest';
import { TaskName, TaskMode } from './beatmap/task';

export enum ActionType {
    Collab = 'collaborate in a difficulty',
    Create = 'create a difficulty',
    Host = 'host',
    Join = 'join',
}

export interface Invite extends Document {
    _id: any;
    id: string;
    recipient: User;
    sender: User;
    /** Can be any of these objects (Beatmap | Party) */
    modified: Beatmap | Party | Beatmap['_id'] | Party['_id'];
    info: string;
    actionType: ActionType;
    accepted: boolean;
    visible: boolean;
    /** exists to link map when relevant. can be duplicate of "modified", but isn't becuase modified could be a task as well */
    map: Beatmap;
    /** used for difficulty requests only */
    taskName: TaskName;
    taskMode: TaskMode;
    party: Party;
    quest: Quest;
    createdAt: Date;
}