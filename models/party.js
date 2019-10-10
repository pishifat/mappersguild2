const mongoose = require('mongoose');
const User = require('./user.js');
const logs = require('./log');

const partySchema = new mongoose.Schema({
    leader: { type: 'ObjectId', ref: 'User'},
    members: [{ type: 'ObjectId', ref: 'User'}],
    lock: { type: Boolean, default: false },
    rank: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    
    //used for legacy parties
    currentQuest: { type: 'ObjectId', ref: 'Quest' },
    name: { type: String },
    art: { type: Number },
    mode: { type: String, enum: ['osu', 'taiko', 'catch', 'mania'], default: 'osu' }

}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const Party = mongoose.model('Party', partySchema);

class PartyService
{
    async query(params, populate, sorting, getAll) {
        let query;
        if(getAll){
            query = Party.find(params);
        }else{
            query = Party.findOne(params);
        }
        
        if (populate) {
            for (let i = 0; i < populate.length; i++) {
                const p = populate[i];
                query.populate(p.populate, p.display);
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
            return await Party.findByIdAndUpdate(id, update, { 'new': true });
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }

    async create(userId) {
        try {
            return await Party.create({ 
                leader: userId,
                members: userId,
            });
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }

    async remove(id) {
        try {
            return await Party.findByIdAndDelete(id);
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }



    //soon to be trashed, but is used in index functions

    async getByLeader(osuId) {
        let user = await User.service.query({osuId: osuId});
        let party = await Party.findOne({ leader: user }).populate('currentQuest', '_id name').exec();
        if (party) {
            return party;
        } else {
            return undefined;
        }
    }


}

var service = new PartyService();

module.exports = { service };