"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContestMode = exports.ContestStatus = void 0;
var ContestStatus;
(function (ContestStatus) {
    ContestStatus["Hidden"] = "hidden";
    ContestStatus["Beatmapping"] = "beatmapping";
    ContestStatus["Screening"] = "screening";
    ContestStatus["Judging"] = "judging";
    ContestStatus["Locked"] = "locked";
    ContestStatus["Complete"] = "complete";
})(ContestStatus = exports.ContestStatus || (exports.ContestStatus = {}));
var ContestMode;
(function (ContestMode) {
    ContestMode["Osu"] = "osu";
    ContestMode["Taiko"] = "taiko";
    ContestMode["Catch"] = "catch";
    ContestMode["Mania"] = "mania";
})(ContestMode = exports.ContestMode || (exports.ContestMode = {}));
