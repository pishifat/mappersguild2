import { BeatmapMode } from './beatmap/beatmap';
import { Quest } from './quest';

export enum UserGroup {
    User = 'user',
    Admin = 'admin',
    Spectator = 'spectator',
}

export interface PointsInfo {
    total: number;
    available: number;
    mapping: number;
    quests: number;
    modding: number;
}

export interface User extends Document {
    _id: any;
    id: string;
    osuId: number;
    username: string;
    group: UserGroup;
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
    contestParticipantPoints: number;
    contestJudgePoints: number;
    contestVotePoints: number;
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