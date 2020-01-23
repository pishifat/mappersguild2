import mongoose, { Document, Schema } from 'mongoose';
import BaseService from '../baseService';
import { User } from '../user';
import { BasicError } from '../../helpers/helpers';

export enum TaskName {
    Easy = 'Easy',
    Normal = 'Normal',
    Hard = 'Hard',
    Insane = 'Insane',
    Expert = 'Expert',
    Storyboard = 'Storyboard',
}

export enum TaskMode {
    Osu = 'osu',
    Taiko = 'taiko',
    Catch = 'catch',
    Mania = 'mania',
    SB = 'sb',
}

export enum TaskStatus {
    WIP = 'WIP',
    Done = 'Done',
}

export enum SBQuality {
    Meh = 1,
    Ok = 2,
    Nice = 3,
}

export interface Task extends Document {
    name: TaskName;
    mode: TaskMode;
    mappers: User[] | User['_id'][];
    status: TaskStatus;
    sbQuality: SBQuality;
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
        super(TaskModel, { updatedAt: -1 }, [
            //
        ]);
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