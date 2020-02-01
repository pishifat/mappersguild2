import mongoose, { Document, Schema } from 'mongoose';
import BaseService from './baseService';
import { defaultErrorMessage, BasicError } from '../helpers/helpers';
import { Notification as INotification } from '../interfaces/notification';

export interface Notification extends INotification, Document {}

const notificationSchema = new Schema({
    recipient: { type: 'ObjectId', ref: 'User', required: true },
    sender: { type: 'ObjectId', ref: 'User' },
    modified: { type: 'ObjectId', required: true },
    info: { type: String, required: true },
    visible: { type: Boolean, default: true },

    map: { type: 'ObjectId', ref: 'Beatmap' }, //exists to link map when relevant. can be duplicate of "modified", but isn't because modified could be a task as well
    party: { type: 'ObjectId', ref: 'Party' },
    quest: { type: 'ObjectId', ref: 'Quest' },

}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const NotificationModel = mongoose.model<Notification>('Notification', notificationSchema);

class NotificationService extends BaseService<Notification>
{
    constructor() {
        super(
            NotificationModel,
            { updatedAt: -1 },
            [
                { path: 'sender', select: 'username osuId' },
                { path: 'map', populate: { path: 'song host' } },
                {
                    path: 'map', populate: {
                        path: 'tasks', populate: { path: 'mappers' },
                    },
                },
                { path: 'party', populate: { path: 'members leader' } },
                { path: 'quest', select: 'name' },
            ]
        );
    }

    async create(
        modified: Notification['modified'],
        info: Notification['info'],
        recipient: Notification['recipient'],
        sender: Notification['sender'],
        map: Notification['map']
    ): Promise<Notification | BasicError> {
        const notification = new NotificationModel({ modified, info, recipient, sender, map });

        try {
            return await notification.save();
        } catch (error) {
            return defaultErrorMessage;
        }
    }

    async createPartyNotification(
        modified: Notification['modified'],
        info: Notification['info'],
        recipient: Notification['recipient'],
        sender: Notification['sender'],
        party: Notification['party'],
        quest: Notification['quest']
    ): Promise<Notification | BasicError> {
        const notification = new NotificationModel({ modified, info, recipient, sender, party, quest });

        try {
            return await notification.save();
        } catch (error) {
            return defaultErrorMessage;
        }
    }
}

const service = new NotificationService();

export { service as NotificationService };
