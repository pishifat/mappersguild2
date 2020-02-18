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
const partySchema = new mongoose_1.Schema({
    leader: { type: 'ObjectId', ref: 'User' },
    members: [{ type: 'ObjectId', ref: 'User' }],
    lock: { type: Boolean, default: false },
    rank: { type: Number, default: 0 },
    modes: [{ type: String, required: true }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
const PartyModel = mongoose_1.default.model('Party', partySchema);
class PartyService extends baseService_1.default {
    constructor() {
        super(PartyModel, { updatedAt: -1 }, [
            { path: 'members', select: 'username osuId rank' },
            { path: 'leader', select: 'username osuId' },
        ]);
    }
    create(userId, mode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const party = new PartyModel({
                    leader: userId,
                    members: userId,
                    modes: [mode],
                });
                return yield PartyModel.create(party);
            }
            catch (error) {
                return { error: error._message };
            }
        });
    }
    createOrFail(userId, mode) {
        return __awaiter(this, void 0, void 0, function* () {
            const party = yield this.create(userId, mode);
            if (this.isError(party)) {
                throw new Error();
            }
            return party;
        });
    }
}
const service = new PartyService();
exports.PartyService = service;
