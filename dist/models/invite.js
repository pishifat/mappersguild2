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
exports.InviteModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const inviteSchema = new mongoose_1.Schema({
    recipient: { type: 'ObjectId', ref: 'User', required: true },
    sender: { type: 'ObjectId', ref: 'User', required: true },
    modified: { type: 'ObjectId', required: true },
    info: { type: String, required: true },
    actionType: { type: String, required: true, enum: ['collaborate in a difficulty', 'create a difficulty', 'join'] },
    accepted: { type: Boolean },
    visible: { type: Boolean, default: true },
    map: { type: 'ObjectId', ref: 'Beatmap' },
    taskName: { type: String },
    taskMode: { type: String },
    party: { type: 'ObjectId', ref: 'Party' },
    quest: { type: 'ObjectId', ref: 'Quest' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
class InviteService {
    static generateMapInvite(recipient, sender, modified, info, actionType, map, taskName, taskMode) {
        let invite;
        if (taskName && taskMode) {
            invite = new InviteModel({ recipient, sender, modified, info, actionType, map, taskName, taskMode });
        }
        else {
            invite = new InviteModel({ recipient, sender, modified, info, actionType, map });
        }
        return invite.save();
    }
    static generatePartyInvite(recipient, sender, modified, info, actionType, party, quest) {
        const invite = new InviteModel({ recipient, sender, modified, info, actionType, party, quest });
        return invite.save();
    }
}
inviteSchema.loadClass(InviteService);
const InviteModel = mongoose_1.default.model('Invite', inviteSchema);
exports.InviteModel = InviteModel;
