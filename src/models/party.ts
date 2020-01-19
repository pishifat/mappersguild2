import { BeatmapMode } from './beatmap';
import { User } from './user';

export interface Party {
    leader: User;
    members: User[];
    lock: boolean;
    rank: number;
    modes: Omit<BeatmapMode, BeatmapMode.Hybrid>[];
}
