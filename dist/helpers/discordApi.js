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
exports.webhookColors = exports.webhookPost = void 0;
const helpers_1 = require("./helpers");
const config_json_1 = __importDefault(require("../config.json"));
const axios_1 = __importDefault(require("axios"));
function webhookPost(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://discordapp.com/api/webhooks/${config_json_1.default.webhook.id}/${config_json_1.default.webhook.token}`;
        try {
            const res = yield axios_1.default.post(url, {
                embeds: message,
            });
            if (res === null || res === void 0 ? void 0 : res.data) {
                return { success: 'ok' };
            }
            return helpers_1.defaultErrorMessage;
        }
        catch (error) {
            return helpers_1.defaultErrorMessage;
        }
    });
}
exports.webhookPost = webhookPost;
exports.webhookColors = {
    lightRed: 16742771,
    darkRed: 8787477,
    red: 15607337,
    lightOrange: 15639928,
    darkOrange: 7092736,
    orange: 15169835,
    lightYellow: 16777104,
    darkYellow: 7105536,
    yellow: 16777022,
    lightGreen: 8847214,
    darkGreen: 1921053,
    green: 4380222,
    lightBlue: 8643583,
    darkBlue: 1911891,
    blue: 6786559,
    lightPurple: 11173873,
    darkPurple: 4263999,
    purple: 8536232,
    pink: 16728232,
    white: 15724527,
    brown: 7554849,
    gray: 11186352,
    black: 2564903,
};
