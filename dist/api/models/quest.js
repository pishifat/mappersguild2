"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestModel = void 0;
/* eslint-disable @typescript-eslint/no-use-before-define */
const mongoose_1 = __importStar(require("mongoose"));
const quest_1 = require("../../interfaces/quest");
const beatmap_1 = require("./beatmap/beatmap");
const questSchema = new mongoose_1.Schema({
    creator: { type: 'ObjectId', ref: 'User' },
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
    descriptionMain: { type: String, required: true },
    timeframe: { type: Number, required: true },
    requiredMapsets: { type: Number },
    minParty: { type: Number, required: true },
    maxParty: { type: Number, required: true },
    minRank: { type: Number, required: true },
    art: { type: Number },
    isMbc: { type: Boolean },
    status: { type: String, enum: ['open', 'wip', 'done', 'pending', 'rejected', 'hidden', 'scheduled'], default: 'open' },
    modes: [{ type: String, default: ['osu', 'taiko', 'catch', 'mania'], required: true }],
    expiration: { type: Date },
    //status is wip
    accepted: { type: Date },
    deadline: { type: Date },
    //status is done
    completed: { type: Date },
    queuedForCompletion: { type: Boolean },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
questSchema.virtual('associatedMaps', {
    ref: 'Beatmap',
    localField: '_id',
    foreignField: 'quest',
});
questSchema.virtual('parties', {
    ref: 'Party',
    localField: '_id',
    foreignField: 'quest',
});
questSchema.virtual('currentParty').get(function () {
    if ((this.status === quest_1.QuestStatus.WIP || this.status === quest_1.QuestStatus.Done) && this.parties?.length)
        return this.parties[0];
    return undefined;
});
questSchema.virtual('isExpired').get(function () {
    return ((+new Date() > +this.expiration) && this.status == 'open');
});
questSchema.virtual('reopenPrice').get(function () {
    return this.price * 0.5 + 25;
});
questSchema.methods.dissociateBeatmaps = async function (userId) {
    if (this.associatedMaps) {
        for (const beatmap of this.associatedMaps) {
            if (userId) {
                for (const task of beatmap.tasks) {
                    if (task.mappers.some(m => m.id == userId)) {
                        await beatmap_1.BeatmapModel.findByIdAndUpdate(beatmap._id, { quest: undefined });
                        break;
                    }
                }
            }
            else {
                await beatmap_1.BeatmapModel.findByIdAndUpdate(beatmap._id, { quest: undefined });
            }
        }
    }
};
questSchema.methods.removeParties = async function () {
    if (this.parties.length) {
        for (const party of this.parties) {
            await party.remove();
        }
    }
};
questSchema.methods.drop = async function () {
    await this.dissociateBeatmaps();
    await this.removeParties();
    const openQuest = await QuestModel.findOne({
        name: this.name,
        status: quest_1.QuestStatus.Open,
    });
    if (openQuest) {
        this.status = quest_1.QuestStatus.Hidden;
        openQuest.modes.push(...this.modes);
        await openQuest.save();
    }
    else {
        this.status = quest_1.QuestStatus.Open;
    }
    await this.save();
    return openQuest || this;
};
const queryHelpers = {
    sortByLatest() {
        return this.sort({ createdAt: -1 });
    },
    defaultPopulate() {
        return this.populate([
            { path: 'parties', populate: { path: 'members pendingMembers leader' } },
            {
                path: 'associatedMaps',
                populate: {
                    path: 'song host tasks',
                    populate: {
                        path: 'mappers',
                    },
                },
            },
            { path: 'creator', select: 'username osuId' },
        ]);
    },
};
questSchema.query = queryHelpers;
questSchema.statics.findAll = function (limit) {
    if (!limit)
        limit = 10000;
    return this
        .find({})
        .defaultPopulate()
        .sortByLatest()
        .limit(limit);
};
questSchema.statics.defaultFindByIdOrFail = function (id) {
    return this
        .findById(id)
        .defaultPopulate()
        .orFail();
};
const QuestModel = mongoose_1.default.model('Quest', questSchema);
exports.QuestModel = QuestModel;
