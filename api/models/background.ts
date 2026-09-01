import mongoose, { Document, Schema, Model } from 'mongoose';
import { Background as IBackground } from '../../interfaces/background';

export interface Background extends IBackground, Document {
    _id: any;
    id: string;
}

const backgroundSchema = new Schema({
    name: { type: String, required: true, unique: true },
    link: { type: String, required: true },
    user: { type: 'ObjectId', ref: 'User', required: true },
    approved: { type: Boolean, default: false },
    hidden: { type: Boolean, default: false },
    denied: { type: Boolean, default: false },
    deniedReason: { type: String },
    tags: [{ type: String, default: [] }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const queryHelpers = {
    defaultPopulate(this: any) {
        return this.populate({ path: 'user', select: 'username osuId' });
    },
};

backgroundSchema.query = queryHelpers;

const BackgroundModel = mongoose.model<Background, Model<Background, typeof queryHelpers>>('Background', backgroundSchema);

export { BackgroundModel };
