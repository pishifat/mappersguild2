import mongoose, { Document, Schema } from 'mongoose';
import { OsuBeatmap as IOsuBeatmap } from '../interfaces/osuBeatmap';

export interface OsuBeatmap extends IOsuBeatmap, Document {
    _id: any;
    id: string;
}

const osuBeatmapSchema = new Schema<OsuBeatmap>({
    beatmapsetOsuIds: [{ type: Number }],
    beatmapOsuIds: [{ type: Number }],
    artist: { type: String },
    title: { type: String },
    favourites: { type: Number },
    playcount: { type: Number },
    sources: [{ type: String }],
    isLicensed: { type: Boolean },
    featuredArtists: [{ type: 'ObjectId', ref: 'FeaturedArtist' }],
    comment: { type: String },
    customComment: { type: String },
    administrators: [{ type: String }],
    lastChecked: { type: Date },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const OsuBeatmapModel = mongoose.model<OsuBeatmap>('OsuBeatmap', osuBeatmapSchema);

export { OsuBeatmapModel };
