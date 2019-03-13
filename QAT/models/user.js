const config = require('../../config.json');
const mongoose = require('mongoose');
const qatDb = mongoose.createConnection(config.qat.connection, { useNewUrlParser: true })

const userSchema = new mongoose.Schema({
    osuId: { type: Number, required: true },
    username: { type: String, required: true },
    group: { type: String, enum: ["bn", "qat"] },
    modes: [{ type: String, enum: ["osu", "taiko", "catch", "mania"] }],
    applications: [{ type: 'ObjectId', ref: 'bnApp' }],
    probation: { type: Boolean },
    vetoMediator: { type: Boolean }, 
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const user = qatDb.model('user', userSchema);

class userService
{
    async query(params, populate, sorting, getAll) {
        let query;

        if (getAll) {
            query = user.find(params);
        } else {
            query = user.findOne(params);
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
            return { error: error._message };
        }
    }

    async update(id, update) {
        try {
            return await user.findByIdAndUpdate(id, update, { 'new': true });
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }

    async create(osuId, username, mode, mods) {
        try {
            return await user.create({osuId: osuId, username: username, mode: mode, mods: mods});
        } catch(error) {
            return { error: "could not create user" }
        }
    }
}

const service = new userService();

module.exports = { user, service };