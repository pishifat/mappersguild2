import mongoose, { Document, Schema } from 'mongoose';
import BaseService from './baseService';
import { User } from './user';
import { BeatmapMode } from './beatmap/beatmap';
import { BasicError } from '../helpers/helpers';

export interface Party extends Document {
    leader: User;
    members: User[];
    lock: boolean;
    rank: number;
    modes: Omit<BeatmapMode, BeatmapMode.Hybrid>;
}

const partySchema = new Schema({
    leader: { type: 'ObjectId', ref: 'User' },
    members: [{ type: 'ObjectId', ref: 'User' }],
    lock: { type: Boolean, default: false },
    rank: { type: Number, default: 0 },
    modes: { type: [String], required: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const PartyModel = mongoose.model<Party>('Party', partySchema);

class PartyService extends BaseService<Party>
{
    constructor() {
        super(PartyModel, { updatedAt: -1 }, [
            //
        ]);
    }

    async create(userId: User['_id'], mode: Omit<BeatmapMode, BeatmapMode.Hybrid>): Promise<Party | BasicError> {
        try {
            const party: Partial<Party> = new PartyModel({
                leader: userId,
                members: userId,
                modes: [mode],
            });

            return await PartyModel.create(party);
        } catch (error) {
            return { error: error._message };
        }
    }
}

const service = new PartyService();

export { service as PartyService };
