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
const contestSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    contestStart: { type: Date },
    judgingStart: { type: Date },
    resultsPublished: { type: Date },
    submissions: [{ type: 'ObjectId', ref: 'Submission' }],
    judges: [{ type: 'ObjectId', ref: 'User' }],
    voters: [{ type: 'ObjectId', ref: 'User' }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
const ContestModel = mongoose_1.default.model('Contest', contestSchema);
class ContestService extends baseService_1.default {
    constructor() {
        super(ContestModel, { name: 1 }, [
            {
                path: 'submissions',
                select: '_id name evaluations',
                populate: {
                    path: 'evaluations',
                    populate: {
                        path: 'judge',
                        select: '_id osuId username',
                    },
                },
            },
        ]);
    }
    create(name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield ContestModel.create({
                    name,
                });
            }
            catch (error) {
                return { error: error._message };
            }
        });
    }
}
const service = new ContestService();
exports.ContestService = service;
