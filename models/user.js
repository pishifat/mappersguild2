const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    osuId: { type: Number, required: true, unique: true },
    username: { type: String, required: true },
    group: { type: String, enum: ['user', 'hidden', 'admin'], default: 'user' }, //deleting a user instance causes problems, so people who want to "leave" will be hidden on the user listing, but still in the db
    currentParty: { type: 'ObjectId', ref: 'Party' },
    rank: { type: Number, default: 0 },
    easyPoints: { type: Number, default: 0 },
    normalPoints: { type: Number, default: 0 },
    hardPoints: { type: Number, default: 0 },
    insanePoints: { type: Number, default: 0 },
    expertPoints: { type: Number, default: 0 },
    storyboardPoints: { type: Number, default: 0 },
    questPoints: { type: Number, default: 0 },
    modPoints: { type: Number, default: 0 },
    hostPoints: { type: Number, default: 0 },
    completedQuests: [{type: 'ObjectId', ref: 'Quest'}],
    penaltyPoints: { type: Number, default: 0 },
    
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

userSchema.virtual('totalPoints').get(function() {
    return Math.round((this.easyPoints + this.normalPoints + this.hardPoints + this.insanePoints + this.expertPoints +
        this.storyboardPoints + this.questPoints + this.modPoints + this.hostPoints - this.penaltyPoints)*10)/10;
});

var User = mongoose.model('User', userSchema);

class UserService
{
    async query(params, populate, sorting, getAll) {
        let query;
        if(getAll){
            query = User.find(params);
        }else{
            query = User.findOne(params);
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
            return await User.findByIdAndUpdate(id, update, { 'new': true });
        } catch(error) {
            return { error: error._message };
        }
    }

    async create(osuId, username) {
        let res = await User.findOne({ osuId: osuId });
        
        if (!res) {
            try {
                return await User.create({ osuId: osuId, username: username });
            } catch(error) {
                return { error: error._message }
            }
        } else {
            return { error: 'User already exists' };
        }
    }
}

var service = new UserService();

module.exports = { User, service };