const config = require('../../config.json');
const mongoose = require('mongoose');
const qatDb = mongoose.createConnection(config.qat.connection, { useNewUrlParser: true });
const questions = require('./question');

const testSubmission = new mongoose.Schema({
    applicant: { type: 'ObjectId', ref: 'QatUser', required: true },
    mode: { type: String, enum: ['osu', 'taiko', 'catch', 'mania'] },
    status: { type: String, enum: ['tbd', 'wip', 'finished'], default: 'tbd' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

testSubmission.virtual('answers', {
    ref: 'Answer',
    localField: 'id',
    foreignField: 'test',
});

const testAnswer = new mongoose.Schema({
    test: { type: 'ObjectId', ref: 'TestSubmission', required: true },
    question: { type: 'ObjectId', ref: 'Question', required: true },
    optionChose: { type: 'ObjectId', ref: 'Option' },
    feedback: { type: String },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const TestAnswer = qatDb.model('TestAnswer', testAnswer);
const TestSubmission = qatDb.model('TestSubmission', testSubmission);

class TestSubmissionService
{
    async query(params, populate, sorting, getAll) {
        let query;

        if (getAll) {
            query = TestSubmission.find(params);
        } else {
            query = TestSubmission.findOne(params);
        }

        if (populate) {
            for (let i = 0; i < populate.length; i++) {
                const p = populate[i];

                if (p.innerPopulate) {
                    query.populate({ path: p.innerPopulate, model: p.model, populate: p.populate });
                } else {
                    query.populate(p.populate, p.display, p.model);
                }
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
            return await TestSubmission.findByIdAndUpdate(id, update, { 'new': true });
        } catch(error) {
            return { error: error._message };
        }
    }

    async create(applicant, mode) {
        try {
            const test = await TestSubmission.create({ 
                applicant: applicant,
                mode: mode
            });
                        
            const qs = await questions.service.query({ active: true }); // group by category or something
            let questionsToInsert = [];
            qs.forEach(q => {
                questionsToInsert.push({
                    test: test._id,
                    question: q._id,
                });
            });
            await TestAnswer.insertMany(questionsToInsert);

            return { success: 'Test created' };
        } catch(error) {
            return { error: 'could not create the test' }
        }
    }
}

const service = new TestSubmissionService();

module.exports = { service, TestSubmission, TestAnswer };