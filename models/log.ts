import mongoose, { Document, Schema } from 'mongoose';
import BaseService from './baseService';
import { defaultErrorMessage, BasicError } from '../helpers/helpers';
import { User } from './user';
import { Log as ILog } from '../interfaces/log';

export interface Log extends ILog, Document {}

const logSchema = new Schema({
    user: { type: 'ObjectId', ref: 'User' },
    action: { type: String, required: true },
    modified: { type: 'ObjectId' },
    category: { type: String, enum: ['beatmap', 'quest', 'party', 'user', 'artist', 'error'], required: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const LogModel = mongoose.model<Log>('Log', logSchema);

class LogService extends BaseService<Log>
{
    constructor() {
        super(
            LogModel,
            { createdAt: -1 },
            [
                { path: 'user', select: 'username' },
            ]
        );
    }

    async create(
        userId: User['_id'],
        action: Log['action'],
        modified: Log['modified'],
        category: Log['category']
    ): Promise<Log | BasicError> {
        const log = new LogModel({ user: userId, action, modified, category });

        try {
            return await log.save();
        } catch (error) {
            return defaultErrorMessage;
        }
    }
}

const service = new LogService();

export { service as LogService };