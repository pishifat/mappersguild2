import mongoose, { Document, Schema } from 'mongoose';
import BaseService from './baseService';
import { User } from './user';
import { FeaturedSong } from './featuredSong';
import { BasicError } from '../helpers/helpers';

export interface FeaturedArtist extends Document {
    label: string;
    osuId: number;
    songs: FeaturedSong[];

    isContacted: boolean;
    isResponded: boolean;
    tracksSelected: boolean;
    contractSent: boolean;
    contractSigned: boolean;
    contractPaid: boolean;
    songsTimed: boolean;
    songsReceived: boolean;
    assetsReceived: boolean;
    bioWritten: boolean;
    isInvited: boolean;
    isUpToDate: boolean;
    isStalled: boolean;
    isRejected: boolean;
    isPriority: boolean;

    lastContacted: Date;
    projectedRelease: Date;
    notes: string;
    assignedUser: User;
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
    isPriority: { type: Boolean },

    lastContacted: { type: Date },
    projectedRelease: { type: Date },
    notes: { type: String },
    assignedUser: { type: 'ObjectId', ref: 'User' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const FeaturedArtistModel = mongoose.model<FeaturedArtist>('FeaturedArtist', featuredArtistSchema);

class FeaturedArtistService extends BaseService<FeaturedArtist>
{
    constructor() {
        super(
            FeaturedArtistModel,
            { title: -1 },
            [
                { path: 'songs', select: 'artist title' },
            ]
        );
    }

    async create(label: FeaturedArtist['label'], osuId?: User['osuId'] | undefined): Promise<FeaturedArtist | BasicError> {
        try {
            if (osuId) {
                return await FeaturedArtistModel.create({
                    label,
                    osuId,
                });
            } else {
                return await FeaturedArtistModel.create({
                    label,
                });
            }
        } catch (error) {
            return { error: error._message };
        }
    }
}

const service = new FeaturedArtistService();

export { service as FeaturedArtistService };
