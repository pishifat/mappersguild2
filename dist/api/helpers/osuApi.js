"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaps = exports.getDiscussions = exports.getBeatmapsetV2Info = exports.beatmapsetInfo = exports.getUserInfoFromId = exports.getUserInfo = exports.refreshToken = exports.getClientCredentialsGrant = exports.getToken = exports.isOsuResponseError = void 0;
const axios_1 = __importDefault(require("axios"));
const querystring_1 = __importDefault(require("querystring"));
const helpers_1 = require("./helpers");
const config_json_1 = __importDefault(require("../../config.json"));
function isOsuResponseError(errorResponse) {
    return errorResponse.error !== undefined;
}
exports.isOsuResponseError = isOsuResponseError;
async function executeRequest(options) {
    try {
        const res = await axios_1.default(options);
        if (res?.data) {
            return res.data;
        }
        return helpers_1.defaultErrorMessage;
    }
    catch (error) {
        return helpers_1.defaultErrorMessage;
    }
}
async function getToken(code) {
    const postData = querystring_1.default.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: config_json_1.default.redirect,
        client_id: config_json_1.default.id,
        client_secret: config_json_1.default.secret,
    });
    const options = {
        url: 'https://osu.ppy.sh/oauth/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: postData,
    };
    return await executeRequest(options);
}
exports.getToken = getToken;
async function getClientCredentialsGrant() {
    const postData = querystring_1.default.stringify({
        grant_type: 'client_credentials',
        client_id: config_json_1.default.id,
        client_secret: config_json_1.default.secret,
        scope: 'public',
    });
    const options = {
        url: 'https://osu.ppy.sh/oauth/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: postData,
    };
    return await executeRequest(options);
}
exports.getClientCredentialsGrant = getClientCredentialsGrant;
async function refreshToken(refreshToken) {
    const postData = querystring_1.default.stringify({
        grant_type: 'refresh_token',
        client_id: config_json_1.default.id,
        client_secret: config_json_1.default.secret,
        refresh_token: refreshToken,
    });
    const options = {
        url: 'https://osu.ppy.sh/oauth/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: postData,
    };
    return await executeRequest(options);
}
exports.refreshToken = refreshToken;
async function getUserInfo(token) {
    const options = {
        url: 'https://osu.ppy.sh/api/v2/me',
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    return await executeRequest(options);
}
exports.getUserInfo = getUserInfo;
async function getUserInfoFromId(id) {
    const url = `https://osu.ppy.sh/api/get_user?k=${config_json_1.default.v1token}&u=${id}`;
    const res = await axios_1.default.get(url);
    return res.data[0];
}
exports.getUserInfoFromId = getUserInfoFromId;
async function beatmapsetInfo(setId) {
    const url = `https://osu.ppy.sh/api/get_beatmaps?k=${config_json_1.default.v1token}&s=${setId}`;
    try {
        const res = await axios_1.default.get(url);
        if (res?.data?.length > 0) {
            const beatmaps = res.data;
            let longestBeatmap = res.data[0];
            for (const beatmap of beatmaps) {
                if (parseInt(beatmap.total_length) > parseInt(longestBeatmap.total_length)) {
                    longestBeatmap = beatmap;
                }
            }
            longestBeatmap.approved = parseInt(longestBeatmap.approved, 10);
            longestBeatmap.beatmap_id = parseInt(longestBeatmap.beatmap_id, 10);
            longestBeatmap.beatmapset_id = parseInt(longestBeatmap.beatmapset_id, 10);
            longestBeatmap.creator_id = parseInt(longestBeatmap.creator_id, 10);
            longestBeatmap.hit_length = parseInt(longestBeatmap.hit_length, 10);
            longestBeatmap.total_length = parseInt(longestBeatmap.total_length, 10);
            longestBeatmap.mode = parseInt(longestBeatmap.mode, 10);
            longestBeatmap.approved_date = new Date(longestBeatmap.approved_date);
            return longestBeatmap;
        }
        return helpers_1.defaultErrorMessage;
    }
    catch (error) {
        return helpers_1.defaultErrorMessage;
    }
}
exports.beatmapsetInfo = beatmapsetInfo;
async function getBeatmapsetV2Info(token, setId) {
    const options = {
        method: 'GET',
        url: `https://osu.ppy.sh/api/v2/beatmapsets/${setId}`,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    try {
        const res = await axios_1.default(options);
        if (res?.data) {
            return res.data;
        }
        return helpers_1.defaultErrorMessage;
    }
    catch (error) {
        return helpers_1.defaultErrorMessage;
    }
}
exports.getBeatmapsetV2Info = getBeatmapsetV2Info;
async function getDiscussions(token, params) {
    const url = `https://osu.ppy.sh/api/v2/beatmapsets/discussions${params}`;
    const options = {
        method: 'GET',
        url,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    try {
        const res = await axios_1.default(options);
        if (res?.data) {
            return res.data;
        }
        return helpers_1.defaultErrorMessage;
    }
    catch (error) {
        return helpers_1.defaultErrorMessage;
    }
}
exports.getDiscussions = getDiscussions;
async function getMaps(date) {
    let beatmaps = [];
    const today = new Date();
    try {
        while (date < new Date(today.setDate(today.getDate() - 7))) {
            const url = `https://osu.ppy.sh/api/get_beatmaps?k=${config_json_1.default.v1token}&since=${date.toISOString()}`;
            const res = await axios_1.default.get(url);
            if (res.data.length) {
                date = new Date(res.data[res.data.length - 1].approved_date);
                beatmaps = beatmaps.concat(res.data);
                await helpers_1.sleep(2000);
            }
        }
        if (beatmaps.length > 0) {
            return beatmaps;
        }
        return helpers_1.defaultErrorMessage;
    }
    catch (error) {
        return helpers_1.defaultErrorMessage;
    }
}
exports.getMaps = getMaps;
