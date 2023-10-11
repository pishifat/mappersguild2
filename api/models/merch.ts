import mongoose, { Document, Schema, DocumentQuery, Model } from 'mongoose';
import { Merch as IMerch } from '../../interfaces/merch';

export interface Merch extends IMerch, Document {
    _id: any;
    id: string;
}

const merchSchema = new Schema<Merch>({
    name: { type: String, required: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const MerchModel = mongoose.model<MerchModel>('Merch', merchSchema);

export { MerchModel };
