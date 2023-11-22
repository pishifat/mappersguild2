"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SBQuality = exports.TaskStatus = exports.TaskMode = exports.TaskName = exports.SortedTasks = void 0;
exports.SortedTasks = [
    'Easy',
    'Normal',
    'Hard',
    'Insane',
    'Expert',
    'Hitsounds',
    'Storyboard',
];
var TaskName;
(function (TaskName) {
    TaskName["Easy"] = "Easy";
    TaskName["Normal"] = "Normal";
    TaskName["Hard"] = "Hard";
    TaskName["Insane"] = "Insane";
    TaskName["Expert"] = "Expert";
    TaskName["Hitsounds"] = "Hitsounds";
    TaskName["Storyboard"] = "Storyboard";
})(TaskName = exports.TaskName || (exports.TaskName = {}));
var TaskMode;
(function (TaskMode) {
    TaskMode["Osu"] = "osu";
    TaskMode["Taiko"] = "taiko";
    TaskMode["Catch"] = "catch";
    TaskMode["Mania"] = "mania";
    TaskMode["SB"] = "sb";
    TaskMode["HS"] = "hs";
})(TaskMode = exports.TaskMode || (exports.TaskMode = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["WIP"] = "WIP";
    TaskStatus["Done"] = "Done";
})(TaskStatus = exports.TaskStatus || (exports.TaskStatus = {}));
var SBQuality;
(function (SBQuality) {
    SBQuality[SBQuality["Meh"] = 1] = "Meh";
    SBQuality[SBQuality["Ok"] = 2] = "Ok";
    SBQuality[SBQuality["Nice"] = 3] = "Nice";
})(SBQuality = exports.SBQuality || (exports.SBQuality = {}));
