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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const notificationSchema = new mongoose_1.Schema({
    recipient: { type: 'ObjectId', ref: 'User', required: true },
    sender: { type: 'ObjectId', ref: 'User' },
    modified: { type: 'ObjectId', required: true },
    info: { type: String, required: true },
    visible: { type: Boolean, default: true },
    map: { type: 'ObjectId', ref: 'Beatmap' },
    party: { type: 'ObjectId', ref: 'Party' },
    quest: { type: 'ObjectId', ref: 'Quest' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
class NotificationService {
    static generate(modified, info, recipient, sender, map) {
        const notification = new NotificationModel({ modified, info, recipient, sender, map });
        return notification.save();
    }
    static generatePartyNotification(modified, info, recipient, sender, party, quest) {
        const notification = new NotificationModel({ modified, info, recipient, sender, party, quest });
        return notification.save();
    }
}
notificationSchema.loadClass(NotificationService);
const NotificationModel = mongoose_1.default.model('Notification', notificationSchema);
exports.NotificationModel = NotificationModel;
