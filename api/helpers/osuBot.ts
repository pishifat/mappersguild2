import config from '../../config.json';
import axios from 'axios';
import { sleep } from './helpers';

let tokenInfo = {
    expiresAt: new Date(0),
    token: '',
};

/**
 * @returns {Promise<string | {error: string}>}>}
 */
export async function getBotToken () {
    if (tokenInfo.expiresAt && tokenInfo.expiresAt > new Date()) {
        return tokenInfo.token;
    }

    try {
        const { data } = await axios.post('https://osu.ppy.sh/oauth/token', {
            grant_type: 'client_credentials',
            client_id: config.bot.id,
            client_secret: config.bot.secret,
            scope: 'delegate chat.write',
        });

        tokenInfo = {
            expiresAt: new Date(Date.now() + data.expires_in * 1000), // expires_in = 86400 seconds
            token: data.access_token,
        };

        return data.access_token;
    } catch (error) {
        return { error };
    }
}

export async function sendAnnouncement(userIds, channel, message) {
    const token = await getBotToken();

    await sleep(500);

    if (typeof token !== 'string') {
        return { error: token.error };
    }

    try {
        await axios.post('https://osu.ppy.sh/api/v2/chat/channels/', {
            channel: {
                name: channel.name,
                description: channel.description,
            },
            message,
            target_ids: userIds,
            type: 'ANNOUNCE',
        },
        {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        return true;
    } catch (error) {
        return { error };
    }
}