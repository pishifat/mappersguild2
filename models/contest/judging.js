const mongoose = require('mongoose');
const logs = require('../log');

const judgingSchema = new mongoose.Schema({
    comment: { type: String },
    vote: { type: Number, enum: [0, 1, 2, 3] },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const Judging = mongoose.model('Judging', judgingSchema);

class JudgingService
{
    async query(params, populate, sorting, getAll) {
        let query;
        if(getAll){
            query = Judging.find(params);
        }else{
            query = Judging.findOne(params);
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
            return await Judging.findByIdAndUpdate(id, update, { 'new': true });
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }

    async create(comment, vote) {
        try {
            return await Judging.create({ 
                comment,
                vote
            });
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }

    async remove(id) {
        try {
            return await Judging.findByIdAndDelete(id);
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }
}

var service = new JudgingService();

module.exports = { service };