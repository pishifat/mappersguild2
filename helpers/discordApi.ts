import { defaultErrorMessage } from './helpers';
import config from '../config.json';
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
}

export async function webhookPost(message: DiscordWebhookMessage[]): Promise<object> {
    const url = `https://discordapp.com/api/webhooks/${config.webhook.id}/${config.webhook.token}`;

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
