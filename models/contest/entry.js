const mongoose = require('mongoose');
const User = require('../user.js');
const Judging = require('./judging.js');
const logs = require('../log');

const entrySchema = new mongoose.Schema({
    name: { type: String },
    creator: { type: 'ObjectId', ref: 'User' },
    evaluations: [{ type: 'ObjectId', ref: 'Judging' }]
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const Entry = mongoose.model('Entry', entrySchema);

class EntryService
{
    async query(params, populate, sorting, getAll) {
        let query;
        if(getAll){
            query = Entry.find(params);
        }else{
            query = Entry.findOne(params);
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
            return await Entry.findByIdAndUpdate(id, update, { 'new': true });
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }

    async create(name, userId) {
        try {
            return await Entry.create({ 
                name,
                creator: userId
            });
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }

    async remove(id) {
        try {
            return await Entry.findByIdAndDelete(id);
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }
}

var service = new EntryService();

module.exports = { service };