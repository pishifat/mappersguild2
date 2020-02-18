import { User } from './user';
import { BeatmapMode } from './beatmap/beatmap';

export interface Party extends Document {
    _id: any;
    id: string;
    leader: User;
    members: User[] | User['_id'][];
    lock: boolean;
    rank: number;
    modes: Omit<BeatmapMode, BeatmapMode.Hybrid>[];
}