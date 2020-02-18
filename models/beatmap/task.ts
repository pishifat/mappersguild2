import mongoose, { Document, Schema } from 'mongoose';
import BaseService from '../baseService';
import { BasicError } from '../../helpers/helpers';
import { Task as ITask } from '../../interfaces/beatmap/task';

export interface Task extends ITask, Document {
    id: string;
}

const taskSchema = new Schema({
    name: { type: String, enum: ['Easy', 'Normal', 'Hard', 'Insane', 'Expert', 'Storyboard'], required: true },
    mode: { type: String, enum: ['osu', 'taiko', 'catch', 'mania', 'sb'], default: 'osu' },
    mappers: [{ type: 'ObjectId', ref: 'User', required: true }],
    status: { type: String, enum: ['WIP', 'Done'], default: 'WIP' },
    sbQuality: { type: Number, enum: [1, 2, 3] }, //used to calculate points for sb
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const TaskModel = mongoose.model<Task>('Task', taskSchema);

class TaskService extends BaseService<Task>
{
    constructor() {
        super(
            TaskModel,
            { updatedAt: -1 },
            []
        );
    }

    async create(data: Partial<Task>): Promise<Task | BasicError> {
        try {
            return await TaskModel.create(data);
        } catch (error) {
            return { error: error._message };
        }
    }
}

const service = new TaskService();

export { service as TaskService };