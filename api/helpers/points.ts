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
import { ContestStatus } from '../../interfaces/contest/contest';

export const extendQuestPrice = 10;

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
    };

    return difficultyPointsObject[taskName] / totalMappers;
}

export function findQuestPoints(deadline: Date, questCompletedDate: Date, rankedDate: Beatmap['rankedDate']): number {
    const lateness = +deadline - +questCompletedDate;

    if (lateness > 0 && +rankedDate > +new Date('2019-03-01')) { //2019-03-01 is when mappers' guild website launched
        return 7;
    } else {
        return 0;
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
    Storyboard: number;

    osu: number;
    taiko: number;
    catch: number;
    mania: number;

    Quests: Quest['_id'][];
    QuestReward: number;
}

interface MbcPoints {
    ContestParticipant: number;
    ContestScreener: number;
    ContestJudge: number;
}

export async function getUserRank(userId: any, tasksPoints: TasksPoints, modPoints: number, hostPoints: number, mbcPoints: MbcPoints): Promise<{ rank: number; totalPoints: number }> {
    const user = await UserModel.findById(userId).orFail();
    const totalPoints = tasksPoints.Easy +
        tasksPoints.Normal +
        tasksPoints.Hard +
        tasksPoints.Insane +
        tasksPoints.Expert +
        tasksPoints.Storyboard +
        tasksPoints.QuestReward +
        modPoints +
        hostPoints +
        mbcPoints.ContestParticipant +
        mbcPoints.ContestScreener +
        mbcPoints.ContestJudge +
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
    } else {
        rank = 4;
    }

    return {
        rank,
        totalPoints,
    };
}

export async function calculateTasksPoints(userId: any): Promise<TasksPoints> {
    const ownTasks = await TaskModel.find({ mappers: userId }).select('_id');

    // find any Ranked beatmap the user is involved in
    const userBeatmaps = await BeatmapModel
        .find({
            status: BeatmapStatus.Ranked,
            tasks: {
                $in: ownTasks,
            },
        }).populate([
            { path: 'host', select: '_id osuId username' },
            { path: 'modders', select: '_id osuId username' },
            { path: 'quest', select: '_id name status price completed deadline' },
            { path: 'tasks', populate: { path: 'mappers' } },
        ]);

    const pointsObject: TasksPoints = {
        Easy: 0,
        Normal: 0,
        Hard: 0,
        Insane: 0,
        Expert: 0,
        Storyboard: 0,

        osu: 0,
        taiko: 0,
        catch: 0,
        mania: 0,

        Quests: [],
        QuestReward: 0,
    };

    // process all beatmaps
    for (const beatmap of userBeatmaps) {
        let questParticipation = false; // each map has no quest bonus unless marked later
        const lengthNerf = getLengthNerf(beatmap.length); // how much beatmap length will affect points earned from tasks

        // task points
        for (const task of beatmap.tasks) {
            if (task.mappers.some(m => m.id == userId)) {
                if (task.name != TaskName.Storyboard) {
                    let questBonus = 0;

                    // define quest-related parameters
                    if (beatmap.quest?.status === QuestStatus.Done) {
                        questParticipation = true; // SB'ng doesn't get extra quest bonus
                        questBonus = getQuestBonus(beatmap.quest.deadline, beatmap.rankedDate, task.mappers.length);
                    } else if (beatmap.isShowcase) {
                        questBonus = 2; // featured artist showcase maps automatically earn full quest bonus
                    }

                    // difficulty-specific points
                    const taskPoints = findDifficultyPoints(task.name, task.mappers.length);

                    // finalize task points and add to base
                    const finalPoints = ((taskPoints + questBonus) * lengthNerf);
                    pointsObject[task.name] += finalPoints;
                    pointsObject[task.mode] += finalPoints;
                } else {
                    // finalize SB-specific points and add to base
                    const taskPoints = findStoryboardPoints(task.sbQuality);
                    pointsObject[task.name] += taskPoints;
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
    }

    return pointsObject;
}

/** 5 points per mapset */
export async function calculateHostPoints(userId: any): Promise<number> {
    const hostedBeatmaps = await BeatmapModel.countDocuments({
        status: BeatmapStatus.Ranked,
        host: userId,
    });

    return hostedBeatmaps * 5;
}

/** 1 point per mod */
export async function calculateModPoints(userId: any): Promise<number> {
    const moddedBeatmaps = await BeatmapModel.countDocuments({
        status: BeatmapStatus.Ranked,
        modders: userId,
    });

    return moddedBeatmaps;
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
            total += extendQuestPrice; // 10 points to extend deadline
        } else if (spentPoints.category == SpentPointsCategory.ReopenQuest) {
            total += getReopenQuestPoints(spentPoints.quest.price);
        } else if (spentPoints.category == SpentPointsCategory.CreateQuest) {
            total += findCreateQuestPointsSpent(spentPoints.quest.art, spentPoints.quest.requiredMapsets);
        }
    }

    return total;
}

export async function calculateMbcPoints(userId: any): Promise<MbcPoints> {
    /**
     * MBC they submitted entries to
     * MBC they screened
     * MBC they judged
     */
    const [submissions, screenedContests, judgedContests] = await Promise.all([
        SubmissionModel
            .find({ creator: userId })
            .populate({ path: 'contest', select: 'name' }),
        ContestModel.countDocuments({
            screeners: userId,
            name: { $regex: 'Monthly Beatmapping Contest' },
            status: ContestStatus.Complete,
        }),
        ContestModel.countDocuments({
            judges: userId,
            name: { $regex: 'Monthly Beatmapping Contest' },
            status: ContestStatus.Complete,
        }),
    ]);

    let relevantSubmissionCount = 0;

    for (const submission of submissions) {
        if (submission.contest.name.includes('Monthly Beatmapping Contest')) {
            relevantSubmissionCount++;
        }
    }

    return {
        ContestParticipant: relevantSubmissionCount * 5, // 5 points per entry
        ContestScreener: screenedContests, // 1 point per screening
        ContestJudge: judgedContests, // 1 point per judging
    };
}

function demicalRound(value: number): number {
    return Math.round(value * 1000) / 1000;
}

/**
 * @returns Total points
 */
export async function updateUserPoints(userId: any): Promise<number | ErrorResponse> {
    const [taskPoints, modPoints, hostPoints, spentPoints, mbcPoints] = await Promise.all([
        calculateTasksPoints(userId),
        calculateModPoints(userId),
        calculateHostPoints(userId),
        calculateSpentPoints(userId),
        calculateMbcPoints(userId),
    ]);

    const { rank, totalPoints } = await getUserRank(userId, taskPoints, modPoints, hostPoints, mbcPoints);

    await UserModel.findByIdAndUpdate(userId, {
        // Tasks
        easyPoints: demicalRound(taskPoints['Easy']),
        normalPoints: demicalRound(taskPoints['Normal']),
        hardPoints: demicalRound(taskPoints['Hard']),
        insanePoints: demicalRound(taskPoints['Insane']),
        expertPoints: demicalRound(taskPoints['Expert']),
        storyboardPoints: demicalRound(taskPoints['Storyboard']),

        // Total per mode
        osuPoints: demicalRound(taskPoints['osu']),
        taikoPoints: demicalRound(taskPoints['taiko']),
        catchPoints: demicalRound(taskPoints['catch']),
        maniaPoints: demicalRound(taskPoints['mania']),

        // Quests
        questPoints: taskPoints['QuestReward'],
        completedQuests: taskPoints['Quests'],

        // MBC
        contestParticipantPoints: mbcPoints.ContestParticipant,
        contestScreenerPoints: mbcPoints.ContestScreener,
        contestJudgePoints: mbcPoints.ContestJudge,

        // Rest
        modPoints,
        hostPoints,
        spentPoints,
        rank,
    });

    return totalPoints;
}
