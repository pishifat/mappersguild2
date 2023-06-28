"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissionMode = exports.MissionStatus = void 0;
var MissionStatus;
(function (MissionStatus) {
    MissionStatus["Open"] = "open";
    MissionStatus["Closed"] = "closed";
    MissionStatus["Hidden"] = "hidden";
})(MissionStatus = exports.MissionStatus || (exports.MissionStatus = {}));
var MissionMode;
(function (MissionMode) {
    MissionMode["Osu"] = "osu";
    MissionMode["Taiko"] = "taiko";
    MissionMode["Catch"] = "catch";
    MissionMode["Mania"] = "mania";
})(MissionMode = exports.MissionMode || (exports.MissionMode = {}));
