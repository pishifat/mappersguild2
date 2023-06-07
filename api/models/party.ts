import mongoose, { Schema, DocumentQuery, Model } from 'mongoose';
import { Party } from '../../interfaces/party';
import { User } from '../../interfaces/user';
import { QuestStatus } from '../../interfaces/quest';
import { SpentPointsCategory } from '../../interfaces/spentPoints';
import { SpentPointsModel } from '../models/spentPoints';
import { updateUserPoints } from '../helpers/points';

interface IPartyModel extends Model<Party, typeof queryHelpers> {
    defaultFindByIdOrFail (id: any): Promise<Party>;
}

const partySchema = new Schema<Party, IPartyModel>({
    leader: { type: 'ObjectId', ref: 'User' },
    pendingMembers: [{ type: 'ObjectId', ref: 'User' }],
    members: [{ type: 'ObjectId', ref: 'User' }],
    lock: { type: Boolean, default: false },
    rank: { type: Number, default: 0 },
    modes: [{ type: String, required: true }],
    quest: { type: 'ObjectId', ref: 'Quest', required: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const queryHelpers = {
    defaultPopulate<Q extends DocumentQuery<any, Party>>(this: Q) {
        return this.populate([
            { path: 'members' },
            { path: 'pendingMembers' },
            { path: 'leader' },
            { path: 'quest' },
        ]);
    },
};

partySchema.query = queryHelpers;

partySchema.methods.removeUser = async function (this: Party, userId: any) {
    const i = this.members.findIndex(m => m.id == userId);
    if (i !== -1) this.members.splice(i, 1);

    this.setPartyRank();
    await this.save();
};

partySchema.methods.setPartyRank = function (this: Party) {
    const rankSum = this.members.reduce((acc, m) => acc + m.rank, 0);

    this.rank = Math.round(rankSum / this.members.length);
};

partySchema.methods.addUser = async function (this: Party, user: User, isNotSelf: boolean, isLeader: boolean) {
    if (!this.quest) {
        throw new Error(`Couldn't find quest`);
    }

    await this.quest.populate({
        path: 'parties',
        populate: {
            path: 'members pendingMembers',
            select: 'id',
        },
    }).execPopulate();

    if (!isLeader && this.lock && !this.pendingMembers.some(m => m.id == user.id)) {
        throw new Error('Party is locked');
    }

    if (!isLeader && isNotSelf && this.quest.status != QuestStatus.Open && !this.pendingMembers.some(m => m.id == user.id)) {
        throw new Error('Cannot join in-progress quests without approval from party leader');
    }

    if (this.quest.parties.some(p => p.members.some(m => m.id == user.id))) {
        throw new Error('Already in a party for this quest');
    }

    if (this.pendingMembers.some(m => m.id == user.id)) {
        throw new Error('Already pending in this party');
    }

    if (user.availablePoints < this.quest.price && this.leader.availablePoints < this.quest.price*2) {
        throw new Error('Not enough points available to accept this quest');
    }

    if (this.members.length >= this.quest.maxParty) {
        throw new Error('Party has too many members!');
    }

    if (isNotSelf) {
        this.pendingMembers.push(user);
    } else {
        this.members.push(user);

        const i = this.pendingMembers.findIndex(m => m.id == user.id);
        if (i !== -1) this.pendingMembers.splice(i, 1);

        if (this.quest.status == QuestStatus.WIP) {
            if (user.availablePoints > this.quest.price) {
                await SpentPointsModel.generate(SpentPointsCategory.AcceptQuest, user.id, this.quest.id);
                await updateUserPoints(user.id);
            } else {
                await SpentPointsModel.generate(SpentPointsCategory.AcceptQuest, this.leader.id, this.quest.id);
                await updateUserPoints(this.leader.id);
            }
        }
    }

    this.setPartyRank();
    await this.save();
};

partySchema.statics.defaultFindByIdOrFail = function (this: IPartyModel, id: any) {
    return this
        .findById(id)
        .defaultPopulate()
        .orFail();
};

const PartyModel = mongoose.model<Party, IPartyModel>('Party', partySchema);

export { PartyModel };
