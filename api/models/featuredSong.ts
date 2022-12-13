import mongoose, { Document, Schema, DocumentQuery, Model } from 'mongoose';
import { FeaturedSong as IFeaturedSong } from '../../interfaces/featuredSong';

export interface FeaturedSong extends IFeaturedSong, Document {
    _id: any;
    id: string;
}

const featuredSongSchema = new Schema<FeaturedSong>({
    artist: { type: String, required: true },
    title: { type: String },
    songShowcaseMappers: [{ type: 'ObjectId', ref: 'User' }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const queryHelpers = {
    defaultPopulate<Q extends DocumentQuery<any, FeaturedSong>>(this: Q) {
        return this.populate([
            { path: 'songShowcaseMappers', select: 'username osuId' },
        ]);
    },
};

featuredSongSchema.query = queryHelpers;

const FeaturedSongModel = mongoose.model<FeaturedSong, Model<FeaturedSong, typeof queryHelpers>>('FeaturedSong', featuredSongSchema);

export { FeaturedSongModel };
