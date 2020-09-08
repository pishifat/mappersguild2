import { Points } from '../interfaces/extras';
import { Quest, QuestStatus } from '../interfaces/quest';
import { Beatmap, BeatmapStatus } from '../interfaces/beatmap/beatmap';
import { BeatmapModel } from '../models/beatmap/beatmap';
import { Task, TaskName } from '../interfaces/beatmap/task';
import { TaskModel } from '../models/beatmap/task';
import { ContestModel } from '../models/contest/contest';
import { SubmissionModel } from '../models/contest/submission';
import { SpentPointsModel } from '../models/spentPoints';
import { UserModel } from '../models/user';
import { defaultErrorMessage, BasicError } from './helpers';

export function findLengthNerf(length: number): number {
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

export function findQuestPoints(deadline: Quest['deadline'], questCompletedDate: Quest['completed'], rankedDate: Beatmap['rankedDate']): number {
    const lateness = +deadline - +questCompletedDate;

    if (lateness > 0 && +rankedDate > +new Date('2019-03-01')) { //2019-03-01 is when mappers' guild website launched
        return 7;
    } else {
        return 0;
    }
}

export function findQuestBonus(status: Quest['status'], deadline: Quest['deadline'], rankedDate: Beatmap['rankedDate'], totalMappers: number): number {
    let questBonus = 0;

    if (status == QuestStatus.Done) {
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

export function findReopenQuestPoints(price: number): number {
    return price*0.5 + 25;
}

export function findCreateQuestPointsSpent(questArtist: number, requiredMapsets: number): number {
    let points = 100;

    if (!questArtist) {
        points += 50;
    }

    if (requiredMapsets < 1) {
        points = 727;
    } else if (requiredMapsets == 1) {
        points += 300;
    } else if (requiredMapsets == 2) {
        points += 200;
    } else if (requiredMapsets < 10) {
        points += (10-requiredMapsets)*15 - 5;
    }

    return points;
}

export async function updateUserPoints(userId: any): Promise<number | BasicError> {
    /* find:
        - tasks user created
        - MBC they submitted entries to
        - MBC they screened
        - MBC they judged
        - spent points events from user
    */
    const [user, ownTasks, hostedBeatmaps, moddedBeatmaps, submittedContests, screenedContests, judgedContests, ownSpentPoints] = await Promise.all([
        UserModel.findById(userId).orFail(),
        TaskModel.find({ mappers: userId }).select('_id'),
        BeatmapModel
            .find({
                status: BeatmapStatus.Ranked,
                host: userId,
            })
            .populate({
                path: 'host',
                select: '_id osuId username',
            }),
        BeatmapModel
            .find({
                status: BeatmapStatus.Ranked,
                modders: userId,
            })
            .populate({
                path: 'modders',
                select: '_id osuId username',
            }),
        SubmissionModel.find({
            creator: userId,
        }),
        ContestModel.find({
            screeners: userId,
        }),
        ContestModel.find({
            judges: userId,
        }),
        SpentPointsModel
            .find({ user: userId })
            .populate({
                path: 'quest',
                select: 'price art requiredMapsets',
            }),
    ]);

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

    // check if queries worked
    if (
        !ownTasks ||
        !hostedBeatmaps ||
        !moddedBeatmaps ||
        !submittedContests ||
        !screenedContests ||
        !ownSpentPoints ||
        !userBeatmaps
    ) {
        return defaultErrorMessage;
    }

    // establish points base
    const pointsObject: Points = {
        Easy: 0,
        Normal: 0,
        Hard: 0,
        Insane: 0,
        Expert: 0,
        Storyboard: 0,
        Mod: 0,
        Host: 0,
        QuestReward: 0,
        SpentPoints: 0,
        Rank: 0,
        osu: 0,
        taiko: 0,
        catch: 0,
        mania: 0,
        ContestParticipant: 0,
        ContestScreener: 0,
        ContestJudge: 0,
        Quests: [],
    };

    // process all beatmaps
    userBeatmaps.forEach(beatmap => {
        let questParticipation = false; // each map has no quest bonus unless marked later
        const lengthNerf = findLengthNerf(beatmap.length); // how much beatmap length will affect points earned from tasks

        // task points
        beatmap.tasks.forEach(task => {
            task.mappers.forEach(mapper => {
                if (mapper.id == userId) {
                    if (task.name != TaskName.Storyboard) {
                        // define quest-related parameters
                        let questBonus = 0;
                        if (beatmap.quest) questBonus = findQuestBonus(beatmap.quest.status, beatmap.quest.deadline, beatmap.rankedDate, task.mappers.length);
                        else if (beatmap.isShowcase) questBonus = 2; // featured artist showcase maps automatically earn full quest bonus
                        questParticipation = Boolean(questBonus && !beatmap.isShowcase); // if map received quest bonus, mapset is marked as quest participation

                        // difficulty-specific points
                        const taskPoints = findDifficultyPoints(task.name, task.mappers.length);

                        // finalize task points and add to base
                        const finalPoints = ((taskPoints + questBonus)*lengthNerf);
                        pointsObject[task.name] += finalPoints;
                        pointsObject[task.mode] += finalPoints;
                    } else {
                        // finalize SB-specific points and add to base
                        const taskPoints = findStoryboardPoints(task.sbQuality);
                        pointsObject[task.name] += taskPoints;
                    }
                }
            });
        });

        // quest reward points and completed quests list
        if (questParticipation) {
            if (pointsObject['Quests'].indexOf(beatmap.quest._id) < 0 && beatmap.quest.status == QuestStatus.Done) {
                pointsObject['Quests'].push(beatmap.quest._id);

                pointsObject['QuestReward'] += findQuestPoints(beatmap.quest.deadline, beatmap.quest.completed, beatmap.rankedDate); // 7 points per quest if not over deadline
            }
        }
    });

    // host points
    pointsObject['Host'] = hostedBeatmaps.length*5; // 5 points per mapset

    // mod points
    pointsObject['Mod'] = moddedBeatmaps.length; // 1 point per mod

    // contest participation
    pointsObject['ContestParticipant'] = submittedContests.length*5; // 5 points per entry

    // contest screening
    pointsObject['ContestScreener'] = screenedContests.length; // 1 point per screening

    // contest judging
    pointsObject['ContestJudge'] = judgedContests.length; // 1 point per judging

    // spent points
    ownSpentPoints.forEach(spentPoints => {
        if (spentPoints.category == 'acceptQuest') {
            pointsObject['SpentPoints'] += spentPoints.quest.price; // price of quest on listing
        } else if (spentPoints.category == 'extendDeadline') {
            pointsObject['SpentPoints'] += 10; // 10 points to extend deadline
        } else if (spentPoints.category == 'reopenQuest') {
            pointsObject['SpentPoints'] += findReopenQuestPoints(spentPoints.quest.price);
        } else if (spentPoints.category == 'createQuest') {
            pointsObject['SpentPoints'] += findCreateQuestPointsSpent(spentPoints.quest.art, spentPoints.quest.requiredMapsets);
        }
    });

    // set rank
    const legacyPoints = user.legacyPoints || 0;

    const totalPoints = pointsObject['Easy'] +
        pointsObject['Normal'] +
        pointsObject['Hard'] +
        pointsObject['Insane'] +
        pointsObject['Expert'] +
        pointsObject['Storyboard'] +
        pointsObject['Mod'] +
        pointsObject['Host'] +
        pointsObject['QuestReward'] +
        pointsObject['ContestParticipant'] +
        pointsObject['ContestScreener'] +
        legacyPoints;

    if (totalPoints < 100) {
        pointsObject['Rank'] = 0;
    } else if (totalPoints < 250) {
        pointsObject['Rank'] = 1;
    } else if (totalPoints < 500) {
        pointsObject['Rank'] = 2;
    } else if (totalPoints < 1000) {
        pointsObject['Rank'] = 3;
    } else {
        pointsObject['Rank'] = 4;
    }

    await UserModel.findByIdAndUpdate(userId, {
        easyPoints: pointsObject['Easy'],
        normalPoints: pointsObject['Normal'],
        hardPoints: pointsObject['Hard'],
        insanePoints: pointsObject['Insane'],
        expertPoints: pointsObject['Expert'],
        storyboardPoints: pointsObject['Storyboard'],
        modPoints: pointsObject['Mod'],
        hostPoints: pointsObject['Host'],
        questPoints: pointsObject['QuestReward'],
        spentPoints: pointsObject['SpentPoints'],
        rank: pointsObject['Rank'],
        osuPoints: pointsObject['osu'],
        taikoPoints: pointsObject['taiko'],
        catchPoints: pointsObject['catch'],
        maniaPoints: pointsObject['mania'],
        contestParticipantPoints: pointsObject['ContestParticipant'],
        contestScreenerPoints: pointsObject['ContestScreener'],
        contestJudgePoints: pointsObject['ContestJudge'],
        completedQuests: pointsObject['Quests'],
    });

    return (totalPoints);
}