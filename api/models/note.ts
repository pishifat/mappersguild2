import mongoose, { Document, Schema } from 'mongoose';
import { Note as INote } from '../../interfaces/note';

export interface Note extends INote, Document {
    _id: any;
    id: string;
}

const noteSchema = new Schema<Note>({
    name: '',
    content: '',
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const NoteModel = mongoose.model<Note>('Note', noteSchema);

export { NoteModel };
