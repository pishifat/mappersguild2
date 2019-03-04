const mongoose = require('mongoose');
const User = require('./user.js');

var logSchema = new mongoose.Schema({
    user: { type: 'ObjectId', ref: 'User'},
    action: { type: String, required: true },
    modified: { type: 'ObjectId' },
    category: {type: String, enum: ['beatmap', 'quest', 'party', 'user', 'artist', 'error'], required: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

var Log = mongoose.model('Log', logSchema);

class LogService
{
    async query(params, populate, sorting, getAll, limit, skip) {
        let query;
        
        if(getAll){
            query = Log.find(params);
        }else{
            query = Log.findOne(params);
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

        if (skip) {
            query.skip(skip);
        }

        if (limit) {
            query.limit(limit);
        }
        
        try {
            return await query.exec();
        } catch(error) {
            return { error: error._message };
        }
    }

    async create(userId, action, modified, category) {
        const log = new Log({ user: userId, action: action, modified: modified, category: category });
        try {
            return await log.save();
        } catch(err) {
            console.log(err);
        }
    }
}

var service = new LogService();

module.exports = { service };