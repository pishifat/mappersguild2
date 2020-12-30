import { Party } from '../interfaces/party';
import { Quest } from '../interfaces/quest';
import { User } from '../interfaces/user';
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

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/** Just replaces () and [] */
export function escapeUsername(username: string) {
    username = username.trim();

    return username.replace(/[()[\]]/g, '\\$&');
}

/** Used for logs and webhooks */
export function generateLists (modes: Party['modes'], members: User[]): { modeList: string, memberList: string } {
    const modeList = modes.join(', ');
    const memberList = members.map(m => `[**${m.username}**](https://osu.ppy.sh/users/${m.osuId})`).join(', ');

    return {
        modeList,
        memberList,
    };
}

/** Get ideal webhook thumbnail */
export function generateThumbnailUrl (quest: Quest) {
    let url = `https://assets.ppy.sh/artists/${quest.art}/cover.jpg`;
    if (quest.isMbc) url = 'https://mappersguild.com/images/mbc-icon.png';

    return {
        thumbnail: {
            url,
        },
    };
}

/** Get user's osu url and avatar */
export function generateAuthorWebhook(user: User) {
    return {
        author: {
            name: `${user.username}'s party`,
            url: `https://osu.ppy.sh/users/${user.osuId}`,
            icon_url: `https://a.ppy.sh/${user.osuId}`,
        },
    };
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
