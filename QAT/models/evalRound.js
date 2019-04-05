const config = require('../../config.json');
const mongoose = require('mongoose');
const qatDb = mongoose.createConnection(config.qat.connection, { useNewUrlParser: true })

const evalRoundSchema = new mongoose.Schema({
    bn: { type: 'ObjectId', ref: 'QatUser', required: true },
    evaluations: [{ type: 'ObjectId', ref: 'Evaluation' }],
    deadline: { type: Date , required: true, default: new Date() },
    active: { type: Boolean, default: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const EvalRound = qatDb.model('EvalRound', evalRoundSchema);

class EvalRoundService
{
    async query(params, populate, sorting, getAll) {
        let query;

        if (getAll) {
            query = EvalRound.find(params);
        } else {
            query = EvalRound.findOne(params);
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
            return await EvalRound.findByIdAndUpdate(id, update, { 'new': true });
        } catch(error) {
            return { error: error._message };
        }
    }

    async create(evaluatorId, behaviorComment, moddingComment, vote) {
        try {
            return await EvalRound.create({evaluator: evaluatorId, behaviorComment: behaviorComment, moddingComment: moddingComment, vote: vote});
        } catch(error) {
            return { error: error._message }
        }
    }
}

const service = new EvalRoundService();

module.exports = { service, EvalRound };