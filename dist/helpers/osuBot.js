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
exports.sendMessages = exports.sendMessage = exports.getBotToken = void 0;
const config_json_1 = __importDefault(require("../config.json"));
const axios_1 = __importDefault(require("axios"));
const helpers_1 = require("./helpers");
let tokenInfo = {
    expiresAt: new Date(0),
    token: '',
};
function getBotToken() {
    return __awaiter(this, void 0, void 0, function* () {
        if (tokenInfo.expiresAt && tokenInfo.expiresAt > new Date()) {
            return tokenInfo.token;
        }
        try {
            const { data } = yield axios_1.default.post('https://osu.ppy.sh/oauth/token', {
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
    });
}
exports.getBotToken = getBotToken;
function sendMessage(userId, message) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = yield getBotToken();
        yield helpers_1.sleep(500);
        if (typeof token !== 'string') {
            return { error: token.error };
        }
        try {
            yield axios_1.default.post('https://osu.ppy.sh/api/v2/chat/new', {
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
    });
}
exports.sendMessage = sendMessage;
function sendMessages(userId, messages) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const message of messages) {
            const res = yield sendMessage(userId, message);
            if (typeof res !== 'boolean') {
                return { error: res.error };
            }
        }
        return true;
    });
}
exports.sendMessages = sendMessages;
