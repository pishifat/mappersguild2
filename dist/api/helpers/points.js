"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserPoints = exports.calculateContestPoints = exports.calculateSpentPoints = exports.calculateModPoints = exports.calculateHostPoints = exports.calculateTasksPoints = exports.getUserRank = exports.findCreateQuestPointsSpent = exports.getReopenQuestPoints = exports.getMissionBonus = exports.getQuestBonus = exports.findMissionPoints = exports.findQuestPoints = exports.findDifficultyPoints = exports.getLengthNerf = exports.rerollShowcaseMissionSongPrice = exports.extendQuestPrice = void 0;
const beatmap_1 = require("../../interfaces/beatmap/beatmap");
const beatmap_2 = require("../models/beatmap/beatmap");
const task_1 = require("../../interfaces/beatmap/task");
const task_2 = require("../models/beatmap/task");
const contest_1 = require("../models/contest/contest");
const submission_1 = require("../models/contest/submission");
const spentPoints_1 = require("../models/spentPoints");
const user_1 = require("../models/user");
const spentPoints_2 = require("../../interfaces/spentPoints");
const quest_1 = require("../../interfaces/quest");
const mission_1 = require("../../interfaces/mission");
const contest_2 = require("../../interfaces/contest/contest");
exports.extendQuestPrice = 10;
exports.rerollShowcaseMissionSongPrice = 35;
function getLengthNerf(length) {
    const lengthNerf = 125;
    let newLength;
    if (length <= 90) {
        newLength = length;
    }
    else if (length <= 150) {
        newLength = ((length - 90) / 2) + 90;
    }
    else if (length <= 210) {
        newLength = ((length - 150) / 3) + 120;
    }
    else if (length <= 270) {
        newLength = ((length - 210) / 4) + 140;
    }
    else {
        newLength = ((length - 270) / 5) + 155;
    }
    return newLength / lengthNerf;
}
exports.getLengthNerf = getLengthNerf;
function findDifficultyPoints(taskName, totalMappers) {
    const difficultyPointsObject = {
        Easy: 5,
        Normal: 6,
        Hard: 7,
        Insane: 8,
        Expert: 8,
        Hitsounds: 2,
        Storyboard: 10,
    };
    return difficultyPointsObject[taskName] / totalMappers;
}
exports.findDifficultyPoints = findDifficultyPoints;
function findQuestPoints(deadline, questCompletedDate, rankedDate) {
    const lateness = +deadline - +questCompletedDate;
    if (lateness > 0 && +rankedDate > +new Date('2019-03-01')) { // 2019-03-01 is when mappers' guild website launched
        return 7;
    }
    else {
        return 0;
    }
}
exports.findQuestPoints = findQuestPoints;
function findMissionPoints(tier) {
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
exports.findMissionPoints = findMissionPoints;
function getQuestBonus(deadline, rankedDate, totalMappers) {
    let questBonus = 0;
    const lateness = (+deadline - +rankedDate) / (24 * 3600 * 1000);
    if (lateness > 0) {
        questBonus = 2;
    }
    else if (lateness > -20) {
        questBonus = 1.5;
    }
    else if (lateness > -40) {
        questBonus = 1;
    }
    else {
        questBonus = 0.5;
    }
    return questBonus / totalMappers;
}
exports.getQuestBonus = getQuestBonus;
function getMissionBonus(winningBeatmaps, beatmapId, totalMappers) {
    let missionBonus = 1;
    if (winningBeatmaps.some(b => b.id == beatmapId)) {
        missionBonus = 2;
    }
    return missionBonus / totalMappers;
}
exports.getMissionBonus = getMissionBonus;
function getReopenQuestPoints(price) {
    return price * 0.5 + 25;
}
exports.getReopenQuestPoints = getReopenQuestPoints;
function findCreateQuestPointsSpent(questArtist, requiredMapsets) {
    let points = 25;
    if (!questArtist) {
        points += 10;
    }
    if (requiredMapsets < 1) {
        points = 727;
    }
    else if (requiredMapsets == 1) {
        points += 100;
    }
    else if (requiredMapsets < 10) {
        points += (10 - requiredMapsets) * 7.5;
    }
    return points;
}
exports.findCreateQuestPointsSpent = findCreateQuestPointsSpent;
async function getUserRank(userId, tasksPoints, modPoints, hostPoints, contestPoints) {
    const user = await user_1.UserModel.findById(userId).orFail();
    const totalPoints = tasksPoints.Easy +
        tasksPoints.Normal +
        tasksPoints.Hard +
        tasksPoints.Insane +
        tasksPoints.Expert +
        tasksPoints.Storyboard +
        tasksPoints.Hitsounds +
        tasksPoints.QuestReward +
        tasksPoints.MissionReward +
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
    }
    else if (totalPoints < 250) {
        rank = 1;
    }
    else if (totalPoints < 500) {
        rank = 2;
    }
    else if (totalPoints < 1000) {
        rank = 3;
    }
    else if (totalPoints < 2500) {
        rank = 4;
    }
    else {
        rank = 5;
    }
    return {
        rank,
        totalPoints,
    };
}
exports.getUserRank = getUserRank;
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
async function calculateTasksPoints(userId) {
    const ownTasks = await task_2.TaskModel.find({ mappers: userId }).select('_id');
    // find any Ranked beatmap the user is involved in
    const userBeatmaps = await beatmap_2.BeatmapModel
        .find({
        status: beatmap_1.BeatmapStatus.Ranked,
        tasks: {
            $in: ownTasks,
        },
    }).populate(taskPointsPopulate);
    const pointsObject = {
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
                if (beatmap.quest?.status === quest_1.QuestStatus.Done) {
                    questParticipation = true;
                    bonus = getQuestBonus(beatmap.quest.deadline, beatmap.rankedDate, task.mappers.length);
                }
                else if (beatmap.mission?.status === mission_1.MissionStatus.Closed && beatmap.mission?.closingAnnounced) {
                    missionParticipation = true;
                    bonus = getMissionBonus(beatmap.mission.winningBeatmaps, beatmap.id, task.mappers.length);
                }
                else if (beatmap.isShowcase) {
                    bonus = 2; // featured artist showcase maps automatically earn full quest bonus
                }
                // calculate raw task points
                const taskPoints = findDifficultyPoints(task.name, task.mappers.length);
                // finalize task points and add to base
                let finalPoints = 0;
                if (task.name === task_1.TaskName.Storyboard) {
                    finalPoints = taskPoints;
                }
                else if (task.name === task_1.TaskName.Hitsounds) {
                    // check how many times a user does hitsounds for the same song (almost always 1)
                    const repeats = userBeatmaps.filter(b => b.song.toString() == beatmap.song.toString() && b.tasks.some(t => t.name == task_1.TaskName.Hitsounds && t.mappers.some(m => m.id == userId)));
                    finalPoints = (taskPoints * lengthNerf) / repeats.length; // dividing by "repeats" stops users from earning extra points when their hitsounds are copied to another mapset
                }
                else {
                    finalPoints = ((taskPoints + bonus) * lengthNerf);
                }
                pointsObject[task.name] += finalPoints;
                if (task.name !== task_1.TaskName.Storyboard && task.name !== task_1.TaskName.Hitsounds) {
                    pointsObject[task.mode] += finalPoints;
                }
            }
        }
        // quest reward points and completed quests list
        if (questParticipation &&
            beatmap.quest &&
            !pointsObject.Quests.includes(beatmap.quest._id)) {
            pointsObject.Quests.push(beatmap.quest._id);
            pointsObject.QuestReward += findQuestPoints(beatmap.quest.deadline, beatmap.quest.completed, beatmap.rankedDate); // 7 points per quest if not over deadline
        }
        // mission reward points and completed missions list
        if (missionParticipation &&
            beatmap.mission &&
            !pointsObject.Missions.includes(beatmap.mission._id) &&
            beatmap.mission.winningBeatmaps.some(b => b.id == beatmap.id) &&
            (beatmap.host.id == userId || beatmap.mission.id == '65a3376e48f36f2622ef2f44' || beatmap.mission.id == '665bbcc1ff4c38cea1113337') // both mappers for True Cooperation & Multi-mode enthusiasts "win"
        ) {
            let isValidMissionParticipation;
            for (const task of beatmap.tasks) {
                if (task.mappers.some(m => m.id == userId) && task.name !== task_1.TaskName.Hitsounds && task.name !== task_1.TaskName.Storyboard) {
                    isValidMissionParticipation = true;
                    if (['63035eff1e8b9e4fa900836f', '62e3dedd9a268823d2e436b8', '6401d31e517b1f1d40ca78e2'].includes(userId) && beatmap.mission.id == '665bbcc1ff4c38cea1113337') { // skipping rewards for people who tried to circumvent the rules (or the spirit of the rules) for easy mission progress/points. i want to give the host pity points at least. relevant maps: https://osu.ppy.sh/beatmapsets/2202586#taiko/4719311 and https://osu.ppy.sh/beatmapsets/1670325#osu/4767848
                        isValidMissionParticipation = false;
                    }
                }
            }
            if (isValidMissionParticipation) {
                pointsObject.Missions.push(beatmap.mission._id);
                pointsObject.MissionReward += findMissionPoints(beatmap.mission.tier); // depends on mission tier
            }
        }
    }
    // process unranked mission beatmaps for extra points
    const unrankedMissionBeatmaps = await beatmap_2.BeatmapModel
        .find({
        status: { $ne: beatmap_1.BeatmapStatus.Ranked },
        tasks: {
            $in: ownTasks,
        },
        mission: { $exists: true },
    }).populate(taskPointsPopulate);
    for (const beatmap of unrankedMissionBeatmaps) {
        if (beatmap.mission &&
            !pointsObject.Missions.includes(beatmap.mission._id) &&
            beatmap.mission.winningBeatmaps.some(b => b.id == beatmap.id)) {
            pointsObject.Missions.push(beatmap.mission._id);
            pointsObject.MissionReward += findMissionPoints(beatmap.mission.tier); // depends on mission tier
        }
    }
    return pointsObject;
}
exports.calculateTasksPoints = calculateTasksPoints;
/** 3 points per mapset */
async function calculateHostPoints(userId) {
    const hostedBeatmaps = await beatmap_2.BeatmapModel.countDocuments({
        status: beatmap_1.BeatmapStatus.Ranked,
        host: userId,
    });
    return hostedBeatmaps * 3;
}
exports.calculateHostPoints = calculateHostPoints;
/** 1 point per mod */
async function calculateModPoints(userId) {
    const [modderPoints, nominatorBeatmaps] = await Promise.all([
        beatmap_2.BeatmapModel.countDocuments({
            status: beatmap_1.BeatmapStatus.Ranked,
            modders: userId,
            bns: { $ne: userId },
        }),
        beatmap_2.BeatmapModel
            .find({
            status: beatmap_1.BeatmapStatus.Ranked,
            bns: userId,
        })
            .defaultPopulate(),
    ]);
    let totalNominatorPoints = 0;
    for (const beatmap of nominatorBeatmaps) {
        const bonus = getLengthNerf((beatmap.length * beatmap.tasks.length) / 1.5);
        if (bonus < 1)
            totalNominatorPoints++;
        else
            totalNominatorPoints += bonus;
    }
    return modderPoints + Math.ceil(totalNominatorPoints);
}
exports.calculateModPoints = calculateModPoints;
async function calculateSpentPoints(userId) {
    const ownSpentPoints = await spentPoints_1.SpentPointsModel
        .find({ user: userId })
        .populate({
        path: 'quest',
        select: 'price art requiredMapsets',
    });
    let total = 0;
    for (const spentPoints of ownSpentPoints) {
        if (spentPoints.category == spentPoints_2.SpentPointsCategory.AcceptQuest) {
            total += spentPoints.quest.price; // price of quest on listing
        }
        else if (spentPoints.category == spentPoints_2.SpentPointsCategory.ExtendDeadline) {
            total += exports.extendQuestPrice; // 10 points to extend deadline. no longer used
        }
        else if (spentPoints.category == spentPoints_2.SpentPointsCategory.ReopenQuest) {
            total += getReopenQuestPoints(spentPoints.quest.price);
        }
        else if (spentPoints.category == spentPoints_2.SpentPointsCategory.CreateQuest) {
            total += findCreateQuestPointsSpent(spentPoints.quest.art, spentPoints.quest.requiredMapsets);
        }
        else if (spentPoints.category == spentPoints_2.SpentPointsCategory.RerollShowcaseMissionSong) {
            total += exports.rerollShowcaseMissionSongPrice; // 35 points to reroll song
        }
    }
    return total;
}
exports.calculateSpentPoints = calculateSpentPoints;
async function calculateContestPoints(userId) {
    /**
     * FA contests they created
     * FA contests they submitted entries to
     * FA contests they screened
     * FA contests they judged
     */
    const [createdContests, submissions, screenedContests, judgedContests] = await Promise.all([
        contest_1.ContestModel
            .countDocuments({
            creators: userId,
            isFeaturedArtistContest: true,
            isEligibleForPoints: true,
            status: contest_2.ContestStatus.Complete,
        }),
        submission_1.SubmissionModel
            .find({ creator: userId })
            .populate({ path: 'contest', select: 'isFeaturedArtistContest isEligibleForPoints' }),
        contest_1.ContestModel
            .countDocuments({
            screeners: userId,
            isFeaturedArtistContest: true,
            isEligibleForPoints: true,
            status: contest_2.ContestStatus.Complete,
        }),
        contest_1.ContestModel
            .find({
            judges: userId,
            isFeaturedArtistContest: true,
            isEligibleForPoints: true,
            status: contest_2.ContestStatus.Complete,
        })
            .populate({
            path: 'submissions',
            populate: {
                path: 'screenings',
            },
        }),
    ]);
    let relevantSubmissionCount = 0;
    for (const submission of submissions) {
        if (submission.contest && submission.contest.isFeaturedArtistContest && submission.contest.isEligibleForPoints) {
            relevantSubmissionCount++;
        }
    }
    let judgePoints = 0;
    for (const contest of judgedContests) {
        if (contest.submissions.length > 15) {
            if (contest.judgingThreshold > 0) {
                let passingThresholdSubmissionsCount = 0;
                for (const submission of contest.submissions) {
                    let screeningTotal = 0;
                    for (const screening of submission.screenings) {
                        screeningTotal += screening.vote;
                    }
                    if (screeningTotal > contest.judgingThreshold) {
                        passingThresholdSubmissionsCount++;
                    }
                }
                if (passingThresholdSubmissionsCount > 15) {
                    judgePoints += 1 + Math.log(passingThresholdSubmissionsCount / 15);
                }
                else {
                    judgePoints++;
                }
            }
            else {
                judgePoints += 1 + Math.log(contest.submissions.length / 15);
            }
        }
        else {
            judgePoints++;
        }
    }
    return {
        ContestCreator: createdContests * 5,
        ContestParticipant: relevantSubmissionCount * 3,
        ContestScreener: screenedContests,
        ContestJudge: judgePoints, // 1 point per judging, scaling with # of submissions past 15
    };
}
exports.calculateContestPoints = calculateContestPoints;
function decimalRound(value) {
    return Math.round(value * 1000) / 1000;
}
/**
 * @returns Total points
 */
async function updateUserPoints(userId) {
    const [taskPoints, modPoints, hostPoints, spentPoints, contestPoints] = await Promise.all([
        calculateTasksPoints(userId),
        calculateModPoints(userId),
        calculateHostPoints(userId),
        calculateSpentPoints(userId),
        calculateContestPoints(userId),
    ]);
    const { rank, totalPoints } = await getUserRank(userId, taskPoints, modPoints, hostPoints, contestPoints);
    await user_1.UserModel.findByIdAndUpdate(userId, {
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
    return Math.round(totalPoints * 10) / 10;
}
exports.updateUserPoints = updateUserPoints;
