import mongoose, { Document, Schema } from 'mongoose';
import BaseService from './baseService';
import { defaultErrorMessage, BasicError } from '../helpers/helpers';
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
    recipient: User;
    sender: User;
    /** Can be any of these objects (Beatmap | Party) */
    modified: Beatmap | Party;
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
}

const inviteSchema = new Schema({
    recipient: { type: 'ObjectId', ref: 'User', required: true },
    sender: { type: 'ObjectId', ref: 'User', required: true },
    modified: { type: 'ObjectId', required: true },
    info: { type: String, required: true },
    actionType: { type: String, required: true, enum: ['collaborate in a difficulty', 'create a difficulty', 'host', 'join'] },
    accepted: { type: Boolean },
    visible: { type: Boolean, default: true },

    map: { type: 'ObjectId', ref: 'Beatmap' }, //exists to link map when relevant. can be duplicate of "modified", but isn't becuase modified could be a task as well
    taskName: { type: String }, //used for difficulty requests only
    taskMode: { type: String },
    party: { type: 'ObjectId', ref: 'Party' },
    quest: { type: 'ObjectId', ref: 'Quest' },


}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const InviteModel = mongoose.model<Invite>('Invite', inviteSchema);

class InviteService extends BaseService<Invite>
{
    constructor() {
        super(InviteModel, { updatedAt: -1 }, [
            { path: 'sender', select: 'username osuId' },
            { path: 'map', populate: { path: 'song host' } },
            {
                path: 'map', populate: {
                    path: 'tasks', populate: { path: 'mappers' },
                },
            },
            { path: 'party', populate: { path: 'members leader' } },
            {
                path: 'quest', populate: {
                    path: 'currentParty', populate: { path: 'members' },
                },
            },
        ]);
    }

    async createMapInvite(
        recipient: Invite['recipient'],
        sender: Invite['sender'],
        modified: Invite['modified']['_id'],
        info: Invite['info'],
        actionType: Invite['actionType'],
        map: Invite['map'],
        taskName: Invite['taskName'],
        taskMode: Invite['taskMode']
    ): Promise<Invite | BasicError> {
        let invite: Invite;

        if (taskName && taskMode) {
            invite = new InviteModel({ recipient, sender, modified, info, actionType, map, taskName, taskMode });
        } else {
            invite = new InviteModel({ recipient, sender, modified, info, actionType, map });
        }

        try {
            return await invite.save();
        } catch (error) {
            return defaultErrorMessage;
        }
    }

    async createPartyInvite(
        recipient: Invite['recipient'],
        sender: Invite['sender'],
        modified: Invite['modified'],
        info: Invite['info'],
        actionType: Invite['actionType'],
        party: Invite['party'],
        quest: Invite['quest']
    ): Promise<Invite | BasicError> {
        const invite = new InviteModel({ recipient, sender, modified, info, actionType, party, quest });

        try {
            return await invite.save();
        } catch (error) {
            return defaultErrorMessage;
        }
    }
}

const service = new InviteService();

export { service as InviteService };
