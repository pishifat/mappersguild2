import { User } from './user';
import { Beatmap } from './beatmap/beatmap';
import { Party } from './party';
import { Quest } from './quest';
import { TaskName, TaskMode, Task } from './beatmap/task';

export enum ActionType {
    Collab = 'collaborate in a difficulty',
    Create = 'create a difficulty',
    Join = 'join',
}

export interface Invite extends Document {
    _id: any;
    id: string;
    recipient: User;
    sender: User;
    /** Can be any of these objects Beatmap (Create) | Party (Join) | Task (Collab) */
    modified: Beatmap | Party | Task | Beatmap['_id'] | Task['_id'] | Party['_id'];
    info: string;
    actionType: ActionType;
    accepted: boolean;
    visible: boolean;
    /** Used when modified is a Task, duplicated of modified when it's a Beatmap */
    map: Beatmap;
    /** used for difficulty requests only */
    taskName: TaskName;
    /** used for difficulty requests only */
    taskMode: TaskMode;
    /** used for party requests only */
    party: Party;
    /** used for party requests only */
    quest: Quest;
    createdAt: Date;
}