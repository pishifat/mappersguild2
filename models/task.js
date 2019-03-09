const mongoose = require('mongoose');
const logs = require('./log');

const taskSchema = new mongoose.Schema({
    name: { type: String, enum: ['Easy', 'Normal', 'Hard', 'Insane', 'Expert', 'Storyboard'], required: true },
    mode: { type: String, enum: ['osu', 'taiko', 'catch', 'mania', 'sb'], default: 'osu' },
    mappers: [{ type: 'ObjectId', ref: 'User', required: true }],
    status: { type: String, enum: ['WIP', 'Done'], default: 'WIP' },
    sbQuality: { type: Number, enum: [1, 2, 3] } //used to calculate points for sb
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const Task = mongoose.model('Task', taskSchema);

class TaskService
{
    async query(params, populate, sorting) {
        let query = Task.find(params);
        
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
            const res = await query.exec();

            if (res.length == 1) {
                return res[0];
            }
            return res;
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }

    async update(id, update) {
        try {
            return await Task.findByIdAndUpdate(id, update, { 'new': true });
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }

    async remove(id) {
        try {
            return await Task.findByIdAndRemove(id);
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }

    async create(data) {
        try {
            return await Task.create(data);
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }
}

const service = new TaskService();

module.exports = { service };