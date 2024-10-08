import mongoose, { Document, Schema } from 'mongoose';
import { Task as ITask, SortedTasks } from '../../../interfaces/beatmap/task';

export interface Task extends ITask, Document {
    _id: any;
    id: string;
}

const taskSchema = new Schema<Task>({
    name: { type: String, enum: SortedTasks, required: true },
    mode: { type: String, enum: ['osu', 'taiko', 'catch', 'mania', 'sb', 'hs'], default: 'osu' },
    mappers: [{ type: 'ObjectId', ref: 'User', required: true }],
    status: { type: String, enum: ['WIP', 'Done'], default: 'WIP' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const TaskModel = mongoose.model<Task>('Task', taskSchema);

export { TaskModel };