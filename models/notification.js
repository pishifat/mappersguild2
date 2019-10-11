const mongoose = require('mongoose');
const logs = require('./log');

var notificationSchema = new mongoose.Schema({
    recipient: { type: 'ObjectId', ref: 'User', required: true },
    sender: { type: 'ObjectId', ref: 'User' },
    modified: { type: 'ObjectId', required: true },
    info: { type: String, required: true },
    visible: {type: Boolean, default: true },

    map: { type: 'ObjectId', ref: 'Beatmap' }, //exists to link map when relevant. can be duplicate of "modified", but isn't becuase modified could be a task as well
    party: { type: 'ObjectId', ref: 'Party' },
    quest: { type: 'ObjectId', ref: 'Quest' },

}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

var Notification = mongoose.model('Notification', notificationSchema);

class NotificationService
{
    async query(params, populate, sorting, getAll) {
        let query;
        
        if(getAll){
            query = Notification.find(params);
        }else{
            query = Notification.findOne(params);
        }
         
        if (populate) {
            for (let i = 0; i < populate.length; i++) {
                const p = populate[i];
                if (p.innerPopulate) {
                    query.populate({ path: p.innerPopulate, populate: p.populate });
                } else {
                    query.populate(p.populate, p.display);
                }
            }
        }

        if (sorting) {
            query.sort(sorting);
        }

        try {
            return await query.exec();
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }

    async update(id, update) {
        try {
            return await Notification.findByIdAndUpdate(id, update, { 'new': true });
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }

    async create(modified, info, recipient, sender, map) {
        var notification = new Notification({ modified: modified, info: info, recipient: recipient, sender: sender, map: map });
        try {
            return await notification.save();
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
        }
    }

    async createPartyNotification(modified, info, recipient, sender, party, quest) {
        var notification = new Notification({ modified: modified, info: info, recipient: recipient, sender: sender, party: party, quest: quest });
        try {
            return await notification.save();
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
        }
    }
}

var service = new NotificationService();

module.exports = { service };