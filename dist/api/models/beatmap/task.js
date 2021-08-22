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
exports.TaskModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const taskSchema = new mongoose_1.Schema({
    name: { type: String, enum: ['Easy', 'Normal', 'Hard', 'Insane', 'Expert', 'Storyboard'], required: true },
    mode: { type: String, enum: ['osu', 'taiko', 'catch', 'mania', 'sb'], default: 'osu' },
    mappers: [{ type: 'ObjectId', ref: 'User', required: true }],
    status: { type: String, enum: ['WIP', 'Done'], default: 'WIP' },
    sbQuality: { type: Number, enum: [1, 2, 3] }, //used to calculate points for sb
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
const TaskModel = mongoose_1.default.model('Task', taskSchema);
exports.TaskModel = TaskModel;
