import axios, { AxiosRequestConfig } from 'axios';
import querystring from 'querystring';
import { defaultErrorMessage, sleep } from './helpers';
import { ErrorResponse } from '../../interfaces/api/shared';
import config from '../../config.json';

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

export interface OsuBeatmapsetV2Response {
    beatmaps: [];
    user_id: number;
    ranked_date: string;
    current_nominations: [];
    ranked: number;
}

export interface OsuBeatmapsetDiscussionV2Response {
    discussions: [];
}

export interface OsuBeatmapsetSearchV2Response {
    beatmapsets: [];
}

export interface OsuBeatmapV2 {
    user_id: number;
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

export interface OsuApiV1UserResponse {
    user_id: string,
    username: string,
    // don't care about anything else
}

export function isOsuResponseError(errorResponse: OsuBeatmapResponse | OsuBeatmapResponse[] | OsuAuthResponse | OsuApiV1UserResponse | OsuBeatmapsetV2Response | OsuBeatmapsetDiscussionV2Response | OsuBeatmapsetSearchV2Response | ErrorResponse): errorResponse is ErrorResponse {
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

export async function getClientCredentialsGrant(): Promise<OsuAuthResponse | ErrorResponse> {
    const postData = querystring.stringify({
        grant_type: 'client_credentials',
        client_id: config.id,
        client_secret: config.secret,
        scope: 'public',
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

export async function getUserInfoFromId(id: string | number): Promise<OsuApiV1UserResponse | ErrorResponse> {
    const url = `https://osu.ppy.sh/api/get_user?k=${config.v1token}&u=${id}`;
    const res = await axios.get(url);

    return res.data[0];
}

export async function beatmapsetInfo(setId: number): Promise<OsuBeatmapResponse | ErrorResponse> {
    const url = `https://osu.ppy.sh/api/get_beatmaps?k=${config.v1token}&s=${setId}`;

    try {
        const res = await axios.get(url);

        if (res?.data?.length > 0) {
            const beatmaps = res.data;

            let longestBeatmap = res.data[0];

            for (const beatmap of beatmaps) {
                if (parseInt(beatmap.total_length) > parseInt(longestBeatmap.total_length)) {
                    longestBeatmap = beatmap;
                }
            }

            longestBeatmap.approved = parseInt(longestBeatmap.approved, 10);
            longestBeatmap.beatmap_id = parseInt(longestBeatmap.beatmap_id, 10);
            longestBeatmap.beatmapset_id = parseInt(longestBeatmap.beatmapset_id, 10);
            longestBeatmap.creator_id = parseInt(longestBeatmap.creator_id, 10);
            longestBeatmap.hit_length = parseInt(longestBeatmap.hit_length, 10);
            longestBeatmap.total_length = parseInt(longestBeatmap.total_length, 10);
            longestBeatmap.mode = parseInt(longestBeatmap.mode, 10);
            longestBeatmap.approved_date = new Date(longestBeatmap.approved_date);

            return longestBeatmap;
        }

        return defaultErrorMessage;
    } catch (error) {
        return defaultErrorMessage;
    }
}

export async function getBeatmapsetV2Info(token, setId): Promise<OsuBeatmapsetV2Response | ErrorResponse> {
    const options: AxiosRequestConfig = {
        method: 'GET',
        url: `https://osu.ppy.sh/api/v2/beatmapsets/${setId}`,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

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

export async function getDiscussions(token, params): Promise<OsuBeatmapsetDiscussionV2Response | ErrorResponse> {
    const url = `https://osu.ppy.sh/api/v2/beatmapsets/discussions${params}`;

    const options: AxiosRequestConfig = {
        method: 'GET',
        url,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

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

export async function getBeatmapsSearch(token, params): Promise<OsuBeatmapsetSearchV2Response | ErrorResponse> {
    const url = `https://osu.ppy.sh/api/v2/beatmapsets/search/${params}`;

    const options: AxiosRequestConfig = {
        method: 'GET',
        url,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

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