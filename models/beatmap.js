const mongoose = require('mongoose');
const logs = require('./log');

const beatmapSchema = new mongoose.Schema({
    song: { type: 'ObjectId', ref: 'FeaturedSong' },
    host: { type: 'ObjectId', ref: 'User', required: true },
    status: { type: String, enum: ['WIP', 'Done', 'Qualified', 'Ranked'], default: 'WIP' },
    tasks: [{ type: 'ObjectId', ref: 'Task' }],
    tasksLocked: [{ type: String, enum: ['Easy', 'Normal', 'Hard', 'Insane', 'Expert', 'Storyboard'] }],
    modders: [{ type: 'ObjectId', ref: 'User' }],
    bns: [{ type: 'ObjectId', ref: 'User' }],
    quest: { type: 'ObjectId', ref: 'Quest' },
    url: { type: String },
    mode: { type: String, enum: ['osu', 'taiko', 'catch', 'mania'], default: "osu" },
    length: { type: Number },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const Beatmap = mongoose.model('Beatmap', beatmapSchema);

class BeatmapService
{
    async query(params, populate, sorting, getAll) {
        let query;

        if (getAll) {
            query = Beatmap.find(params);
        } else {
            query = Beatmap.findOne(params);
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
            return await Beatmap.findByIdAndUpdate(id, update, { 'new': true });
        } catch(error) {
            logs.service.create(null, error, null, 'error');
            return { error: error._message };
        }
    }

    async remove(id) {
        try {
            return await Beatmap.findByIdAndRemove(id);
        } catch(error) {
            logs.service.create(null, error, null, 'error');
            return { error: error._message };
        }
    }

    async create(userId, tasks, locks, song, mode) {
        try {
            return await Beatmap.create({ 
                host: userId,
                tasks: tasks,
                tasksLocked: locks,
                song: song,
                mode: mode
            });
        } catch(error) {
            logs.service.create(null, error, null, 'error');
            return { error: error._message };
        }
    }
}

const service = new BeatmapService();

module.exports = { service };