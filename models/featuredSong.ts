import mongoose, { Document, Schema } from 'mongoose';
import { FeaturedSong as IFeaturedSong } from '../interfaces/featuredSong';

export interface FeaturedSong extends IFeaturedSong, Document {
    _id: any;
    id: string;
}

const featuredSongSchema = new Schema<FeaturedSong>({
    artist: { type: String, required: true },
    title: { type: String },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const FeaturedSongModel = mongoose.model<FeaturedSong>('FeaturedSong', featuredSongSchema);

export { FeaturedSongModel };
