const mongoose = require('mongoose');
const logs = require('./log');

var userSchema = new mongoose.Schema({
    osuId: { type: Number, required: true, unique: true },
    username: { type: String, required: true },
    group: { type: String, enum: ['user', 'admin', 'spectator'], default: 'user' },
    invites: { type: Boolean, default: true },

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
    osuPoints: { type: Number, default: 0 },
    taikoPoints: { type: Number, default: 0 },
    catchPoints: { type: Number, default: 0 },
    maniaPoints: { type: Number, default: 0 },
    legacyPoints: { type: Number, default: 0 },
    penaltyPoints: { type: Number, default: 0 },
    completedQuests: [{type: 'ObjectId', ref: 'Quest'}],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

userSchema.virtual('totalPoints').get(function() {
    return Math.round((this.easyPoints + this.normalPoints + this.hardPoints + this.insanePoints + this.expertPoints +
        this.storyboardPoints + this.questPoints + this.modPoints + this.hostPoints + this.legacyPoints - this.penaltyPoints)*10)/10;
});

userSchema.virtual('mainMode').get(function() {
    let modes = indexModes = [this.osuPoints, this.taikoPoints, this.catchPoints, this.maniaPoints];
    modes.sort();
    let i = [this.osuPoints, this.taikoPoints, this.catchPoints, this.maniaPoints].indexOf(modes[3]);
    let mode;
    switch (i) {
        case 3:
            mode = 'mania';
            break;
        case 2:
            mode = 'catch';
            break;
        case 1:
            mode = 'taiko';
            break;
        default:
            mode = 'osu';
            break;
    }
    return mode;
});

var User = mongoose.model('User', userSchema);

class UserService
{
    async query(params, populate, sorting, getAll) {
        let query;

        if (getAll) {
            query = User.find(params);
        } else {
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
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }

    async update(id, update) {
        try {
            return await User.findByIdAndUpdate(id, update, { 'new': true });
        } catch(error) {
            logs.service.create(null, error, null, 'error'); 
            return { error: error._message };
        }
    }

    async create(osuId, username, group) {
        let res = await User.findOne({ osuId: osuId });
        
        if (!res) {
            try {
                return await User.create({ osuId: osuId, username: username, group: group });
            } catch(error) {
                logs.service.create(null, error, null, 'error'); 
                return { error: error._message }
            }
        } else {
            return { error: 'User already exists' };
        }
    }
}

var service = new UserService();

module.exports = { User, service };