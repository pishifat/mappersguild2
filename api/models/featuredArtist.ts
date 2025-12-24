import mongoose, { Document, Schema, DocumentQuery, Model } from 'mongoose';
import { FeaturedArtist as IFeaturedArtist } from '../../interfaces/featuredArtist';

export interface FeaturedArtist extends IFeaturedArtist, Document {
    _id: any;
    id: string;
}

const featuredArtistSchema = new Schema<FeaturedArtist>({
    label: { type: String, required: true },
    osuId: { type: Number },
    status: { type: String, enum: ['public', 'private', 'showcase', 'playlist'], default: 'private' },
    songs: [{ type: 'ObjectId', ref: 'FeaturedSong' }],
    lastContacted: { type: Date },
    notes: { type: String },

    // discussion
    isContacted: { type: Boolean },
    isResponded: { type: Boolean },
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
    hasNewSongs: { type: Boolean },

    // showcase mappers
    referenceUrl: { type: String },
    oszTemplatesUrl: { type: String },
    showcaseMappers: [{ type: 'ObjectId', ref: 'User' }],
    offeredUsers: [{ type: 'ObjectId', ref: 'User' }],

    // actionArtist admin processing
    lastReviewed: { type: Date },
    permanentlyDismiss: { type: Boolean, default: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const queryHelpers = {
    defaultPopulate<Q extends DocumentQuery<any, FeaturedArtist>>(this: Q) {
        return this.populate([
            { path: 'songs', select: 'artist title oszUrl' },
            { path: 'showcaseMappers', select: 'username osuId' },
        ]);
    },
    defaultPopulateWithSongs<Q extends DocumentQuery<any, FeaturedArtist>>(this: Q) {
        return this.populate([
            { path: 'songs', select: 'artist title oszUrl' },
            { path: 'showcaseMappers', select: 'username osuId' },
            { path: 'offeredUsers', select: 'username osuId' },
            {
                path: 'songs',
                populate: {
                    path: 'songShowcaseMappers',
                    select: '_id osuId username',
                },
            },
        ]);
    },
};

featuredArtistSchema.query = queryHelpers;

const FeaturedArtistModel = mongoose.model<FeaturedArtist, Model<FeaturedArtist, typeof queryHelpers>>('FeaturedArtist', featuredArtistSchema);

export { FeaturedArtistModel };
