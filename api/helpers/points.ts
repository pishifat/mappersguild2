import { Points } from '../../interfaces/extras';
import { Beatmap, BeatmapStatus } from '../../interfaces/beatmap/beatmap';
import { BeatmapModel } from '../models/beatmap/beatmap';
import { Task, TaskName } from '../../interfaces/beatmap/task';
import { TaskModel } from '../models/beatmap/task';
import { ContestModel } from '../models/contest/contest';
import { SubmissionModel } from '../models/contest/submission';
import { SpentPointsModel } from '../models/spentPoints';
import { UserModel } from '../models/user';
import { ErrorResponse } from '../../interfaces/api/shared';
import { SpentPointsCategory } from '../../interfaces/spentPoints';
import { Quest, QuestStatus } from '../../interfaces/quest';
import { Mission, MissionStatus } from '../../interfaces/mission';
import { ContestStatus } from '../../interfaces/contest/contest';

export const extendQuestPrice = 10;
export const rerollShowcaseMissionSongPrice = 50;

export function getLengthNerf(length: number): number {
    const lengthNerf = 125;
    let newLength: number;

    if (length <= 90) {
        newLength = length;
    } else if (length <= 150) {
        newLength = ((length - 90) / 2) + 90;
    } else if (length <= 210) {
        newLength = ((length - 150) / 3) + 120;
    } else if (length <= 270) {
        newLength = ((length - 210) / 4) + 140;
    } else {
        newLength = ((length - 270) / 5) + 155;
    }

    return newLength/lengthNerf;
}

export function findDifficultyPoints(taskName: string, totalMappers: number): number {
    const difficultyPointsObject: Partial<Points> = {
        Easy: 5,
        Normal: 6,
        Hard: 7,
        Insane: 8,
        Expert: 8,
        Hitsounds: 2,
    };

    return difficultyPointsObject[taskName] / totalMappers;
}

export function findQuestPoints(deadline: Date, questCompletedDate: Date, rankedDate: Beatmap['rankedDate']): number {
    const lateness = +deadline - +questCompletedDate;

    if (lateness > 0 && +rankedDate > +new Date('2019-03-01')) { // 2019-03-01 is when mappers' guild website launched
        return 7;
    } else {
        return 0;
    }
}

export function findMissionPoints(tier: number): number {
    switch (tier) {
        case 1:
            return 7;
        case 2:
            return 10;
        case 3:
            return 13;
        case 4:
            return 20;
        default:
            return 7;
    }
}

export function getQuestBonus(deadline: Date, rankedDate: Beatmap['rankedDate'], totalMappers: number): number {
    let questBonus = 0;
    const lateness = (+deadline - +rankedDate) / (24*3600*1000);

    if (lateness > 0) {
        questBonus = 2;
    } else if (lateness > -20) {
        questBonus = 1.5;
    } else if (lateness > -40) {
        questBonus = 1;
    } else {
        questBonus = 0.5;
    }

    return questBonus/totalMappers;
}

export function getMissionBonus(winningBeatmaps: Beatmap[], beatmapId: Beatmap['id'], totalMappers: number): number {
    let missionBonus = 1;

    if (winningBeatmaps.some(b => b.id == beatmapId)) {
        missionBonus = 2;
    }

    return missionBonus/totalMappers;
}

export function findStoryboardPoints(storyboardQuality: Task['sbQuality']): number {
    if (!storyboardQuality) {
        return 0;
    } else if (storyboardQuality == 2) {
        return 7.5;
    } else {
        return (storyboardQuality * storyboardQuality + 1); //sb worth 2 or 10
    }
}

export function getReopenQuestPoints(price: number): number {
    return price * 0.5 + 25;
}

export function findCreateQuestPointsSpent(questArtist: number, requiredMapsets: number): number {
    let points = 25;

    if (!questArtist) {
        points += 10;
    }

    if (requiredMapsets < 1) {
        points = 727;
    } else if (requiredMapsets == 1) {
        points += 100;
    } else if (requiredMapsets < 10) {
        points += (10-requiredMapsets)*7.5;
    }

    return points;
}

interface TasksPoints {
    Easy: number;
    Normal: number;
    Hard: number;
    Insane: number;
    Expert: number;
    Hitsounds: number;
    Storyboard: number;

    osu: number;
    taiko: number;
    catch: number;
    mania: number;

    Quests: Quest['_id'][];
    QuestReward: number;
    Missions: Mission['_id'][];
    MissionReward: number;
}

interface ContestPoints {
    ContestCreator: number;
    ContestParticipant: number;
    ContestScreener: number;
    ContestJudge: number;
}

export async function getUserRank(userId: any, tasksPoints: TasksPoints, modPoints: number, hostPoints: number, contestPoints: ContestPoints): Promise<{ rank: number; totalPoints: number }> {
    const user = await UserModel.findById(userId).orFail();
    const totalPoints = tasksPoints.Easy +
        tasksPoints.Normal +
        tasksPoints.Hard +
        tasksPoints.Insane +
        tasksPoints.Expert +
        tasksPoints.Storyboard +
        tasksPoints.Hitsounds +
        tasksPoints.QuestReward +
        modPoints +
        hostPoints +
        contestPoints.ContestCreator +
        contestPoints.ContestParticipant +
        contestPoints.ContestScreener +
        contestPoints.ContestJudge +
        (user.legacyPoints || 0);

    let rank = 0;

    if (totalPoints < 100) {
        rank = 0;
    } else if (totalPoints < 250) {
        rank = 1;
    } else if (totalPoints < 500) {
        rank = 2;
    } else if (totalPoints < 1000) {
        rank = 3;
    } else if (totalPoints < 2500) {
        rank = 4;
    } else {
        rank = 5;
    }

    return {
        rank,
        totalPoints,
    };
}

const taskPointsPopulate = [
    { path: 'host', select: '_id osuId username' },
    { path: 'modders', select: '_id osuId username' },
    { path: 'quest', select: '_id name status price completed deadline' },
    {
        path: 'mission',
        select: '_id name status tier winningBeatmaps closingAnnounced',
        populate: {
            path: 'winningBeatmaps',
            select: '_id id',
        },
    },
    { path: 'tasks', populate: { path: 'mappers' } },
];

export async function calculateTasksPoints(userId: any): Promise<TasksPoints> {
    const ownTasks = await TaskModel.find({ mappers: userId }).select('_id');

    // find any Ranked beatmap the user is involved in
    const userBeatmaps = await BeatmapModel
        .find({
            status: BeatmapStatus.Ranked,
            tasks: {
                $in: ownTasks,
            },
        }).populate(taskPointsPopulate);

    const pointsObject: TasksPoints = {
        Easy: 0,
        Normal: 0,
        Hard: 0,
        Insane: 0,
        Expert: 0,
        Hitsounds: 0,
        Storyboard: 0,

        osu: 0,
        taiko: 0,
        catch: 0,
        mania: 0,

        Quests: [],
        QuestReward: 0,
        Missions: [],
        MissionReward: 0,
    };

    // process all beatmaps
    for (const beatmap of userBeatmaps) {
        let questParticipation = false; // each map has no quest bonus unless marked later
        let missionParticipation = false;
        const lengthNerf = getLengthNerf(beatmap.length); // how much beatmap length will affect points earned from tasks

        // task points
        for (const task of beatmap.tasks) {
            if (task.mappers.some(m => m.id == userId)) {
                // quest/mission/showcase bonuses
                let bonus = 0;

                if (beatmap.quest?.status === QuestStatus.Done) {
                    questParticipation = true;
                    bonus = getQuestBonus(beatmap.quest.deadline, beatmap.rankedDate, task.mappers.length);
                } else if (beatmap.mission?.status === MissionStatus.Closed && beatmap.mission?.closingAnnounced) {
                    missionParticipation = true;
                    bonus = getMissionBonus(beatmap.mission.winningBeatmaps, beatmap.id, task.mappers.length);
                } else if (beatmap.isShowcase) {
                    bonus = 2; // featured artist showcase maps automatically earn full quest bonus
                }

                // calculate raw task points
                let taskPoints;

                if (task.name === TaskName.Storyboard) {
                    taskPoints = findStoryboardPoints(task.sbQuality);
                } else {
                    taskPoints = findDifficultyPoints(task.name, task.mappers.length);
                }

                // finalize task points and add to base
                let finalPoints = 0;

                if (task.name === TaskName.Storyboard) {
                    finalPoints = taskPoints;
                } else if (task.name === TaskName.Hitsounds) {
                    finalPoints = taskPoints * lengthNerf;
                } else {
                    finalPoints = ((taskPoints + bonus) * lengthNerf);
                }

                pointsObject[task.name] += finalPoints;

                if (task.name !== TaskName.Storyboard && task.name !== TaskName.Hitsounds) {
                    pointsObject[task.mode] += finalPoints;
                }
            }
        }

        // quest reward points and completed quests list
        if (questParticipation &&
            beatmap.quest &&
            !pointsObject.Quests.includes(beatmap.quest._id)
        ) {
            pointsObject.Quests.push(beatmap.quest._id);
            pointsObject.QuestReward += findQuestPoints(beatmap.quest.deadline, beatmap.quest.completed, beatmap.rankedDate); // 7 points per quest if not over deadline
        }

        // mission reward points and completed missions list
        if (missionParticipation &&
            beatmap.mission &&
            !pointsObject.Missions.includes(beatmap.mission._id) &&
            beatmap.mission.winningBeatmaps.some(b => b.id == beatmap.id)
        ) {
            pointsObject.Missions.push(beatmap.mission._id);
            pointsObject.MissionReward += findMissionPoints(beatmap.mission.tier); // depends on mission tier
        }
    }

    // process unranked mission beatmaps for extra points
    const unrankedMissionBeatmaps = await BeatmapModel
        .find({
            status: { $ne: BeatmapStatus.Ranked },
            tasks: {
                $in: ownTasks,
            },
            mission: { $exists: true },
        }).populate(taskPointsPopulate);

    for (const beatmap of unrankedMissionBeatmaps) {
        if (beatmap.mission &&
            !pointsObject.Missions.includes(beatmap.mission._id) &&
            beatmap.mission.winningBeatmaps.some(b => b.id == beatmap.id)
        ) {
            pointsObject.Missions.push(beatmap.mission._id);
            pointsObject.MissionReward += findMissionPoints(beatmap.mission.tier); // depends on mission tier
        }
    }

    return pointsObject;
}

/** 3 points per mapset */
export async function calculateHostPoints(userId: any): Promise<number> {
    const hostedBeatmaps = await BeatmapModel.countDocuments({
        status: BeatmapStatus.Ranked,
        host: userId,
    });

    return hostedBeatmaps * 3;
}

/** 1 point per mod */
export async function calculateModPoints(userId: any): Promise<number> {
    const [modderPoints, nominatorBeatmaps] = await Promise.all([
        BeatmapModel.countDocuments({
            status: BeatmapStatus.Ranked,
            modders: userId,
            bns: { $ne: userId },
        }),
        BeatmapModel
            .find({
                status: BeatmapStatus.Ranked,
                bns: userId,
            })
            .defaultPopulate(),
    ]);

    let totalNominatorPoints = 0;

    for (const beatmap of nominatorBeatmaps) {
        const bonus = getLengthNerf((beatmap.length*beatmap.tasks.length)/1.5);

        if (bonus < 1) totalNominatorPoints++;
        else totalNominatorPoints += bonus;
    }

    return modderPoints + Math.ceil(totalNominatorPoints);
}

export async function calculateSpentPoints(userId: any): Promise<number> {
    const ownSpentPoints = await SpentPointsModel
        .find({ user: userId })
        .populate({
            path: 'quest',
            select: 'price art requiredMapsets',
        });

    let total = 0;

    for (const spentPoints of ownSpentPoints) {
        if (spentPoints.category == SpentPointsCategory.AcceptQuest) {
            total += spentPoints.quest.price; // price of quest on listing
        } else if (spentPoints.category == SpentPointsCategory.ExtendDeadline) {
            total += extendQuestPrice; // 10 points to extend deadline. no longer used
        } else if (spentPoints.category == SpentPointsCategory.ReopenQuest) {
            total += getReopenQuestPoints(spentPoints.quest.price);
        } else if (spentPoints.category == SpentPointsCategory.CreateQuest) {
            total += findCreateQuestPointsSpent(spentPoints.quest.art, spentPoints.quest.requiredMapsets);
        } else if (spentPoints.category == SpentPointsCategory.RerollShowcaseMissionSong) {
            total += rerollShowcaseMissionSongPrice; // 50 points to reroll song
        }
    }

    return total;
}

export async function calculateContestPoints(userId: any): Promise<ContestPoints> {
    /**
     * FA contests they created
     * FA contests they submitted entries to
     * FA contests they screened
     * FA contests they judged
     */
    const [createdContests, submissions, screenedContests, judgedContests] = await Promise.all([
        ContestModel.countDocuments({
            creators: userId,
            isFeaturedArtistContest: true,
            isEligibleForPoints: true,
            status: ContestStatus.Complete,
        }),
        SubmissionModel
            .find({ creator: userId })
            .populate({ path: 'contest', select: 'isFeaturedArtistContest isEligibleForPoints' }),
        ContestModel.countDocuments({
            screeners: userId,
            isFeaturedArtistContest: true,
            isEligibleForPoints: true,
            status: ContestStatus.Complete,
        }),
        ContestModel.countDocuments({
            judges: userId,
            isFeaturedArtistContest: true,
            isEligibleForPoints: true,
            status: ContestStatus.Complete,
        }),
    ]);

    let relevantSubmissionCount = 0;

    for (const submission of submissions) {
        if (submission.contest.isFeaturedArtistContest && submission.contest.isEligibleForPoints) {
            relevantSubmissionCount++;
        }
    }

    return {
        ContestCreator: createdContests * 5, // 5 points per contest hosted
        ContestParticipant: relevantSubmissionCount * 3, // 3 points per entry
        ContestScreener: screenedContests, // 1 point per screening
        ContestJudge: judgedContests, // 1 point per judging
    };
}

function decimalRound(value: number): number {
    return Math.round(value * 1000) / 1000;
}

/**
 * @returns Total points
 */
export async function updateUserPoints(userId: any): Promise<number | ErrorResponse> {
    const [taskPoints, modPoints, hostPoints, spentPoints, contestPoints] = await Promise.all([
        calculateTasksPoints(userId),
        calculateModPoints(userId),
        calculateHostPoints(userId),
        calculateSpentPoints(userId),
        calculateContestPoints(userId),
    ]);

    const { rank, totalPoints } = await getUserRank(userId, taskPoints, modPoints, hostPoints, contestPoints);

    await UserModel.findByIdAndUpdate(userId, {
        // Tasks
        easyPoints: decimalRound(taskPoints['Easy']),
        normalPoints: decimalRound(taskPoints['Normal']),
        hardPoints: decimalRound(taskPoints['Hard']),
        insanePoints: decimalRound(taskPoints['Insane']),
        expertPoints: decimalRound(taskPoints['Expert']),
        storyboardPoints: decimalRound(taskPoints['Storyboard']),
        hitsoundPoints: decimalRound(taskPoints['Hitsounds']),

        // Total per mode
        osuPoints: decimalRound(taskPoints['osu']),
        taikoPoints: decimalRound(taskPoints['taiko']),
        catchPoints: decimalRound(taskPoints['catch']),
        maniaPoints: decimalRound(taskPoints['mania']),

        // Quests + Missions
        questPoints: taskPoints['QuestReward'],
        completedQuests: taskPoints['Quests'],
        missionPoints: taskPoints['MissionReward'],
        completedMissions: taskPoints['Missions'],

        // FA Contests
        contestCreatorPoints: contestPoints.ContestCreator,
        contestParticipantPoints: contestPoints.ContestParticipant,
        contestScreenerPoints: contestPoints.ContestScreener,
        contestJudgePoints: contestPoints.ContestJudge,

        // Rest
        modPoints: decimalRound(modPoints),
        hostPoints,
        spentPoints,
        rank,
    });

    return totalPoints;
}
