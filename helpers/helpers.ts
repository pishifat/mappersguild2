import { OsuAuthResponse } from './osuApi';

export function findBeatmapsetId(url: string): number {
    const indexStart = url.indexOf('beatmapsets/') + 'beatmapsets/'.length;
    const indexEnd = url.indexOf('#');
    let bmId = '';

    if (indexEnd !== -1) {
        bmId = url.slice(indexStart, indexEnd);
    } else {
        bmId = url.slice(indexStart);
    }

    return parseInt(bmId, 10);
}

export function sleep(ms): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Set tokens and session age
 */
export function setSession(session, response: OsuAuthResponse) {
    const maxAge = new Date();
    maxAge.setDate(maxAge.getDate() + 7);
    session.cookie.maxAge = maxAge.getTime();
    // *1000 because maxAge is miliseconds, oauth is seconds
    session.expireDate = Date.now() + (response.expires_in * 1000);
    session.accessToken = response.access_token;
    session.refreshToken = response.refresh_token;
}

export const defaultErrorMessage = { error: 'Something went wrong!' };

export interface BasicResponse {
    error?: string;
    success?: string;
}

export interface BasicError {
    error: string;
}
