const config = require('../../config.json');
const mongoose = require('mongoose');
const qatDb = mongoose.createConnection(config.qat.connection, { useNewUrlParser: true })

const bnAppSchema = new mongoose.Schema({
    osuId: { type: Number, required: true },
    username: { type: String, required: true },
    mode: { type: String, enum: ['osu', 'taiko', 'catch', 'mania'], required: true },
    mods: [{ type: String }],
    //evaluations: [{type: 'ObjectId', ref: 'evaluation'}],
    consensus: { type: String, enum: ["accepted", "rejected"]}
    //testResult: [{ type: 'ObjectId', ref: 'rcTest'}],

}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const bnApp = qatDb.model('bnApp', bnAppSchema);

class bnAppService
{
    async query(params, populate, sorting, getAll) {
        let query;

        if (getAll) {
            query = bnApp.find(params);
        } else {
            query = bnApp.findOne(params);
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
            return await bnApp.findByIdAndUpdate(id, update, { 'new': true });
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }

    async create(osuId, username, mode, mods) {
        try {
            return await bnApp.create({osuId: osuId, username: username, mode: mode, mods: mods});
        } catch(error) {
            return { error: "could not create user" }
        }
    }
}

const service = new bnAppService();

module.exports = { bnApp, service };