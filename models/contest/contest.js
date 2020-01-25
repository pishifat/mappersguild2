const mongoose = require('mongoose');
const User = require('../user.js');
const Entry = require('./entry.js');
const logs = require('../log');

const contestSchema = new mongoose.Schema({
    name: { type: String },
    isActive: { type: Boolean, default: true },
    entries: [{ type: 'ObjectId', ref: 'Entry' }],
    judges: [{ type: 'ObjectId', ref: 'User' }],
    voters: [{ type: 'ObjectId', ref: 'User' }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const Contest = mongoose.model('Contest', contestSchema);

class ContestService
{
    async query(params, populate, sorting, getAll) {
        let query;
        if(getAll){
            query = Contest.find(params);
        }else{
            query = Contest.findOne(params);
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
            return await Contest.findByIdAndUpdate(id, update, { 'new': true });
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }

    async create(name) {
        try {
            return await Contest.create({ 
                name
            });
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }

    async remove(id) {
        try {
            return await Contest.findByIdAndDelete(id);
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }
}

var service = new ContestService();

module.exports = { service };