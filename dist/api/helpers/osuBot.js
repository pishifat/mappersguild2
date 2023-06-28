"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAnnouncement = exports.getBotToken = void 0;
const config_json_1 = __importDefault(require("../../config.json"));
const axios_1 = __importDefault(require("axios"));
const helpers_1 = require("./helpers");
let tokenInfo = {
    expiresAt: new Date(0),
    token: '',
};
/**
 * @returns {Promise<string | {error: string}>}>}
 */
async function getBotToken() {
    if (tokenInfo.expiresAt && tokenInfo.expiresAt > new Date()) {
        return tokenInfo.token;
    }
    try {
        const { data } = await axios_1.default.post('https://osu.ppy.sh/oauth/token', {
            grant_type: 'client_credentials',
            client_id: config_json_1.default.bot.id,
            client_secret: config_json_1.default.bot.secret,
            scope: 'delegate chat.write',
        });
        tokenInfo = {
            expiresAt: new Date(Date.now() + data.expires_in * 1000),
            token: data.access_token,
        };
        return data.access_token;
    }
    catch (error) {
        return { error };
    }
}
exports.getBotToken = getBotToken;
async function sendAnnouncement(userIds, channel, message) {
    const token = await getBotToken();
    await helpers_1.sleep(500);
    if (typeof token !== 'string') {
        return { error: token.error };
    }
    try {
        await axios_1.default.post('https://osu.ppy.sh/api/v2/chat/channels/', {
            channel: {
                name: channel.name,
                description: channel.description,
            },
            message,
            target_ids: userIds,
            type: 'ANNOUNCE',
        }, {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return true;
    }
    catch (error) {
        return { error };
    }
}
exports.sendAnnouncement = sendAnnouncement;
