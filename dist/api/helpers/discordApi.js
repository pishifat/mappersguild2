"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookColors = exports.externalWebhookPost = exports.showcaseWebhookPost = exports.devWebhookPost = exports.webhookPost = void 0;
const helpers_1 = require("./helpers");
const config_json_1 = __importDefault(require("../../config.json"));
const axios_1 = __importDefault(require("axios"));
async function webhookPost(message) {
    const url = `https://discordapp.com/api/webhooks/${config_json_1.default.webhook.id}/${config_json_1.default.webhook.token}`;
    try {
        const res = await axios_1.default.post(url, {
            embeds: message,
        });
        if (res?.data) {
            return { success: 'ok' };
        }
        return helpers_1.defaultErrorMessage;
    }
    catch (error) {
        return helpers_1.defaultErrorMessage;
    }
}
exports.webhookPost = webhookPost;
async function devWebhookPost(message) {
    const url = `https://discordapp.com/api/webhooks/${config_json_1.default.devWebhook.id}/${config_json_1.default.devWebhook.token}`;
    try {
        const res = await axios_1.default.post(url, {
            embeds: message,
        });
        if (res?.data) {
            return { success: 'ok' };
        }
        return helpers_1.defaultErrorMessage;
    }
    catch (error) {
        return helpers_1.defaultErrorMessage;
    }
}
exports.devWebhookPost = devWebhookPost;
async function showcaseWebhookPost(message) {
    const url = `https://discordapp.com/api/webhooks/${config_json_1.default.showcaseWebhook.id}/${config_json_1.default.showcaseWebhook.token}`;
    try {
        const res = await axios_1.default.post(url, {
            embeds: message,
        });
        if (res?.data) {
            return { success: 'ok' };
        }
        return helpers_1.defaultErrorMessage;
    }
    catch (error) {
        return helpers_1.defaultErrorMessage;
    }
}
exports.showcaseWebhookPost = showcaseWebhookPost;
async function externalWebhookPost(message, type) {
    let id;
    let token;
    if (type == 'regraz') {
        id = config_json_1.default.regrazWebhook.id;
        token = config_json_1.default.regrazWebhook.token;
    }
    else if (type == 'riana') {
        id = config_json_1.default.rianaWebhook.id;
        token = config_json_1.default.rianaWebhook.token;
    }
    const url = `https://discordapp.com/api/webhooks/${id}/${token}`;
    try {
        const res = await axios_1.default.post(url, {
            embeds: message,
        });
        if (res?.data) {
            return { success: 'ok' };
        }
        return helpers_1.defaultErrorMessage;
    }
    catch (error) {
        return helpers_1.defaultErrorMessage;
    }
}
exports.externalWebhookPost = externalWebhookPost;
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
