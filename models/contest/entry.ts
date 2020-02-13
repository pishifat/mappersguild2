import mongoose, { Document, Schema } from 'mongoose';
import BaseService from '../baseService';
import { BasicError } from '../../helpers/helpers';
import { Entry as IEntry } from '../../interfaces/contest/entry';
import { User } from '../user';

export interface Entry extends IEntry, Document {
    id: string;
}

const entrySchema = new Schema({
    name: { type: String },
    creator: { type: 'ObjectId', ref: 'User' },
    evaluations: [{ type: 'ObjectId', ref: 'Judging' }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const EntryModel = mongoose.model<Entry>('Entry', entrySchema);

class EntryService extends BaseService<Entry>
{
    constructor() {
        super(
            EntryModel,
            { createdAt: -1 },
            [
                {
                    path: 'evaluations',
                    populate: {
                        path: 'judge',
                        select: '_id osuId username',
                    },
                },
            ]
        );
    }

    async create(name: string, userId: User['_id']): Promise<Entry | BasicError> {
        try {
            return await EntryModel.create({
                name,
                userId,
            });
        } catch (error) {
            return { error: error._message };
        }
    }
}

const service = new EntryService();

export { service as EntryService };
