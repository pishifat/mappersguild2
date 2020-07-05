import mongoose, { Document, Schema, DocumentQuery, Model } from 'mongoose';
import { Party as IParty } from '../interfaces/party';

export interface Party extends IParty, Document {
    id: string;
}

const partySchema = new Schema({
    leader: { type: 'ObjectId', ref: 'User' },
    members: [{ type: 'ObjectId', ref: 'User' }],
    lock: { type: Boolean, default: false },
    rank: { type: Number, default: 0 },
    modes: [{ type: String, required: true }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const queryHelpers = {
    defaultPopulate<Q extends DocumentQuery<any, Party>>(this: Q) {
        return this.populate([
            { path: 'members', select: 'username osuId rank' },
            { path: 'leader', select: 'username osuId' },
        ]);
    },
};

partySchema.query = queryHelpers;
const PartyModel = mongoose.model<Party, Model<Party, typeof queryHelpers>>('Party', partySchema);

export { PartyModel };
