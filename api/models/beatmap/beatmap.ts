import mongoose, { Document, Schema, DocumentQuery, Model } from 'mongoose';
import { TaskMode, TaskName } from '../../../interfaces/beatmap/task';
import { User } from '../../../interfaces/user';
import { Beatmap as IBeatmap, BeatmapStatus } from '../../../interfaces/beatmap/beatmap';

export interface Beatmap extends IBeatmap, Document {
    _id: any;
    id: string;

    /** find if an user participated in a task within this beatmap */
    participated (userId: any): boolean;

    /**
     * checks whether the beatmap can accept new tasks/collabs or not, depending on beatmap state and quest-user relation
     */
    checkTaskAvailability (user: User, taskName: TaskName, taskMode: TaskMode, isAdmin: boolean): Promise<boolean>;
}

const BeatmapSchema = new Schema<Beatmap>({
    song: { type: 'ObjectId', ref: 'FeaturedSong' },
    host: { type: 'ObjectId', ref: 'User', required: true },
    status: { type: String, enum: ['WIP', 'Done', 'Qualified', 'Ranked'], default: 'WIP' },
    tasks: [{ type: 'ObjectId', ref: 'Task' }],
    tasksLocked: [{ type: String, enum: ['Easy', 'Normal', 'Hard', 'Insane', 'Expert', 'Storyboard'] }],
    modders: [{ type: 'ObjectId', ref: 'User' }],
    bns: [{ type: 'ObjectId', ref: 'User' }],
    quest: { type: 'ObjectId', ref: 'Quest' },
    mission: { type: 'ObjectId', ref: 'Mission' },
    url: { type: String },
    mode: { type: String, enum: ['osu', 'taiko', 'catch', 'mania', 'hybrid'], default: 'osu' },
    length: { type: Number },
    packId: { type: Number },
    rankedDate: { type: Date },
    submissionDate: { type: Date },
    isShowcase: { type: Boolean }, // showcase beatmaps are created for fa news post announcements and receive quest bonus points
    queuedForRank: { type: Boolean }, // used for automation of status changes
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const queryHelpers = {
    sortByLatest<Q extends DocumentQuery<any, Beatmap>>(this: Q) {
        return this.sort({ createdAt: -1 });
    },
    defaultPopulate<Q extends DocumentQuery<any, Beatmap>>(this: Q) {
        return this.populate([
            { path: 'host', select: '_id osuId username' },
            { path: 'bns', select: '_id osuId username' },
            { path: 'modders', select: '_id osuId username' },
            { path: 'quest', select: '_id name art modes deadline isMbc status' },
            { path: 'mission', select: '_id name tier status closingAnnounced' },
            { path: 'song', select: 'artist title' },
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

BeatmapSchema.methods.participated = function (this: Beatmap, userId: any) {
    if (!this.tasks) return false;

    return this.tasks.some(t => t.mappers.some(m => m.id == userId));
};

BeatmapSchema.methods.checkTaskAvailability = async function (this: Beatmap, user: User, taskName: TaskName, taskMode: TaskMode, isAdmin: boolean) {
    if (isAdmin) {
        return true;
    }

    if (this.status == BeatmapStatus.Ranked || this.status == BeatmapStatus.Qualified || this.status == BeatmapStatus.Done) {
        throw new Error(`Mapset already marked as ${this.status.toLowerCase()}`);
    }

    if (this.quest && taskName != TaskName.Storyboard) {
        await this.quest.populate({
            path: 'parties',
            populate: {
                path: 'members',
                select: 'id',
            },
        }).execPopulate();

        if (this.quest.currentParty && !this.quest.currentParty.members.some(m => m.id == user.id)) {
            throw new Error(`This mapset is part of a quest, so only members of the quest's current party can add difficulties!`);
        }

        if (!this.quest.modes.includes(taskMode)) {
            throw new Error(`The selected quest doesn't support beatmaps of this mode!`);
        }
    }

    if (this.tasks.length > 50) {
        throw new Error('This mapset has too many difficulties!');
    }

    if (
        taskName == TaskName.Storyboard &&
        this.tasks.some(t => t.name === TaskName.Storyboard)
    ) {
        throw new Error('There can only be one storyboard on a mapset!');
    }

    // host can bypass this
    if (
        this.host.id != user.id &&
        this.tasksLocked &&
        this.tasksLocked.some(t => t === taskName)
    ) {
        throw new Error('This task is locked by the mapset host!');
    }

    return true;
};

const BeatmapModel = mongoose.model<Beatmap, Model<Beatmap, typeof queryHelpers>>('Beatmap', BeatmapSchema);

export { BeatmapModel };
