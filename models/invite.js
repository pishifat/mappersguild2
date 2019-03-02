const mongoose = require('mongoose');
const logs = require('./log');

var inviteSchema = new mongoose.Schema({
    recipient: { type: 'ObjectId', ref: 'User', required: true},
    sender: { type: 'ObjectId', ref: 'User', required: true},
    modified: { type: 'ObjectId', required: true },
    info: { type: String, required: true },
    actionType: { type: String, required: true, enum: ['collaborate in a difficulty', 'create a difficulty', 'host', 'join'] },
    accepted: { type: Boolean },
    visible: {type: Boolean, default: true },

    map: { type: 'ObjectId', ref: 'Beatmap' }, //exists to link map when relevant. can be duplicate of "modified", but isn't becuase modified could be a task as well
    taskName: { type: String }, //used for difficulty requests only
    party: { type: 'ObjectId', ref: 'Party' },
    

}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

var Invite = mongoose.model('Invite', inviteSchema);

class InviteService
{
    async query(params, populate, sorting, getAll) {
        let query;
        
        if(getAll){
            query = Invite.find(params);
        }else{
            query = Invite.findOne(params);
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
            return await Invite.findByIdAndUpdate(id, update, { 'new': true });
        } catch(error) {
            logs.service.create(null, error, null, 'error');
            return { error: error._message };
        }
    }

    async createMapInvite(recipient, sender, modified, info, actionType, map, taskName) {
        if(taskName){
            var invite = new Invite({ recipient: recipient, sender: sender, modified: modified, info: info, actionType: actionType, map: map, taskName: taskName });
        }else{
            var invite = new Invite({ recipient: recipient, sender: sender, modified: modified, info: info, actionType: actionType, map: map });
        }
        try {
            return await invite.save();
        } catch(error) {
            logs.service.create(null, error, null, 'error');
        }
    }

    async createPartyInvite(recipient, sender, modified, info, actionType, party) {
        var invite = new Invite({ recipient: recipient, sender: sender, modified: modified, info: info, actionType: actionType, party: party });
        try {
            return await invite.save();
        } catch(error) {
            logs.service.create(null, error, null, 'error');
        }
    }
}

var service = new InviteService();

module.exports = { service };