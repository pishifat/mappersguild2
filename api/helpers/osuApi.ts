import axios, { AxiosRequestConfig } from 'axios';
import querystring from 'querystring';
import { defaultErrorMessage } from './helpers';
import { ErrorResponse } from '../../interfaces/api/shared';
import config from '../../config.json';

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
    hit_length: number;
}

export interface OsuApiV2UserResponse {
    id: number,
    username: string,
    country_code: string;
}

export interface OsuKudosu {
    total: number;
    available: number;
}

export interface OsuBadges {
    awarded_at: Date;
    description: string;
    image_url: string;
    url: string;
}

export interface OsuStatistics {
    global_rank: number;
    play_count: number;
    hit_accuracy: number;
    play_time: number;
    level: OsuLevel;
}

export interface OsuLevel {
    current: number;
    progress: number;
}

export interface OsuGroups {
    id: number;
}

export interface OsuAuthResponse {
    id: number;
    username: string;
    is_nat: boolean;
    is_bng: boolean;
    ranked_and_approved_beatmapset_count: number;
    guest_beatmapset_count: number;
    /** not used (yet) */
    kudosu: OsuKudosu;
    badges: OsuBadges;
    statistics: OsuStatistics;
    /** in seconds */
    expires_in: number;
    access_token: string;
    refresh_token: string;
    groups: OsuGroups[];
    statistics_rulesets: any;
}

export function isOsuResponseError(errorResponse: OsuAuthResponse | OsuBeatmapsetV2Response | OsuBeatmapsetDiscussionV2Response | OsuBeatmapsetSearchV2Response | OsuApiV2UserResponse | ErrorResponse): errorResponse is ErrorResponse {
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

export async function getUserInfoFromId(token, id: string | number): Promise<OsuApiV2UserResponse | ErrorResponse> {
    const options: AxiosRequestConfig = {
        method: 'GET',
        url: `https://osu.ppy.sh/api/v2/users/${id}`,
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