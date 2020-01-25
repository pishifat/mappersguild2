import { BeatmapMode } from './beatmap';
import { Quest } from './quest';

export enum UserGroup {
    User = 'user',
    Admin = 'admin',
    Spectator = 'spectator',
}

export interface User {
    id: string;
    osuId: number;
    username: string;
    group: UserGroup;
    invites: boolean;
    badge: number;
    completedQuests: Quest[];

    rank: number;
    easyPoints: number;
    normalPoints: number;
    hardPoints: number;
    insanePoints: number;
    expertPoints: number;
    storyboardPoints: number;
    questPoints: number;
    modPoints: number;
    hostPoints: number;
    osuPoints: number;
    taikoPoints: number;
    catchPoints: number;
    maniaPoints: number;
    legacyPoints: number;
    penaltyPoints: number;
    totalPoints: number;
    mainMode: Omit<BeatmapMode, BeatmapMode.Hybrid>;
    createdAt: Date;
}
