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
const logSchema = new mongoose_1.Schema({
    user: { type: 'ObjectId', ref: 'User' },
    action: { type: String, required: true },
    category: { type: String, enum: ['beatmap', 'quest', 'party', 'user', 'artist', 'error'], required: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
const LogModel = mongoose_1.default.model('Log', logSchema);
class LogService extends baseService_1.default {
    constructor() {
        super(LogModel, { createdAt: -1 }, [
            { path: 'user', select: 'username' },
        ]);
    }
    create(userId, action, category) {
        return __awaiter(this, void 0, void 0, function* () {
            const log = new LogModel({ user: userId, action, category });
            try {
                return yield log.save();
            }
            catch (error) {
                return helpers_1.defaultErrorMessage;
            }
        });
    }
}
const service = new LogService();
exports.LogService = service;
