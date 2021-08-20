/* eslint-disable @typescript-eslint/no-use-before-define */
import mongoose, { Document, Schema, Model } from 'mongoose';
import { Notification as INotification } from '../interfaces/notification';

export interface Notification extends INotification, Document {
    _id: any;
    id: string;
}

interface NotificationStatics extends Model<Notification> {
    generate: (
        modified: Notification['modified'],
        info: Notification['info'],
        recipient: Notification['recipient'],
        sender: Notification['sender'],
        map: Notification['map']
    ) => Promise<Notification>;

    generatePartyNotification: (
        modified: Notification['modified'],
        info: Notification['info'],
        recipient: Notification['recipient'],
        sender: Notification['sender'],
        party: Notification['party'],
        quest: Notification['quest']
    ) => Promise<Notification>;
}

const notificationSchema = new Schema<Notification, NotificationStatics>({
    recipient: { type: 'ObjectId', ref: 'User', required: true },
    sender: { type: 'ObjectId', ref: 'User' },
    modified: { type: 'ObjectId', required: true },
    info: { type: String, required: true },
    visible: { type: Boolean, default: true },

    map: { type: 'ObjectId', ref: 'Beatmap' }, //exists to link map when relevant. can be duplicate of "modified", but isn't because modified could be a task as well
    party: { type: 'ObjectId', ref: 'Party' },
    quest: { type: 'ObjectId', ref: 'Quest' },

}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

class NotificationService
{
    static generate (
        modified: Notification['modified'],
        info: Notification['info'],
        recipient: Notification['recipient'],
        sender: Notification['sender'],
        map: Notification['map']
    ): Promise<Notification> {
        const notification = new NotificationModel({ modified, info, recipient, sender, map });

        return notification.save();
    }

    static generatePartyNotification (
        modified: Notification['modified'],
        info: Notification['info'],
        recipient: Notification['recipient'],
        sender: Notification['sender'],
        party: Notification['party'],
        quest: Notification['quest']
    ): Promise<Notification> {
        const notification = new NotificationModel({ modified, info, recipient, sender, party, quest });

        return notification.save();
    }
}

notificationSchema.loadClass(NotificationService);
const NotificationModel = mongoose.model<Notification, NotificationStatics>('Notification', notificationSchema);

export { NotificationModel };
