import { Document } from 'mongoose';
import { User } from './user';
import { Quest, QuestMode } from './quest';

export interface Party extends Document {
    _id: any;
    id: string;
    leader: User;
    pendingMembers: User[];
    members: User[];
    lock: boolean;
    rank: number;
    modes: QuestMode[];
    quest: Quest;

    /**
     * - adds an user to the party
     * -updates the party rank
     * */
    addUser (user: User, isNotSelf: boolean, isLeader: boolean): Promise<void>;
    /**
     * - find and remove an user from members' array
     * - updates the party rank
     * */
    removeUser (userId: any): Promise<void>;
    /** set a new party rank when leaving/kicking/joining */
    setPartyRank (): void;
}
