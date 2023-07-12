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
exports.PartyModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const quest_1 = require("../../interfaces/quest");
const spentPoints_1 = require("../../interfaces/spentPoints");
const spentPoints_2 = require("../models/spentPoints");
const points_1 = require("../helpers/points");
const partySchema = new mongoose_1.Schema({
    leader: { type: 'ObjectId', ref: 'User' },
    pendingMembers: [{ type: 'ObjectId', ref: 'User' }],
    members: [{ type: 'ObjectId', ref: 'User' }],
    lock: { type: Boolean, default: false },
    rank: { type: Number, default: 0 },
    modes: [{ type: String, required: true }],
    quest: { type: 'ObjectId', ref: 'Quest', required: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
const queryHelpers = {
    defaultPopulate() {
        return this.populate([
            { path: 'members' },
            { path: 'pendingMembers' },
            { path: 'leader' },
            { path: 'quest' },
        ]);
    },
};
partySchema.query = queryHelpers;
partySchema.methods.removeUser = async function (userId) {
    const i = this.members.findIndex(m => m.id == userId);
    if (i !== -1)
        this.members.splice(i, 1);
    this.setPartyRank();
    await this.save();
};
partySchema.methods.setPartyRank = function () {
    const rankSum = this.members.reduce((acc, m) => acc + m.rank, 0);
    this.rank = Math.round(rankSum / this.members.length);
};
partySchema.methods.addUser = async function (user, isNotSelf, isLeader) {
    if (!this.quest) {
        throw new Error(`Couldn't find quest`);
    }
    await this.quest.populate({
        path: 'parties',
        populate: {
            path: 'members pendingMembers',
            select: 'id',
        },
    }).execPopulate();
    if (!isLeader && this.lock && !this.pendingMembers.some(m => m.id == user.id)) {
        throw new Error('Party is locked');
    }
    if (!isLeader && isNotSelf && this.quest.status != quest_1.QuestStatus.Open && !this.pendingMembers.some(m => m.id == user.id)) {
        throw new Error('Cannot join in-progress quests without approval from party leader');
    }
    if (this.quest.parties.some(p => p.members.some(m => m.id == user.id))) {
        throw new Error('Already in a party for this quest');
    }
    if (user.availablePoints < this.quest.price && this.leader.availablePoints < this.quest.price * 2) {
        throw new Error('Not enough points available to accept this quest');
    }
    if (this.members.length >= this.quest.maxParty) {
        throw new Error('Party has too many members!');
    }
    if (isNotSelf && this.id !== '649c33f84fa25e6f7d9a104a') { // akira complex mega quest. delete later
        this.pendingMembers.push(user);
    }
    else {
        this.members.push(user);
        const i = this.pendingMembers.findIndex(m => m.id == user.id);
        if (i !== -1)
            this.pendingMembers.splice(i, 1);
        if (this.quest.status == quest_1.QuestStatus.WIP) {
            if (user.availablePoints > this.quest.price) {
                await spentPoints_2.SpentPointsModel.generate(spentPoints_1.SpentPointsCategory.AcceptQuest, user.id, this.quest.id);
                await points_1.updateUserPoints(user.id);
            }
            else {
                await spentPoints_2.SpentPointsModel.generate(spentPoints_1.SpentPointsCategory.AcceptQuest, this.leader.id, this.quest.id);
                await points_1.updateUserPoints(this.leader.id);
            }
        }
    }
    this.setPartyRank();
    await this.save();
};
partySchema.statics.defaultFindByIdOrFail = function (id) {
    return this
        .findById(id)
        .defaultPopulate()
        .orFail();
};
const PartyModel = mongoose_1.default.model('Party', partySchema);
exports.PartyModel = PartyModel;
