import mongoose, { Document, Schema } from 'mongoose';
import { Submission as ISubmission } from '../../../interfaces/contest/submission';

export interface Submission extends ISubmission, Document {
    _id: any;
    id: string;
}

const submissionSchema = new Schema<Submission>({
    name: { type: String },
    creator: { type: 'ObjectId', ref: 'User', required: true },
    url: { type: String },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

submissionSchema.virtual('contest', {
    ref: 'Contest',
    localField: '_id',
    foreignField: 'submissions',
    justOne: true,
});

submissionSchema.virtual('judgings', {
    ref: 'Judging',
    localField: '_id',
    foreignField: 'submission',
});

submissionSchema.virtual('screenings', {
    ref: 'Screening',
    localField: '_id',
    foreignField: 'submission',
});

const SubmissionModel = mongoose.model<Submission>('Submission', submissionSchema);

export { SubmissionModel };
