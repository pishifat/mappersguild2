import axios, { AxiosRequestConfig } from 'axios';
import querystring from 'querystring';
import { defaultErrorMessage, sleep } from './helpers';
import { ErrorResponse } from '../interfaces/api/shared';
import config from '../config.json';

export interface OsuBeatmapResponse {
    /** 4 = loved, 3 = qualified, 2 = approved, 1 = ranked, 0 = pending, -1 = WIP, -2 = graveyard */
    approved: number;
    submit_date: Date;
    approved_date: Date;
    last_update: Date;
    artist: string;
    beatmap_id: number;
    beatmapset_id: number;
    creator: string;
    creator_id: number;
    title: string;
    hit_length: number;
    total_length: number;
    /** 0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania */
    mode: number;
    tags: string[];
}

export interface OsuAuthResponse {
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

export interface OsuChatMessageResponse {
    id: number;
    // fill in the rest when function is allowed
}

export function isOsuResponseError(errorResponse: OsuBeatmapResponse | OsuBeatmapResponse[] | OsuAuthResponse | OsuChatMessageResponse | ErrorResponse): errorResponse is ErrorResponse {
    return (errorResponse as ErrorResponse).error !== undefined;
}

async function executeRequest(options: AxiosRequestConfig): Promise<OsuAuthResponse | ErrorResponse> {
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

export async function getToken(code: string): Promise<OsuAuthResponse | ErrorResponse> {
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

export async function refreshToken(refreshToken: string): Promise<OsuAuthResponse | ErrorResponse> {
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

export async function getUserInfo(token: string): Promise<OsuAuthResponse | ErrorResponse> {
    const options: AxiosRequestConfig = {
        url: 'https://osu.ppy.sh/api/v2/me',
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    return await executeRequest(options);
}

export async function beatmapsetInfo(setId: number): Promise<OsuBeatmapResponse | ErrorResponse> {
    const url = `https://osu.ppy.sh/api/get_beatmaps?k=${config.v1token}&s=${setId}`;

    try {
        const res = await axios.get(url);

        if (res?.data?.length > 0) {
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

        return defaultErrorMessage;
    } catch (error) {
        return defaultErrorMessage;
    }
}

export async function getMaps(date: Date): Promise<OsuBeatmapResponse[] | ErrorResponse> {
    let beatmaps: OsuBeatmapResponse[] = [];
    const today = new Date();

    try {
        while (date < new Date(today.setDate(today.getDate() - 7))) {
            const url = `https://osu.ppy.sh/api/get_beatmaps?k=${config.v1token}&since=${date.toISOString()}`;
            const res = await axios.get<OsuBeatmapResponse[]>(url);

            if (res.data.length) {
                date = new Date(res.data[res.data.length - 1].approved_date);
                beatmaps = beatmaps.concat(res.data);
                await sleep(2000);
            }
        }

        if (beatmaps.length > 0) {
            return beatmaps;
        }

        return defaultErrorMessage;
    } catch (error) {
        return defaultErrorMessage;
    }
}

export async function sendPm(token: string, osuId: number, message: string): Promise<OsuAuthResponse | ErrorResponse> {
    const options: AxiosRequestConfig = {
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

    return await executeRequest(options);
}