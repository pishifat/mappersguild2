const mongoose = require('mongoose');
const logs = require('./log');

var questSchema = new mongoose.Schema({
    name: { type: String, required: true },
    reward: { type: Number, required: true},
    descriptionMain: { type: String, required: true},
    timeframe: { type: Number, required: true},
    minParty: { type: Number, required: true},
    maxParty: { type: Number, required: true},
    minRank: { type: Number, required: true},
    art: { type: Number },
    medal: { type: Boolean },
    color: { type: "String", default: "#ffa658" },
    status: { type: String, enum: ['open', 'wip', 'done'], default: "open" },
    parties: [{type: 'ObjectId', ref: 'Party'}],
    
    accepted: { type: Date },
    deadline: { type: Date },
    completed: { type: Date },
    completedMembers: [{type: 'ObjectId', ref: 'User'}],

    //legacy quest info
    descriptionFluff: { type: String, required: true},
    content: [{ type: Object }],

}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

questSchema.virtual('assignedParty', {
    ref: 'Party',
    localField: '_id',
    foreignField: 'currentQuest',
    justOne: true
});

questSchema.virtual('associatedMaps', {
    ref: 'Beatmap',
    localField: '_id',
    foreignField: 'quest',
});



var Quest = mongoose.model('Quest', questSchema);

class QuestService
{
    async query(params, populate, sorting, getAll) {
        let query;
        if(getAll){
            query = Quest.find(params);
        }else{
            query = Quest.findOne(params);
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
            return await Quest.findByIdAndUpdate(id, update, { 'new': true });
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }

    async create(body) {
        var quest = new Quest({ 
            name: body.name, 
            reward: body.reward, 
            descriptionMain: body.descriptionMain, 
            descriptionFluff: body.descriptionFluff, 
            timeframe: body.timeframe, 
            minParty: body.minParty, 
            maxParty: body.maxParty, 
            minRank: body.minRank, 
            art: body.art, 
            medal: body.medal,
            color: body.color,
            content: {artist: body.artist, text: body.text}
        });
        try {
            await quest.save();
            return quest;
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
        }
    }

    async remove(id) {
        try {
            return await Quest.findByIdAndDelete(id);
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }
}

var service = new QuestService();

module.exports = { service };