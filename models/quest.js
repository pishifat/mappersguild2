const mongoose = require('mongoose');

var questSchema = new mongoose.Schema({
    name: { type: String, required: true },
    descriptionMain: { type: String, required: true},
    descriptionFluff: { type: String, required: true},
    timeframe: { type: Number, required: true},
    reward: { type: Number, required: true},
    minParty: { type: Number, required: true},
    maxParty: { type: Number, required: true},
    minRank: { type: Number, required: true},
    status: { type: String, default: "open" },
    art: { type: Number },
    color: { type: "String", default: "#ffa658" },

    accepted: { type: Date },
    deadline: { type: Date },
    completed: { type: Date },

    exclusive: { type: Boolean },
    medal: { type: Boolean },
    completedMembers: [{type: 'ObjectId', ref: 'User'}],

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
            return { error: error._message };
        }
    }

    async update(id, update) {
        try {
            return await Quest.findByIdAndUpdate(id, update, { 'new': true });
        } catch(error) {
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
            exclusive: body.exclusive, 
            medal: body.medal,
            color: body.color
        });
        try {
            await quest.save();
            return quest;
        } catch(err) {
            console.log(err);
        }
    }

    async remove(id) {
        try {
            return await Quest.findByIdAndDelete(id);
        } catch(error) {
            return { error: error._message };
        }
    }
}

var service = new QuestService();

module.exports = { service };