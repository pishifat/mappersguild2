import { User } from './user';
import { Beatmap } from './beatmap/beatmap';
import { Party } from './party';
import { Task } from './beatmap/task';
import { Invite } from './invite';
import { Quest } from './quest';

export interface Notification extends Document {
    _id: any;
    id: string;
    recipient: User;
    sender: User;
    /** Can be any of these objects (Beatmap | Party | Task | Invite) */
    modified: Beatmap | Party | Task | Invite;
    info: string;
    visible: boolean;
    /** exists to link map when relevant. can be duplicate of "modified", but isn't because modified could be a task as well */
    map: Beatmap;
    party: Party;
    quest: Quest;
}