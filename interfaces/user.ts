import { BeatmapMode } from './beatmap/beatmap';
import { Quest } from './quest';
import { Document } from 'mongoose';

export enum UserGroup {
    User = 'user',
    Admin = 'admin',
    Spectator = 'spectator',
    Secret = 'secret',
}

export interface PointsInfo {
    total: number;
    available: number;
    mapping: number;
    modding: number;
    other: number;
}

export interface User extends Document {
    _id: any;
    id: string;
    osuId: number;
    username: string;
    group: UserGroup;
    badge: number;
    queuedBadge: number;
    completedQuests: Quest[];
    bypassLogin: boolean;
    discordId: string; // js doesnt support 18 digit numbers...
    isShowcaseMapper: boolean;
    isContestHelper: boolean;

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
    contestParticipantPoints: number;
    contestScreenerPoints: number;
    contestJudgePoints: number;
    legacyPoints: number;
    osuPoints: number;
    taikoPoints: number;
    catchPoints: number;
    maniaPoints: number;
    totalPoints: number;
    spentPoints: number;
    availablePoints: number;
    pointsInfo: Record<string, any>;
    mainMode: Omit<BeatmapMode, BeatmapMode.Hybrid>;
    createdAt: Date;
}