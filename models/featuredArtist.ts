import mongoose, { Document, Schema } from 'mongoose';
import { FeaturedArtist as IFeaturedArtist } from '../interfaces/featuredArtist';

export interface FeaturedArtist extends IFeaturedArtist, Document {
    id: string;
}

const featuredArtistSchema = new Schema({
    label: { type: String, required: true },
    osuId: { type: Number },
    songs: [{ type: 'ObjectId', ref: 'FeaturedSong' }],

    isContacted: { type: Boolean },
    isResponded: { type: Boolean },
    tracksSelected: { type: Boolean },
    contractSent: { type: Boolean },
    contractSigned: { type: Boolean },
    contractPaid: { type: Boolean },
    songsTimed: { type: Boolean },
    songsReceived: { type: Boolean },
    assetsReceived: { type: Boolean },
    bioWritten: { type: Boolean },
    isInvited: { type: Boolean },
    isUpToDate: { type: Boolean },
    isStalled: { type: Boolean },
    isRejected: { type: Boolean },
    isDenied: { type: Boolean },
    isPriority: { type: Boolean },

    lastContacted: { type: Date },
    projectedRelease: { type: Date },
    notes: { type: String },
    assignedUser: { type: 'ObjectId', ref: 'User' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const FeaturedArtistModel = mongoose.model<FeaturedArtist>('FeaturedArtist', featuredArtistSchema);

export { FeaturedArtistModel };
