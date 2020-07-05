/* eslint-disable @typescript-eslint/no-use-before-define */
import mongoose, { Document, Schema, Model } from 'mongoose';
import { Invite as IInvite } from '../interfaces/invite';

export interface Invite extends IInvite, Document {
    id: string;
}

interface InviteStatics extends Model<Invite> {
    generateMapInvite: (
        recipient: Invite['recipient'],
        sender: Invite['sender'],
        modified: Invite['modified']['_id'],
        info: Invite['info'],
        actionType: Invite['actionType'],
        map: Invite['map'],
        taskName: Invite['taskName'],
        taskMode: Invite['taskMode']
    ) => Promise<Invite>;

    generatePartyInvite: (
        recipient: Invite['recipient'],
        sender: Invite['sender'],
        modified: Invite['modified'],
        info: Invite['info'],
        actionType: Invite['actionType'],
        party: Invite['party'],
        quest: Invite['quest']
    ) => Promise<Invite>;
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

class InviteService
{
    static generateMapInvite(
        recipient: Invite['recipient'],
        sender: Invite['sender'],
        modified: Invite['modified']['_id'],
        info: Invite['info'],
        actionType: Invite['actionType'],
        map: Invite['map'],
        taskName: Invite['taskName'],
        taskMode: Invite['taskMode']
    ): Promise<Invite> {
        let invite: Invite;

        if (taskName && taskMode) {
            invite = new InviteModel({ recipient, sender, modified, info, actionType, map, taskName, taskMode });
        } else {
            invite = new InviteModel({ recipient, sender, modified, info, actionType, map });
        }

        return invite.save();
    }

    static generatePartyInvite(
        recipient: Invite['recipient'],
        sender: Invite['sender'],
        modified: Invite['modified'],
        info: Invite['info'],
        actionType: Invite['actionType'],
        party: Invite['party'],
        quest: Invite['quest']
    ): Promise<Invite> {
        const invite = new InviteModel({ recipient, sender, modified, info, actionType, party, quest });

        return invite.save();
    }
}

inviteSchema.loadClass(InviteService);
const InviteModel = mongoose.model<Invite, InviteStatics>('Invite', inviteSchema);

export { InviteModel };
