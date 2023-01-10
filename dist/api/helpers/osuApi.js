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
            const beatmapResponse = res.data[0];
            beatmapResponse.approved = parseInt(beatmapResponse.approved, 10);
            beatmapResponse.beatmap_id = parseInt(beatmapResponse.beatmap_id, 10);
            beatmapResponse.beatmapset_id = parseInt(beatmapResponse.beatmapset_id, 10);
            beatmapResponse.creator_id = parseInt(beatmapResponse.creator_id, 10);
            beatmapResponse.hit_length = parseInt(beatmapResponse.hit_length, 10);
            beatmapResponse.total_length = parseInt(beatmapResponse.total_length, 10);
            beatmapResponse.mode = parseInt(beatmapResponse.mode, 10);
            beatmapResponse.approved_date = new Date(beatmapResponse.approved_date);
            return beatmapResponse;
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
