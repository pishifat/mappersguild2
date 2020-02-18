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
const NotificationModel = mongoose_1.default.model('Notification', notificationSchema);
class NotificationService extends baseService_1.default {
    constructor() {
        super(NotificationModel, { updatedAt: -1 }, [
            { path: 'sender', select: 'username osuId' },
            { path: 'map', populate: { path: 'song host' } },
            {
                path: 'map', populate: {
                    path: 'tasks', populate: { path: 'mappers' },
                },
            },
            { path: 'party', populate: { path: 'members leader' } },
            { path: 'quest', select: 'name' },
        ]);
    }
    create(modified, info, recipient, sender, map) {
        return __awaiter(this, void 0, void 0, function* () {
            const notification = new NotificationModel({ modified, info, recipient, sender, map });
            try {
                return yield notification.save();
            }
            catch (error) {
                return helpers_1.defaultErrorMessage;
            }
        });
    }
    createPartyNotification(modified, info, recipient, sender, party, quest) {
        return __awaiter(this, void 0, void 0, function* () {
            const notification = new NotificationModel({ modified, info, recipient, sender, party, quest });
            try {
                return yield notification.save();
            }
            catch (error) {
                return helpers_1.defaultErrorMessage;
            }
        });
    }
}
const service = new NotificationService();
exports.NotificationService = service;
