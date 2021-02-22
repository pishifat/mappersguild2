"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultErrorMessage = exports.setSession = exports.generateAuthorWebhook = exports.generateThumbnailUrl = exports.generateLists = exports.escapeUsername = exports.sleep = exports.setBeatmapStatusRanked = exports.findBeatmapsetStatus = exports.findBeatmapsetId = void 0;
const discordApi_1 = require("./discordApi");
const beatmap_1 = require("../interfaces/beatmap/beatmap");
const beatmap_2 = require("../models/beatmap/beatmap");
const points_1 = require("./points");
const featuredArtist_1 = require("../models/featuredArtist");
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
function findBeatmapsetStatus(osuStatus) {
    let status = '';
    switch (osuStatus) {
        case 4:
            status = 'Loved';
            break;
        case 3:
            status = beatmap_1.BeatmapStatus.Qualified;
            break;
        case 2:
            status = 'Approved';
            break;
        case 1:
            status = beatmap_1.BeatmapStatus.Ranked;
            break;
        default:
            status = beatmap_1.BeatmapStatus.Done;
            break;
    }
    return status;
}
exports.findBeatmapsetStatus = findBeatmapsetStatus;
function setBeatmapStatusRanked(id, bmInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        yield beatmap_2.BeatmapModel.findByIdAndUpdate(id, { status: beatmap_1.BeatmapStatus.Ranked });
        const beatmap = yield beatmap_2.BeatmapModel
            .findById(id)
            .defaultPopulate()
            .orFail();
        beatmap.length = bmInfo.hit_length;
        beatmap.rankedDate = bmInfo.approved_date;
        yield beatmap.save();
        for (const modder of beatmap.modders) {
            points_1.updateUserPoints(modder.id);
        }
        points_1.updateUserPoints(beatmap.host.id);
        const gdUsernames = [];
        const gdUsers = [];
        const modes = [];
        let storyboard;
        for (const task of beatmap.tasks) {
            if (task.mode == 'sb' && task.mappers[0].id != beatmap.host.id) {
                storyboard = task;
            }
            else if (task.mode != 'sb') {
                task.mappers.forEach(mapper => {
                    if (!gdUsernames.includes(mapper.username) && mapper.username != beatmap.host.username) {
                        gdUsernames.push(mapper.username);
                        gdUsers.push(mapper);
                    }
                });
                if (!modes.includes(task.mode)) {
                    modes.push(task.mode);
                }
            }
        }
        let gdText = '';
        if (!gdUsers.length) {
            gdText = '\nNo guest difficulties';
        }
        else if (gdUsers.length > 1) {
            gdText = '\nGuest difficulties by ';
        }
        else if (gdUsers.length == 1) {
            gdText = '\nGuest difficulty by ';
        }
        if (gdUsers.length) {
            for (let i = 0; i < gdUsers.length; i++) {
                const user = gdUsers[i];
                gdText += `[**${user.username}**](https://osu.ppy.sh/users/${user.osuId})`;
                if (i + 1 < gdUsers.length) {
                    gdText += ', ';
                }
                points_1.updateUserPoints(user.id);
            }
        }
        let storyboardText = '';
        if (storyboard) {
            const storyboarder = storyboard.mappers[0];
            storyboardText = `\nStoryboard by [**${storyboarder.username}**](https://osu.ppy.sh/users/${storyboarder.osuId})`;
            points_1.updateUserPoints(storyboarder.id);
        }
        let showcaseText = '';
        if (beatmap.isShowcase) {
            const artist = yield featuredArtist_1.FeaturedArtistModel.findOne({ songs: beatmap.song._id });
            if (artist)
                showcaseText = `\n\nThis beatmap was created for [${beatmap.song.artist}](https://osu.ppy.sh/beatmaps/artists/${artist.osuId})'s Featured Artist announcement!`;
        }
        const description = `💖 [**${beatmap.song.artist} - ${beatmap.song.title}**](${beatmap.url}) [**${modes.join(', ')}**] has been ranked\n\nHosted by [**${beatmap.host.username}**](https://osu.ppy.sh/users/${beatmap.host.osuId})${gdText}${storyboardText}${showcaseText}`;
        yield discordApi_1.webhookPost([{
                color: discordApi_1.webhookColors.blue,
                description,
                thumbnail: {
                    url: `https://assets.ppy.sh/beatmaps/${bmInfo.beatmapset_id}/covers/list.jpg`,
                },
            }]);
        yield sleep(500);
    });
}
exports.setBeatmapStatusRanked = setBeatmapStatusRanked;
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
