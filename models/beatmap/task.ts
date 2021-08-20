import mongoose, { Document, Schema } from 'mongoose';
import { Task as ITask } from '../../interfaces/beatmap/task';

export interface Task extends ITask, Document {
    _id: any;
    id: string;
}

const taskSchema = new Schema<Task>({
    name: { type: String, enum: ['Easy', 'Normal', 'Hard', 'Insane', 'Expert', 'Storyboard'], required: true },
    mode: { type: String, enum: ['osu', 'taiko', 'catch', 'mania', 'sb'], default: 'osu' },
    mappers: [{ type: 'ObjectId', ref: 'User', required: true }],
    status: { type: String, enum: ['WIP', 'Done'], default: 'WIP' },
    sbQuality: { type: Number, enum: [1, 2, 3] }, //used to calculate points for sb
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const TaskModel = mongoose.model<Task>('Task', taskSchema);

export { TaskModel };