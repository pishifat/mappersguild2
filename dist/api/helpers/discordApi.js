"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookColors = void 0;
exports.webhookPost = webhookPost;
exports.devWebhookPost = devWebhookPost;
exports.externalWebhookPost = externalWebhookPost;
const helpers_1 = require("./helpers");
const config_json_1 = __importDefault(require("../../config.json"));
const axios_1 = __importDefault(require("axios"));
async function webhookPost(message) {
    // webhook: #mappers-guild
    // nikWebhook: something on nik's server
    const webhooks = [config_json_1.default.webhook, config_json_1.default.nikWebhook];
    for (const webhook of webhooks) {
        const url = `https://discordapp.com/api/webhooks/${webhook.id}/${webhook.token}`;
        try {
            const res = await axios_1.default.post(url, {
                embeds: message,
            });
            if (res?.data) {
                return { success: 'ok' };
            }
        }
        catch (error) {
            return helpers_1.defaultErrorMessage;
        }
    }
    return helpers_1.defaultErrorMessage;
}
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
exports.webhookColors = {
    lightRed: 16742771, // new member joins, DEV: actions
    darkRed: 8787477,
    red: 15607337, // drop quest
    lightOrange: 15639928, // mission closed
    darkOrange: 7092736,
    orange: 15169835, // create quest (admin)
    lightYellow: 16777104, // rank 3 tier up
    darkYellow: 7105536,
    yellow: 16777022, // create quest (user)
    lightGreen: 8847214,
    darkGreen: 1921053,
    green: 4380222, // accept quest
    lightBlue: 8643583, // mission open
    darkBlue: 1911891,
    blue: 6786559, // map ranked
    lightPurple: 11173873,
    darkPurple: 4263999,
    purple: 8536232, // quest completed
    pink: 16728232, // open contest
    white: 15724527, // re-open quest
    brown: 7554849, // rank 1 tier up
    gray: 11186352, // rank 2 tier up
    black: 2564903, // dev
};
