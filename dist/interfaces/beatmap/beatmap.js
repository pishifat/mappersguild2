"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeatmapMode = exports.BeatmapStatus = void 0;
var BeatmapStatus;
(function (BeatmapStatus) {
    BeatmapStatus["WIP"] = "WIP";
    BeatmapStatus["Done"] = "Done";
    BeatmapStatus["Qualified"] = "Qualified";
    BeatmapStatus["Ranked"] = "Ranked";
})(BeatmapStatus || (exports.BeatmapStatus = BeatmapStatus = {}));
var BeatmapMode;
(function (BeatmapMode) {
    BeatmapMode["Osu"] = "osu";
    BeatmapMode["Taiko"] = "taiko";
    BeatmapMode["Catch"] = "catch";
    BeatmapMode["Mania"] = "mania";
    BeatmapMode["Hybrid"] = "hybrid";
})(BeatmapMode || (exports.BeatmapMode = BeatmapMode = {}));
