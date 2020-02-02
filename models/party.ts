import mongoose, { Document, Schema } from 'mongoose';
import BaseService from './baseService';
import { BasicError } from '../helpers/helpers';
import { User } from './user';
import { BeatmapMode } from '../interfaces/beatmap/beatmap';
import { Party as IParty } from '../interfaces/party';

export interface Party extends IParty, Document {}

const partySchema = new Schema({
    leader: { type: 'ObjectId', ref: 'User' },
    members: [{ type: 'ObjectId', ref: 'User' }],
    lock: { type: Boolean, default: false },
    rank: { type: Number, default: 0 },
    modes: [{ type: String, required: true }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const PartyModel = mongoose.model<Party>('Party', partySchema);

class PartyService extends BaseService<Party>
{
    constructor() {
        super(
            PartyModel,
            { updatedAt: -1 },
            [
                { path: 'members', select: 'username osuId rank' },
                { path: 'leader', select: 'username osuId' },
            ]
        );
    }

    async create(userId: User['_id'], mode: Omit<BeatmapMode, BeatmapMode.Hybrid>): Promise<Party | BasicError> {
        try {
            const party: Party = new PartyModel({
                leader: userId,
                members: userId,
                modes: [mode],
            });

            return await PartyModel.create(party);
        } catch (error) {
            return { error: error._message };
        }
    }

    async createOrFail(userId: User['_id'], mode: Omit<BeatmapMode, BeatmapMode.Hybrid>): Promise<Party> {
        const party = await this.create(userId, mode);

        if (this.isError(party)) {
            throw new Error();
        }

        return party;
    }
}

const service = new PartyService();

export { service as PartyService };
