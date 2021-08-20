import mongoose, { Document, Schema, Model } from 'mongoose';
import { Log as ILog } from '../interfaces/log';
import { User } from '../interfaces/user';

export interface Log extends ILog, Document {
    _id: any;
    id: string;
}

interface LogStatics extends Model<Log> {
    generate: (
        userId: User['_id'],
        action: Log['action'],
        category: Log['category']
    ) => void;
}

const logSchema = new Schema<Log, LogStatics>({
    user: { type: 'ObjectId', ref: 'User' },
    action: { type: String, required: true },
    category: { type: String, enum: ['beatmap', 'quest', 'party', 'user', 'artist', 'error'], required: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

class LogService
{
    static generate (
        userId: User['_id'],
        action: Log['action'],
        category: Log['category']
    ): void {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        const log = new LogModel({ user: userId, action, category });
        log.save();
    }
}

logSchema.loadClass(LogService);
const LogModel = mongoose.model<Log, LogStatics>('Log', logSchema);

export { LogModel };