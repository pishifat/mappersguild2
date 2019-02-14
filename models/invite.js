const mongoose = require('mongoose');

var inviteSchema = new mongoose.Schema({
    recipient: { type: 'ObjectId', ref: 'User', required: true},
    sender: { type: 'ObjectId', ref: 'User', required: true},
    modified: { type: 'ObjectId', required: true },
    info: { type: String, required: true },
    actionType: { type: String, required: true },
    accepted: { type: Boolean },
    visible: {type: Boolean, default: true },

    map: { type: 'ObjectId', ref: 'Beatmap' }, //exists to link map when relevant. can be duplicate of "modified", but isn't becuase modified could be a task as well
    

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
            return { error: error._message };
        }
    }

    async update(id, update) {
        try {
            return await Invite.findByIdAndUpdate(id, update, { 'new': true });
        } catch(error) {
            return { error: error._message };
        }
    }

    async create(recipient, sender, modified, info, actionType) {
        var invite = new Invite({ recipient: recipient, sender: sender, modified: modified, info: info, actionType: actionType });
        try {
            return await invite.save();
        } catch(err) {
            console.log(err);
        }
    }
}

var service = new InviteService();

module.exports = { service };