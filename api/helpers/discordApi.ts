import { defaultErrorMessage } from './helpers';
import config from '../../config.json';
import Axios from 'axios';

interface DiscordWebhookMessage {
    title?: string;
    description?: string;
    url?: string;
    /** ISO8601 timestamp of embed content */
    timestamp?: string;
    /** color code */
    color?: number;
    author?: {
        name: string;
        icon_url?: string;
        url: string;
    };
    fields?: {
        name: string;
        value: string;
    }[];
    thumbnail?: {
        url: string;
    };
    image?: {
        url: string;
    };
}

export async function webhookPost(message: DiscordWebhookMessage[]): Promise<{ success: 'ok' } | typeof defaultErrorMessage > {
    // webhook: #mappers-guild
    // nikWebhook: something on nik's server
    const webhooks = [config.webhook, config.nikWebhook];

    for (const webhook of webhooks) {
        const url = `https://discordapp.com/api/webhooks/${webhook.id}/${webhook.token}`;

        try {
            const res = await Axios.post(url, {
                embeds: message,
            });

            if (res?.data) {
                return { success: 'ok' };
            }
        } catch (error) {
            return defaultErrorMessage;
        }
    }

    return defaultErrorMessage;
}

export async function devWebhookPost(message: DiscordWebhookMessage[]): Promise<{ success: 'ok' } | typeof defaultErrorMessage > {
    const url = `https://discordapp.com/api/webhooks/${config.devWebhook.id}/${config.devWebhook.token}`;

    try {
        const res = await Axios.post(url, {
            embeds: message,
        });

        if (res?.data) {
            return { success: 'ok' };
        }

        return defaultErrorMessage;
    } catch (error) {
        return defaultErrorMessage;
    }
}

export async function externalWebhookPost(message: DiscordWebhookMessage[], type: string): Promise<{ success: 'ok' } | typeof defaultErrorMessage > {
    let id;
    let token;

    if (type == 'regraz') {
        id = config.regrazWebhook.id;
        token = config.regrazWebhook.token;
    } else if (type == 'riana') {
        id = config.rianaWebhook.id;
        token = config.rianaWebhook.token;
    }

    const url = `https://discordapp.com/api/webhooks/${id}/${token}`;

    try {
        const res = await Axios.post(url, {
            embeds: message,
        });

        if (res?.data) {
            return { success: 'ok' };
        }

        return defaultErrorMessage;
    } catch (error) {
        return defaultErrorMessage;
    }
}

export const webhookColors = {
    lightRed: 16742771,     // new member joins, DEV: actions
    darkRed: 8787477,
    red: 15607337,          // drop quest

    lightOrange: 15639928,  // mission closed
    darkOrange: 7092736,
    orange: 15169835,       // create quest (admin)

    lightYellow: 16777104,  // rank 3 tier up
    darkYellow: 7105536,
    yellow: 16777022,       // create quest (user)

    lightGreen: 8847214,
    darkGreen: 1921053,
    green: 4380222,         // accept quest

    lightBlue: 8643583,     // mission open
    darkBlue: 1911891,
    blue: 6786559,          // map ranked

    lightPurple: 11173873,
    darkPurple: 4263999,
    purple: 8536232,        // quest completed

    pink: 16728232,         // open contest
    white: 15724527,        // re-open quest
    brown: 7554849,         // rank 1 tier up
    gray: 11186352,         // rank 2 tier up
    black: 2564903,         // dev
};