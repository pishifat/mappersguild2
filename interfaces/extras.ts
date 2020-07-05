export enum FilterMode {
    any = 'any',
    osu = 'osu',
    taiko = 'taiko',
    catch = 'catch',
    mania = 'mania',
}

export interface Points {
    Easy: number;
    Normal: number;
    Hard: number;
    Insane: number;
    Expert: number;
    Storyboard: number;
    Mod: number;
    Host: number;
    QuestReward: number;
    SpentPoints: number;
    Rank: number;
    osu: number;
    taiko: number;
    catch: number;
    mania: number;
    ContestParticipant: number;
    ContestJudge: number;
    ContestVote: number;
    Quests: any[];
}