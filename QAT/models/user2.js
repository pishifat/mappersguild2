const mongoose = require('mongoose');

var qatUserSchema = new mongoose.Schema({
    osuId: { type: Number, required: true, unique: true },
    username: { type: String, required: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

var qatUser = mongoose.model('qatUser', qatUserSchema);

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
        console.log(await query.exec())
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
        console.log(osuId + username)
        try {
            return await qatUser.create({ osuId: osuId, username: username });
        } catch(error) {
            return { error: error._message }
        }
    }
}

var service = new qatUserService();

module.exports = { qatUser, service };