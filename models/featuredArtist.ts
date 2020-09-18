import mongoose, { Document, Schema } from 'mongoose';
import { FeaturedArtist as IFeaturedArtist } from '../interfaces/featuredArtist';

export interface FeaturedArtist extends IFeaturedArtist, Document {
    id: string;
}

const featuredArtistSchema = new Schema({
    label: { type: String, required: true },
    osuId: { type: Number },
    songs: [{ type: 'ObjectId', ref: 'FeaturedSong' }],
    lastContacted: { type: Date },
    notes: { type: String },

    // discussion
    isContacted: { type: Boolean },
    isResponded: { type: Boolean },
    tracksSelected: { type: Boolean },
    isRejected: { type: Boolean },

    // contract
    contractSent: { type: Boolean },
    contractFinalized: { type: Boolean },

    // publication
    projectedRelease: { type: Date },
    songsTimed: { type: Boolean },
    songsReceived: { type: Boolean },
    assetsReceived: { type: Boolean },
    hasRankedMaps: { type: Boolean },
    isUpToDate: { type: Boolean },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const FeaturedArtistModel = mongoose.model<FeaturedArtist>('FeaturedArtist', featuredArtistSchema);

export { FeaturedArtistModel };
