import mongoose, { Document, Schema } from 'mongoose';
import { FeaturedArtist as IFeaturedArtist } from '../../interfaces/featuredArtist';

export interface FeaturedArtist extends IFeaturedArtist, Document {
    _id: any;
    id: string;
}

const featuredArtistSchema = new Schema<FeaturedArtist>({
    label: { type: String, required: true },
    osuId: { type: Number },
    status: { type: String, enum: ['public', 'private', 'showcase'], default: 'private' },
    songs: [{ type: 'ObjectId', ref: 'FeaturedSong' }],
    lastContacted: { type: Date },
    notes: { type: String },
    showcaseMappers: [{ type: 'ObjectId', ref: 'User' }],

    // discussion
    isContacted: { type: Boolean },
    isResponded: { type: Boolean },
    tracksSelected: { type: Boolean },
    isRejected: { type: Boolean },

    // contract
    contractSent: { type: Boolean },
    artistSigned: { type: Boolean },
    ppyPaid: { type: Boolean },
    ppySigned: { type: Boolean },

    // publication
    projectedRelease: { type: Date },
    songsTimed: { type: Boolean },
    songsReceived: { type: Boolean },
    assetsReceived: { type: Boolean },
    isUpToDate: { type: Boolean },

    // other
    hasRankedMaps: { type: Boolean },
    isMinor: { type: Boolean },
    isGroup: { type: Boolean },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const FeaturedArtistModel = mongoose.model<FeaturedArtist>('FeaturedArtist', featuredArtistSchema);

export { FeaturedArtistModel };
