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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPm = exports.getMaps = exports.beatmapsetInfo = exports.getUserInfo = exports.refreshToken = exports.getToken = exports.isOsuResponseError = void 0;
const axios_1 = __importDefault(require("axios"));
const querystring_1 = __importDefault(require("querystring"));
const helpers_1 = require("./helpers");
const config_json_1 = __importDefault(require("../config.json"));
function isOsuResponseError(errorResponse) {
    return errorResponse.error !== undefined;
}
exports.isOsuResponseError = isOsuResponseError;
function executeRequest(options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield axios_1.default(options);
            if (res === null || res === void 0 ? void 0 : res.data) {
                return res.data;
            }
            return helpers_1.defaultErrorMessage;
        }
        catch (error) {
            return helpers_1.defaultErrorMessage;
        }
    });
}
function getToken(code) {
    return __awaiter(this, void 0, void 0, function* () {
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
        return yield executeRequest(options);
    });
}
exports.getToken = getToken;
function refreshToken(refreshToken) {
    return __awaiter(this, void 0, void 0, function* () {
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
        return yield executeRequest(options);
    });
}
exports.refreshToken = refreshToken;
function getUserInfo(token) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = {
            url: 'https://osu.ppy.sh/api/v2/me',
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        return yield executeRequest(options);
    });
}
exports.getUserInfo = getUserInfo;
function beatmapsetInfo(setId) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://osu.ppy.sh/api/get_beatmaps?k=${config_json_1.default.v1token}&s=${setId}`;
        try {
            const res = yield axios_1.default.get(url);
            if (((_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.length) > 0) {
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
    });
}
exports.beatmapsetInfo = beatmapsetInfo;
function getMaps(date) {
    return __awaiter(this, void 0, void 0, function* () {
        let beatmaps = [];
        const today = new Date();
        try {
            while (date < new Date(today.setDate(today.getDate() - 7))) {
                const url = `https://osu.ppy.sh/api/get_beatmaps?k=${config_json_1.default.v1token}&since=${date.toISOString()}`;
                const res = yield axios_1.default.get(url);
                if (res.data.length) {
                    date = new Date(res.data[res.data.length - 1].approved_date);
                    beatmaps = beatmaps.concat(res.data);
                    yield helpers_1.sleep(2000);
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
    });
}
exports.getMaps = getMaps;
function sendPm(token, osuId, message) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = {
            url: 'https://osu.ppy.sh/api/v2/chat/new',
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            data: {
                target_id: osuId,
                message,
                is_action: false,
            },
        };
        return yield executeRequest(options);
    });
}
exports.sendPm = sendPm;
