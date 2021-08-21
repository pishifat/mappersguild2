import mongoose, { Schema, DocumentQuery, Model } from 'mongoose';
import { Party } from '../../interfaces/party';
import { User } from '../../interfaces/user';

interface IPartyModel extends Model<Party, typeof queryHelpers> {
    defaultFindByIdOrFail (id: any): Promise<Party>;
}

const partySchema = new Schema<Party, IPartyModel>({
    leader: { type: 'ObjectId', ref: 'User' },
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

partySchema.methods.addUser = async function (this: Party, user: User) {
    if (!this.quest) {
        throw new Error(`Couldn't find quest`);
    }

    await this.quest.populate({
        path: 'parties',
        populate: {
            path: 'members',
            select: 'id',
        },
    }).execPopulate();

    if (this.quest.parties.some(p => p.members.some(m => m.id == user.id))) {
        throw new Error('Already in a party for this quest');
    }

    if (user.availablePoints < this.quest.price) {
        throw new Error('You do not have enough points available to accept this quest!');
    }

    if (this.members.length >= this.quest.maxParty) {
        throw new Error('Party has too many members!');
    }

    this.members.push(user);
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
