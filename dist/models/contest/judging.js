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
const baseService_1 = __importDefault(require("../baseService"));
const judgingSchema = new mongoose_1.Schema({
    judge: { type: 'ObjectId', ref: 'User', required: true },
    comment: { type: String },
    vote: { type: Number, enum: [0, 1, 2, 3, 4, 5], default: 0 },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
const JudgingModel = mongoose_1.default.model('Judging', judgingSchema);
class JudgingService extends baseService_1.default {
    constructor() {
        super(JudgingModel, { createdAt: -1 }, [
            {
                path: 'judge',
                select: '_id osuId username',
            },
        ]);
    }
    create(userId, comment, vote) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (comment) {
                    return yield JudgingModel.create({
                        judge: userId,
                        comment,
                    });
                }
                else {
                    return yield JudgingModel.create({
                        judge: userId,
                        vote,
                    });
                }
            }
            catch (error) {
                return { error: error._message };
            }
        });
    }
}
const service = new JudgingService();
exports.JudgingService = service;
