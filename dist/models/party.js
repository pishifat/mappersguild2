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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartyModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const partySchema = new mongoose_1.Schema({
    leader: { type: 'ObjectId', ref: 'User' },
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
            { path: 'leader' },
            { path: 'quest' },
        ]);
    },
};
partySchema.query = queryHelpers;
partySchema.methods.removeUser = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const i = this.members.findIndex(m => m.id == userId);
        if (i !== -1)
            this.members.splice(i, 1);
        this.setPartyRank();
        yield this.save();
    });
};
partySchema.methods.setPartyRank = function () {
    const rankSum = this.members.reduce((acc, m) => acc + m.rank, 0);
    this.rank = Math.round(rankSum / this.members.length);
};
partySchema.methods.addUser = function (user) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.quest) {
            throw new Error(`Couldn't find quest`);
        }
        yield this.quest.populate({
            path: 'parties',
            populate: {
                path: 'members',
                select: 'id',
            },
        }).execPopulate();
        if (this.quest.parties.some(p => p.members.some(m => m.id == user.id))) {
            throw new Error('Already in a party for this quest');
        }
        if (user.availablePoints < this.quest.price) {
            throw new Error('You do not have enough points available to accept this quest!');
        }
        if (this.members.length >= this.quest.maxParty) {
            throw new Error('Party has too many members!');
        }
        this.members.push(user);
        this.setPartyRank();
        yield this.save();
    });
};
partySchema.statics.defaultFindByIdOrFail = function (id) {
    return this
        .findById(id)
        .defaultPopulate()
        .orFail();
};
const PartyModel = mongoose_1.default.model('Party', partySchema);
exports.PartyModel = PartyModel;
