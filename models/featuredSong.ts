import mongoose, { Document, Schema } from 'mongoose';
import BaseService from './baseService';
import { BasicError } from '../helpers/helpers';
import { FeaturedSong as IFeaturedSong } from '../interfaces/featuredSong';

export interface FeaturedSong extends IFeaturedSong, Document {
    id: string;
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

    async createOrFail(artist: FeaturedSong['artist'], title: FeaturedSong['title']): Promise<FeaturedSong> {
        const song = await this.create(artist, title);

        if (this.isError(song)) {
            throw new Error();
        }

        return song;
    }
}

const service = new FeaturedSongService();

export { service as FeaturedSongService };
