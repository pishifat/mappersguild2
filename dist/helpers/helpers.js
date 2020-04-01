"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const quest_1 = require("../interfaces/quest");
function canFail(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch((error) => {
            console.log(error.message);
            return next(error);
        });
    };
}
exports.canFail = canFail;
function findBeatmapsetId(url) {
    const indexStart = url.indexOf('beatmapsets/') + 'beatmapsets/'.length;
    const indexEnd = url.indexOf('#');
    let bmId = '';
    if (indexEnd !== -1) {
        bmId = url.slice(indexStart, indexEnd);
    }
    else {
        bmId = url.slice(indexStart);
    }
    return parseInt(bmId, 10);
}
exports.findBeatmapsetId = findBeatmapsetId;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.sleep = sleep;
function findLengthNerf(length) {
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
exports.findLengthNerf = findLengthNerf;
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
function findQuestBonus(status, deadline, rankedDate, totalMappers) {
    let questBonus = 0;
    if (status == quest_1.QuestStatus.Done) {
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
    }
    return questBonus / totalMappers;
}
exports.findQuestBonus = findQuestBonus;
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
exports.defaultErrorMessage = { error: 'Something went wrong!' };
