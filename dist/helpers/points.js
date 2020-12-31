"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserPoints = exports.calculateMbcPoints = exports.calculateSpentPoints = exports.calculateModPoints = exports.calculateHostPoints = exports.calculateTasksPoints = exports.getUserRank = exports.findCreateQuestPointsSpent = exports.getReopenQuestPoints = exports.findStoryboardPoints = exports.getQuestBonus = exports.findQuestPoints = exports.findDifficultyPoints = exports.getLengthNerf = exports.extendQuestPrice = void 0;
const beatmap_1 = require("../interfaces/beatmap/beatmap");
const beatmap_2 = require("../models/beatmap/beatmap");
const task_1 = require("../interfaces/beatmap/task");
const task_2 = require("../models/beatmap/task");
const contest_1 = require("../models/contest/contest");
const submission_1 = require("../models/contest/submission");
const spentPoints_1 = require("../models/spentPoints");
const user_1 = require("../models/user");
const spentPoints_2 = require("../interfaces/spentPoints");
const quest_1 = require("../interfaces/quest");
exports.extendQuestPrice = 10;
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
    };
    return difficultyPointsObject[taskName] / totalMappers;
}
exports.findDifficultyPoints = findDifficultyPoints;
function findQuestPoints(deadline, questCompletedDate, rankedDate) {
    const lateness = +deadline - +questCompletedDate;
    if (lateness > 0 && +rankedDate > +new Date('2019-03-01')) {
        return 7;
    }
    else {
        return 0;
    }
}
exports.findQuestPoints = findQuestPoints;
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
function findStoryboardPoints(storyboardQuality) {
    if (!storyboardQuality) {
        return 0;
    }
    else if (storyboardQuality == 2) {
        return 7.5;
    }
    else {
        return (storyboardQuality * storyboardQuality + 1);
    }
}
exports.findStoryboardPoints = findStoryboardPoints;
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
function getUserRank(userId, tasksPoints, modPoints, hostPoints, mbcPoints) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield user_1.UserModel.findById(userId).orFail();
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
        else {
            rank = 4;
        }
        return {
            rank,
            totalPoints,
        };
    });
}
exports.getUserRank = getUserRank;
function calculateTasksPoints(userId) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const ownTasks = yield task_2.TaskModel.find({ mappers: userId }).select('_id');
        const userBeatmaps = yield beatmap_2.BeatmapModel
            .find({
            status: beatmap_1.BeatmapStatus.Ranked,
            tasks: {
                $in: ownTasks,
            },
        }).populate([
            { path: 'host', select: '_id osuId username' },
            { path: 'modders', select: '_id osuId username' },
            { path: 'quest', select: '_id name status price completed deadline' },
            { path: 'tasks', populate: { path: 'mappers' } },
        ]);
        const pointsObject = {
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
        for (const beatmap of userBeatmaps) {
            let questParticipation = false;
            const lengthNerf = getLengthNerf(beatmap.length);
            for (const task of beatmap.tasks) {
                if (task.mappers.some(m => m.id == userId)) {
                    if (task.name != task_1.TaskName.Storyboard) {
                        let questBonus = 0;
                        if (((_a = beatmap.quest) === null || _a === void 0 ? void 0 : _a.status) === quest_1.QuestStatus.Done) {
                            questParticipation = true;
                            questBonus = getQuestBonus(beatmap.quest.deadline, beatmap.rankedDate, task.mappers.length);
                        }
                        else if (beatmap.isShowcase) {
                            questBonus = 2;
                        }
                        const taskPoints = findDifficultyPoints(task.name, task.mappers.length);
                        const finalPoints = ((taskPoints + questBonus) * lengthNerf);
                        pointsObject[task.name] += finalPoints;
                        pointsObject[task.mode] += finalPoints;
                    }
                    else {
                        const taskPoints = findStoryboardPoints(task.sbQuality);
                        pointsObject[task.name] += taskPoints;
                    }
                }
            }
            if (questParticipation &&
                beatmap.quest &&
                !pointsObject.Quests.includes(beatmap.quest._id)) {
                pointsObject.Quests.push(beatmap.quest._id);
                pointsObject.QuestReward += findQuestPoints(beatmap.quest.deadline, beatmap.quest.completed, beatmap.rankedDate);
            }
        }
        return pointsObject;
    });
}
exports.calculateTasksPoints = calculateTasksPoints;
function calculateHostPoints(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const hostedBeatmaps = yield beatmap_2.BeatmapModel.countDocuments({
            status: beatmap_1.BeatmapStatus.Ranked,
            host: userId,
        });
        return hostedBeatmaps * 5;
    });
}
exports.calculateHostPoints = calculateHostPoints;
function calculateModPoints(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const moddedBeatmaps = yield beatmap_2.BeatmapModel.countDocuments({
            status: beatmap_1.BeatmapStatus.Ranked,
            modders: userId,
        });
        return moddedBeatmaps;
    });
}
exports.calculateModPoints = calculateModPoints;
function calculateSpentPoints(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const ownSpentPoints = yield spentPoints_1.SpentPointsModel
            .find({ user: userId })
            .populate({
            path: 'quest',
            select: 'price art requiredMapsets',
        });
        let total = 0;
        for (const spentPoints of ownSpentPoints) {
            if (spentPoints.category == spentPoints_2.SpentPointsCategory.AcceptQuest) {
                total += spentPoints.quest.price;
            }
            else if (spentPoints.category == spentPoints_2.SpentPointsCategory.ExtendDeadline) {
                total += exports.extendQuestPrice;
            }
            else if (spentPoints.category == spentPoints_2.SpentPointsCategory.ReopenQuest) {
                total += getReopenQuestPoints(spentPoints.quest.price);
            }
            else if (spentPoints.category == spentPoints_2.SpentPointsCategory.CreateQuest) {
                total += findCreateQuestPointsSpent(spentPoints.quest.art, spentPoints.quest.requiredMapsets);
            }
        }
        return total;
    });
}
exports.calculateSpentPoints = calculateSpentPoints;
function calculateMbcPoints(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const [submittedContests, screenedContests, judgedContests] = yield Promise.all([
            submission_1.SubmissionModel.countDocuments({
                creator: userId,
            }),
            contest_1.ContestModel.countDocuments({
                screeners: userId,
            }),
            contest_1.ContestModel.countDocuments({
                judges: userId,
            }),
        ]);
        return {
            ContestParticipant: submittedContests * 5,
            ContestScreener: screenedContests,
            ContestJudge: judgedContests,
        };
    });
}
exports.calculateMbcPoints = calculateMbcPoints;
function demicalRound(value) {
    return Math.round(value * 1000) / 1000;
}
function updateUserPoints(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const [taskPoints, modPoints, hostPoints, spentPoints, mbcPoints] = yield Promise.all([
            calculateTasksPoints(userId),
            calculateModPoints(userId),
            calculateHostPoints(userId),
            calculateSpentPoints(userId),
            calculateMbcPoints(userId),
        ]);
        const { rank, totalPoints } = yield getUserRank(userId, taskPoints, modPoints, hostPoints, mbcPoints);
        yield user_1.UserModel.findByIdAndUpdate(userId, {
            easyPoints: demicalRound(taskPoints['Easy']),
            normalPoints: demicalRound(taskPoints['Normal']),
            hardPoints: demicalRound(taskPoints['Hard']),
            insanePoints: demicalRound(taskPoints['Insane']),
            expertPoints: demicalRound(taskPoints['Expert']),
            storyboardPoints: demicalRound(taskPoints['Storyboard']),
            osuPoints: demicalRound(taskPoints['osu']),
            taikoPoints: demicalRound(taskPoints['taiko']),
            catchPoints: demicalRound(taskPoints['catch']),
            maniaPoints: demicalRound(taskPoints['mania']),
            questPoints: taskPoints['QuestReward'],
            completedQuests: taskPoints['Quests'],
            contestParticipantPoints: mbcPoints.ContestParticipant,
            contestScreenerPoints: mbcPoints.ContestScreener,
            contestJudgePoints: mbcPoints.ContestJudge,
            modPoints,
            hostPoints,
            spentPoints,
            rank,
        });
        return totalPoints;
    });
}
exports.updateUserPoints = updateUserPoints;
