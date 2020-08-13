import mongoose, { Document, Schema, DocumentQuery, Model } from 'mongoose';
import { Beatmap as IBeatmap } from '../../interfaces/beatmap/beatmap';
import { User } from '../../interfaces/user';

export interface Beatmap extends IBeatmap, Document {
    id: string;
}

const BeatmapSchema = new Schema({
    song: { type: 'ObjectId', ref: 'FeaturedSong' },
    host: { type: 'ObjectId', ref: 'User', required: true },
    status: { type: String, enum: ['WIP', 'Done', 'Qualified', 'Ranked'], default: 'WIP' },
    tasks: [{ type: 'ObjectId', ref: 'Task' }],
    tasksLocked: [{ type: String, enum: ['Easy', 'Normal', 'Hard', 'Insane', 'Expert', 'Storyboard'] }],
    modders: [{ type: 'ObjectId', ref: 'User' }],
    bns: [{ type: 'ObjectId', ref: 'User' }],
    quest: { type: 'ObjectId', ref: 'Quest' },
    url: { type: String },
    mode: { type: String, enum: ['osu', 'taiko', 'catch', 'mania', 'hybrid'], default: 'osu' },
    length: { type: Number },
    packId: { type: Number },
    rankedDate: { type: Date },
    isShowcase: { type: Boolean },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const queryHelpers = {
    sortByLastest<Q extends DocumentQuery<any, Beatmap>>(this: Q) {
        return this.sort({ updatedAt: -1 });
    },
    defaultPopulate<Q extends DocumentQuery<any, Beatmap>>(this: Q) {
        return this.populate([
            { path: 'host', select: '_id osuId username' },
            { path: 'bns', select: '_id osuId username' },
            { path: 'modders', select: '_id osuId username' },
            { path: 'quest', select: '_id name art modes deadline isMbc' },
            { path: 'song',select: 'artist title' },
            {
                path: 'tasks',
                populate: {
                    path: 'mappers',
                    select: '_id osuId username',
                },
            },
        ]);
    },
};

BeatmapSchema.query = queryHelpers;
BeatmapSchema.virtual('mappers').get(function(this: Beatmap) {
    const mappers: User[] = [];

    this.tasks.forEach(task => {
        if (task?.mappers) {
            task.mappers.forEach(mapper => {
                if (!mappers.includes(mapper.id)) {
                    mappers.push(mapper.id);
                }
            });
        }
    });

    return mappers;
});

const BeatmapModel = mongoose.model<Beatmap, Model<Beatmap, typeof queryHelpers>>('Beatmap', BeatmapSchema);

export { BeatmapModel };
