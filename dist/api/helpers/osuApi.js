"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOsuResponseError = isOsuResponseError;
exports.getToken = getToken;
exports.getClientCredentialsGrant = getClientCredentialsGrant;
exports.refreshToken = refreshToken;
exports.getUserInfo = getUserInfo;
exports.getUserInfoFromId = getUserInfoFromId;
exports.getBeatmapsetV2Info = getBeatmapsetV2Info;
exports.getDiscussions = getDiscussions;
exports.getBeatmapsSearch = getBeatmapsSearch;
const axios_1 = __importDefault(require("axios"));
const querystring_1 = __importDefault(require("querystring"));
const helpers_1 = require("./helpers");
const config_json_1 = __importDefault(require("../../config.json"));
function isOsuResponseError(errorResponse) {
    return errorResponse.error !== undefined;
}
async function executeRequest(options) {
    try {
        const res = await (0, axios_1.default)(options);
        if (res?.data) {
            return res.data;
        }
        return helpers_1.defaultErrorMessage;
    }
    catch (error) {
        return helpers_1.defaultErrorMessage;
    }
}
async function getToken(code, isMerch) {
    const postData = querystring_1.default.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: !isMerch ? config_json_1.default.redirect : config_json_1.default.merchAuth.redirect,
        client_id: !isMerch ? config_json_1.default.id : config_json_1.default.merchAuth.id,
        client_secret: !isMerch ? config_json_1.default.secret : config_json_1.default.merchAuth.secret,
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
async function getUserInfoFromId(token, id) {
    const options = {
        method: 'GET',
        url: `https://osu.ppy.sh/api/v2/users/${id}`,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    try {
        const res = await (0, axios_1.default)(options);
        if (res?.data) {
            return res.data;
        }
        return helpers_1.defaultErrorMessage;
    }
    catch (error) {
        return helpers_1.defaultErrorMessage;
    }
}
async function getBeatmapsetV2Info(token, setId) {
    const options = {
        method: 'GET',
        url: `https://osu.ppy.sh/api/v2/beatmapsets/${setId}`,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    try {
        const res = await (0, axios_1.default)(options);
        if (res?.data) {
            return res.data;
        }
        return helpers_1.defaultErrorMessage;
    }
    catch (error) {
        return helpers_1.defaultErrorMessage;
    }
}
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
        const res = await (0, axios_1.default)(options);
        if (res?.data) {
            return res.data;
        }
        return helpers_1.defaultErrorMessage;
    }
    catch (error) {
        return helpers_1.defaultErrorMessage;
    }
}
async function getBeatmapsSearch(token, params) {
    const url = `https://osu.ppy.sh/api/v2/beatmapsets/search/${params}`;
    const options = {
        method: 'GET',
        url,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    try {
        const res = await (0, axios_1.default)(options);
        if (res?.data) {
            return res.data;
        }
        return helpers_1.defaultErrorMessage;
    }
    catch (error) {
        return helpers_1.defaultErrorMessage;
    }
}
