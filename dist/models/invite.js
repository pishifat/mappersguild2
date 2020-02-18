"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const baseService_1 = __importDefault(require("./baseService"));
const helpers_1 = require("../helpers/helpers");
const inviteSchema = new mongoose_1.Schema({
    recipient: { type: 'ObjectId', ref: 'User', required: true },
    sender: { type: 'ObjectId', ref: 'User', required: true },
    modified: { type: 'ObjectId', required: true },
    info: { type: String, required: true },
    actionType: { type: String, required: true, enum: ['collaborate in a difficulty', 'create a difficulty', 'host', 'join'] },
    accepted: { type: Boolean },
    visible: { type: Boolean, default: true },
    map: { type: 'ObjectId', ref: 'Beatmap' },
    taskName: { type: String },
    taskMode: { type: String },
    party: { type: 'ObjectId', ref: 'Party' },
    quest: { type: 'ObjectId', ref: 'Quest' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
const InviteModel = mongoose_1.default.model('Invite', inviteSchema);
class InviteService extends baseService_1.default {
    constructor() {
        super(InviteModel, { updatedAt: -1 }, [
            { path: 'sender', select: 'username osuId' },
            { path: 'map', populate: { path: 'song host' } },
            {
                path: 'map', populate: {
                    path: 'tasks', populate: { path: 'mappers' },
                },
            },
            { path: 'party', populate: { path: 'members leader' } },
            {
                path: 'quest', populate: {
                    path: 'currentParty', populate: { path: 'members' },
                },
            },
        ]);
    }
    createMapInvite(recipient, sender, modified, info, actionType, map, taskName, taskMode) {
        return __awaiter(this, void 0, void 0, function* () {
            let invite;
            if (taskName && taskMode) {
                invite = new InviteModel({ recipient, sender, modified, info, actionType, map, taskName, taskMode });
            }
            else {
                invite = new InviteModel({ recipient, sender, modified, info, actionType, map });
            }
            try {
                return yield invite.save();
            }
            catch (error) {
                return helpers_1.defaultErrorMessage;
            }
        });
    }
    createPartyInvite(recipient, sender, modified, info, actionType, party, quest) {
        return __awaiter(this, void 0, void 0, function* () {
            const invite = new InviteModel({ recipient, sender, modified, info, actionType, party, quest });
            try {
                return yield invite.save();
            }
            catch (error) {
                return helpers_1.defaultErrorMessage;
            }
        });
    }
}
const service = new InviteService();
exports.InviteService = service;
