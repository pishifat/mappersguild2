"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultErrorMessage = exports.setSession = exports.generateAuthorWebhook = exports.generateThumbnailUrl = exports.generateLists = exports.escapeUsername = exports.sleep = exports.findBeatmapsetId = void 0;
function findBeatmapsetId(url) {
    const indexStart = url.indexOf('beatmapsets/') + 'beatmapsets/'.length;
    const indexEnd = url.indexOf('#');
    let bmId = '';
    if (indexEnd !== -1) {
        bmId = url.slice(indexStart, indexEnd);
    }
    else {
        bmId = url.slice(indexStart);
    }
    return parseInt(bmId, 10);
}
exports.findBeatmapsetId = findBeatmapsetId;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.sleep = sleep;
function escapeUsername(username) {
    username = username.trim();
    return username.replace(/[()[\]]/g, '\\$&');
}
exports.escapeUsername = escapeUsername;
function generateLists(modes, members) {
    const modeList = modes.join(', ');
    const memberList = members.map(m => `[**${m.username}**](https://osu.ppy.sh/users/${m.osuId})`).join(', ');
    return {
        modeList,
        memberList,
    };
}
exports.generateLists = generateLists;
function generateThumbnailUrl(quest) {
    let url = `https://assets.ppy.sh/artists/${quest.art}/cover.jpg`;
    if (quest.isMbc)
        url = 'https://mappersguild.com/images/mbc-icon.png';
    return {
        thumbnail: {
            url,
        },
    };
}
exports.generateThumbnailUrl = generateThumbnailUrl;
function generateAuthorWebhook(user) {
    return {
        author: {
            name: `${user.username}'s party`,
            url: `https://osu.ppy.sh/users/${user.osuId}`,
            icon_url: `https://a.ppy.sh/${user.osuId}`,
        },
    };
}
exports.generateAuthorWebhook = generateAuthorWebhook;
function setSession(session, response) {
    const maxAge = new Date();
    maxAge.setDate(maxAge.getDate() + 7);
    session.cookie.maxAge = maxAge.getTime();
    session.expireDate = Date.now() + (response.expires_in * 1000);
    session.accessToken = response.access_token;
    session.refreshToken = response.refresh_token;
}
exports.setSession = setSession;
exports.defaultErrorMessage = { error: 'Something went wrong!' };
