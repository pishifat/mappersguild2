import mongoose, { Document, Schema } from 'mongoose';
import BaseService from './baseService';
import { BasicError } from '../helpers/helpers';
// import { FeaturedArtist } from './featuredArtist';

export interface FeaturedSong extends Document {
    artist: string;
    title: string;
    // featuredArtist: FeaturedArtist;
}

const featuredSongSchema = new Schema({
    artist: { type: String, required: true },
    title: { type: String },
    // featuredArtist: { type: 'ObjectId', ref: 'FeaturedArtist' }, // It should've been this way, to avoid horizontal growning songs objects in fa
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const FeaturedSongModel = mongoose.model<FeaturedSong>('FeaturedSong', featuredSongSchema);

class FeaturedSongService extends BaseService<FeaturedSong>
{
    constructor() {
        super(FeaturedSongModel, { title: -1 }, [
            //
        ]);
    }

    async create(artist: FeaturedSong['artist'], title: FeaturedSong['title']): Promise<FeaturedSong | BasicError> {
        try {
            return await FeaturedSongModel.create({
                artist,
                title,
            });
        } catch (error) {
            return { error: error._message };
        }
    }
}

const service = new FeaturedSongService();

export { service as FeaturedSongService };
