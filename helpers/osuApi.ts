/* eslint-disable @typescript-eslint/camelcase */
import { defaultErrorMessage, BasicError } from './helpers';
import querystring from 'querystring';
import config from '../config.json';
import axios, { AxiosRequestConfig } from 'axios';

interface OsuBeatmapResponse {
    /** 4 = loved, 3 = qualified, 2 = approved, 1 = ranked, 0 = pending, -1 = WIP, -2 = graveyard */
    approved: number;
    submit_date: Date;
    approved_date: Date;
    last_update: Date;
    artist: string;
    beatmap_id: number;
    beatmapset_id: number;
    creator_id: number;
    title: string;
    total_length: number;
    /** 0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania */
    mode: number;
}

interface OsuAuthResponse {
    id: number;
    username: string;
    is_nat: boolean;
    is_bng: boolean;
    /** in seconds */
    expires_in: number;
    access_token: string;
    refresh_token: string;
    ranked_and_approved_beatmapset_count: number;
}

export function isOsuReponseError(basicError: OsuAuthResponse | BasicError): basicError is BasicError {
    return (basicError as BasicError).error !== undefined;
}

async function executeRequest(options: AxiosRequestConfig): Promise<OsuAuthResponse | BasicError> {
    try {
        const res = await axios(options);

        if (res?.data) {
            return res.data;
        }

        return defaultErrorMessage;
    } catch (error) {
        return defaultErrorMessage;
    }
}

export async function getToken(code: string): Promise<OsuAuthResponse | BasicError> {
    const postData = querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.redirect,
        client_id: config.id,
        client_secret: config.secret,
    });

    const options: AxiosRequestConfig = {
        url: 'https://osu.ppy.sh/oauth/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: postData,
    };

    return await executeRequest(options);
}

export function isAuthError(basicError: OsuAuthResponse | BasicError): basicError is BasicError {
    return (basicError as BasicError).error !== undefined;
}

export async function refreshToken(refreshToken: string): Promise<OsuAuthResponse | BasicError> {
    const postData = querystring.stringify({
        grant_type: 'refresh_token',
        client_id: config.id,
        client_secret: config.secret,
        refresh_token: refreshToken,
    });

    const options: AxiosRequestConfig = {
        url: 'https://osu.ppy.sh/oauth/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: postData,
    };

    return await executeRequest(options);
}

export async function getUserInfo(token: string): Promise<OsuAuthResponse | BasicError> {
    const options = {
        url: 'https://osu.ppy.sh/api/v2/me',
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    return await executeRequest(options);
}

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
        icon_url: string;
        url: string;
    };
    fields?: [];
}

export async function webhookPost(message: DiscordWebhookMessage[]): Promise<object> {
    const url = `https://discordapp.com/api/webhooks/${config.webhook.id}/${config.webhook.token}`;

    try {
        const res = await axios.post(url, {
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

export async function beatmapsetInfo(setId: number): Promise<OsuBeatmapResponse | BasicError> {
    const url = `https://osu.ppy.sh/api/get_beatmaps?k=${config.v1token}&s=${setId}`;

    try {
        const res = await axios.get(url);

        if (res?.data?.length > 0) {
            return res.data[0];
        }

        return defaultErrorMessage;
    } catch (error) {
        return defaultErrorMessage;
    }
}
