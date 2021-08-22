"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessages = exports.sendMessage = exports.getBotToken = void 0;
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
            scope: 'bot chat.write',
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
/**
 * @param {number} userId
 * @param {string} message
 * @returns {Promise<boolean | {error: string}>}
 */
async function sendMessage(userId, message) {
    const token = await getBotToken();
    await helpers_1.sleep(500); // prevent rate limiting
    if (typeof token !== 'string') {
        return { error: token.error };
    }
    try {
        await axios_1.default.post('https://osu.ppy.sh/api/v2/chat/new', {
            target_id: userId,
            message,
            is_action: false,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return true;
    }
    catch (error) {
        return { error };
    }
}
exports.sendMessage = sendMessage;
/**
 * @param {number} userId
 * @param {string[]} messages
 * @returns {Promise<boolean | {error: string}>}
 */
async function sendMessages(userId, messages) {
    for (const message of messages) {
        const res = await sendMessage(userId, message);
        if (typeof res !== 'boolean') {
            return { error: res.error };
        }
    }
    return true;
}
exports.sendMessages = sendMessages;
