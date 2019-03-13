const config = require('../../config.json');
const mongoose = require('mongoose');
const qatDb = mongoose.createConnection(config.qat.connection, { useNewUrlParser: true })

const evaluationSchema = new mongoose.Schema({
    evaluator: { type: 'ObjectId', ref: 'user' }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const evaluation = qatDb.model('evaluation', evaluationSchema);

class evaluationService
{
    async query(params, populate, sorting, getAll) {
        let query;

        if (getAll) {
            query = evaluation.find(params);
        } else {
            query = evaluation.findOne(params);
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
            return await evaluation.findByIdAndUpdate(id, update, { 'new': true });
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }

    async create(osuId, username, mode, mods) {
        try {
            return await evaluation.create({osuId: osuId, username: username, mode: mode, mods: mods});
        } catch(error) {
            return { error: "could not create user" }
        }
    }
}

const service = new evaluationService();

module.exports = { evaluation, service };