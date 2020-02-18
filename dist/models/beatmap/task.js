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
const taskSchema = new mongoose_1.Schema({
    name: { type: String, enum: ['Easy', 'Normal', 'Hard', 'Insane', 'Expert', 'Storyboard'], required: true },
    mode: { type: String, enum: ['osu', 'taiko', 'catch', 'mania', 'sb'], default: 'osu' },
    mappers: [{ type: 'ObjectId', ref: 'User', required: true }],
    status: { type: String, enum: ['WIP', 'Done'], default: 'WIP' },
    sbQuality: { type: Number, enum: [1, 2, 3] },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
const TaskModel = mongoose_1.default.model('Task', taskSchema);
class TaskService extends baseService_1.default {
    constructor() {
        super(TaskModel, { updatedAt: -1 }, []);
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield TaskModel.create(data);
            }
            catch (error) {
                return { error: error._message };
            }
        });
    }
}
const service = new TaskService();
exports.TaskService = service;
