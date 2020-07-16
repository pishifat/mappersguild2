"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultErrorMessage = exports.sleep = exports.findBeatmapsetId = void 0;
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
exports.defaultErrorMessage = { error: 'Something went wrong!' };
