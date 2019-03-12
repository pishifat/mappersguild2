const config = require('../../config.json');
const mongoose = require('mongoose');
const qatDb = mongoose.createConnection(config.qat.connection, { useNewUrlParser: true })

const qatUserSchema = new mongoose.Schema({
    osuId: { type: Number, required: true, unique: true },
    username: { type: String, required: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const qatUser = qatDb.model('qatUser', qatUserSchema);

class qatUserService
{
    async query(params, populate, sorting, getAll) {
        let query;

        if (getAll) {
            query = qatUser.find(params);
        } else {
            query = qatUser.findOne(params);
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
            return await qatUser.findByIdAndUpdate(id, update, { 'new': true });
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }

    async create(osuId, username) {
        try {
            return await qatUser.create({ osuId: osuId, username: username });
        } catch(error) {
            return { error: error._message }
        }
    }
}

const service = new qatUserService();

module.exports = { qatUser, service };