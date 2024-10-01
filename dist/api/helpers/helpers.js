"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultErrorMessage = exports.setSession = exports.generateBotAuthorWebhook = exports.generateAuthorWebhook = exports.generateMissionThumbnailUrl = exports.generateThumbnailUrl = exports.generateLists = exports.escapeUsername = exports.sleep = exports.setBeatmapStatusRanked = exports.getLongestBeatmapLength = exports.setNominators = exports.truncateText = exports.getRankFromPoints = exports.findBeatmapsetStatus = exports.findBeatmapsetId = void 0;
const discordApi_1 = require("./discordApi");
const beatmap_1 = require("../../interfaces/beatmap/beatmap");
const beatmap_2 = require("../models/beatmap/beatmap");
const points_1 = require("./points");
const featuredArtist_1 = require("../models/featuredArtist");
const user_1 = require("../models/user");
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
const ranks = [
    { rank: 0, value: 0, name: 'N/A' },
    { rank: 1, value: 100, name: '🟤 Bronze' },
    { rank: 2, value: 250, name: '⚪ Silver' },
    { rank: 3, value: 500, name: '🟡 Gold' },
    { rank: 4, value: 1000, name: '🔵 Platinum' },
    { rank: 5, value: 2500, name: '🔴 Unreal' },
];
function getRankFromPoints(points) {
    if (points < 100)
        return ranks[0];
    else if (points < 250)
        return ranks[1];
    else if (points < 500)
        return ranks[2];
    else if (points < 1000)
        return ranks[3];
    else if (points < 2500)
        return ranks[4];
    else
        return ranks[5];
}
exports.getRankFromPoints = getRankFromPoints;
function truncateText(text, length) {
    return text.length > length ? text.slice(0, length) + '... *(truncated)*' : text;
}
exports.truncateText = truncateText;
async function setNominators(beatmap, bmInfo) {
    const modderIds = beatmap.modders.map(m => m.id);
    const bnsIds = beatmap.bns.map(b => b.id);
    if (bmInfo.current_nominations && bmInfo.current_nominations.length) {
        for (const nom of bmInfo.current_nominations) {
            const nomModder = await user_1.UserModel.findOne({ osuId: nom.user_id });
            if (nomModder) {
                if (!modderIds.includes(nomModder.id)) {
                    beatmap.modders.push(nomModder._id);
                }
                if (!bnsIds.includes(nomModder.id)) {
                    beatmap.bns.push(nomModder._id);
                }
                await beatmap.save();
            }
        }
    }
}
exports.setNominators = setNominators;
function getLongestBeatmapLength(beatmaps) {
    let longestBeatmap = beatmaps[0];
    for (const beatmap of beatmaps) {
        if (parseInt(beatmap.hit_length) > parseInt(longestBeatmap.hit_length)) {
            longestBeatmap = beatmap;
        }
    }
    return longestBeatmap.hit_length;
}
exports.getLongestBeatmapLength = getLongestBeatmapLength;
async function setBeatmapStatusRanked(id, bmInfo) {
    // update status (only helpful for automated calls)
    await beatmap_2.BeatmapModel.findByIdAndUpdate(id, { status: beatmap_1.BeatmapStatus.Ranked });
    // query for populated beatmap
    let beatmap = await beatmap_2.BeatmapModel
        .findById(id)
        .defaultPopulate()
        .orFail();
    // assign bns to bns field (synced with osu-web)
    beatmap.bns = [];
    await setNominators(beatmap, bmInfo);
    // re-query to include nominators in modders pool
    beatmap = await beatmap_2.BeatmapModel
        .findById(id)
        .defaultPopulate()
        .orFail();
    // set length (for task points calculation) and ranked date (for quest points calculation) according to osu! db
    beatmap.length = getLongestBeatmapLength(bmInfo.beatmaps);
    beatmap.rankedDate = bmInfo.ranked_date;
    await beatmap.save();
    // calculate points for modders
    for (const modder of beatmap.modders) {
        points_1.updateUserPoints(modder.id);
    }
    // get host so we can get their total points
    const host = await user_1.UserModel.findById(beatmap.host).orFail();
    // get host's old points
    const oldPoints = host.totalPoints;
    // calculate points for host
    const newPoints = await points_1.updateUserPoints(beatmap.host.id);
    // webhook
    if (!beatmap.skipWebhook) {
        // establish empty variables
        const gdUsernames = [];
        const gdUsers = [];
        const modes = [];
        let storyboard = null;
        // fill empty variables with data
        for (const task of beatmap.tasks) {
            if (task.mode == 'sb' && task.mappers[0].id != beatmap.host.id) {
                storyboard = task;
            }
            else if (task.mode != 'sb' && task.mode != 'hs') {
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
        // set up guest mappers info
        let gdText = '';
        const gderInfo = [];
        if (!gdUsers.length) {
            gdText = '\nNo guest difficulties';
        }
        else if (gdUsers.length > 1) {
            gdText = '\nGuest difficulties by ';
        }
        else if (gdUsers.length == 1) {
            gdText = '\nGuest difficulty by ';
        }
        // add users to webhook description
        if (gdUsers.length) {
            for (let i = 0; i < gdUsers.length; i++) {
                const user = gdUsers[i];
                gdText += `[**${user.username}**](https://osu.ppy.sh/users/${user.osuId})`;
                if (i + 1 < gdUsers.length) {
                    gdText += ', ';
                }
                // get full guest user so we can get their total points
                const guest = await user_1.UserModel.findById(user.id).orFail();
                const oldPoints = guest.totalPoints;
                // update points for all guest difficulty creators
                const newPoints = await points_1.updateUserPoints(user.id);
                // store gder points info for webhook use
                if (typeof newPoints === 'number') {
                    gderInfo.push({
                        username: guest.username,
                        osuId: guest.osuId,
                        oldPoints,
                        newPoints,
                    });
                }
            }
        }
        let storyboardText = '';
        // add storyboarder to webhook and update points for storyboarder
        if (storyboard) {
            const storyboarder = storyboard.mappers[0];
            storyboardText = `\nStoryboard by [**${storyboarder.username}**](https://osu.ppy.sh/users/${storyboarder.osuId})`;
            points_1.updateUserPoints(storyboarder.id);
        }
        let showcaseText = '';
        if (beatmap.isShowcase) {
            const artist = await featuredArtist_1.FeaturedArtistModel.findOne({ songs: beatmap.song._id });
            if (artist)
                showcaseText = `\n\nThis beatmap was created for [${beatmap.song.artist}](https://osu.ppy.sh/beatmaps/artists/${artist.osuId})'s Featured Artist announcement!`;
        }
        // user stats text
        let statsText = '';
        if (typeof newPoints === 'number') {
            const pointsDifference = Math.round((newPoints - oldPoints) * 10) / 10;
            statsText += `\n\n${gdUsers.length ? `- [**${beatmap.host.username}**](https://osu.ppy.sh/users/${beatmap.host.osuId}): ` : ''}${oldPoints} pts → **${newPoints} pts** (+${pointsDifference} pts)`;
            // check if newPoints gets into a new rank threshold
            for (const rankMilestone of ranks) {
                if (oldPoints < rankMilestone.value && newPoints >= rankMilestone.value) {
                    statsText += `\n**${ranks[rankMilestone.rank].name}** rank achieved! 🎉`;
                    break;
                }
            }
            // TODO: update threshold when Hinsvar somehow reaches 5000 points
            if (newPoints < 2500) {
                const pointsLeft = Math.round((ranks[getRankFromPoints(newPoints).rank + 1].value - newPoints) * 10) / 10;
                statsText += `\n${pointsLeft} points until **${ranks[getRankFromPoints(newPoints).rank + 1].name}** rank`;
            }
            if (gdUsers.length) {
                statsText += '\n';
                for (const gder of gderInfo) {
                    const gderPointsDifference = Math.round((gder.newPoints - gder.oldPoints) * 10) / 10;
                    statsText += `\n- [**${gder.username}**](https://osu.ppy.sh/users/${gder.osuId}): ${gder.oldPoints} pts → **${gder.newPoints} pts** (+${gderPointsDifference} pts)`;
                }
            }
        }
        const description = `💖 [**${beatmap.song.artist} - ${beatmap.song.title}**](${beatmap.url}) [**${modes.join(', ')}**] has been ranked\n\nHosted by [**${beatmap.host.username}**](https://osu.ppy.sh/users/${beatmap.host.osuId})${gdText}${storyboardText}${showcaseText}${statsText}`;
        // publish webhook
        await discordApi_1.webhookPost([{
                color: discordApi_1.webhookColors.blue,
                description: description.length > 1500 ? truncateText(description, 1500) : description,
                thumbnail: {
                    url: `https://assets.ppy.sh/beatmaps/${bmInfo.id}/covers/list.jpg`,
                },
            }]);
    }
    // pause to not exceed rate limit
    await sleep(500);
}
exports.setBeatmapStatusRanked = setBeatmapStatusRanked;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.sleep = sleep;
/** Just replaces () and [] */
function escapeUsername(username) {
    username = username.trim();
    return username.replace(/[()[\]]/g, '\\$&');
}
exports.escapeUsername = escapeUsername;
/** Used for logs and webhooks */
function generateLists(modes, members) {
    const modeList = modes.join(', ');
    const memberList = members.map(m => `[**${m.username}**](https://osu.ppy.sh/users/${m.osuId})`).join(', ');
    return {
        modeList,
        memberList,
    };
}
exports.generateLists = generateLists;
/** Get ideal webhook thumbnail */
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
/** Get ideal webhook thumbnail (mission) */
function generateMissionThumbnailUrl(mission) {
    let url = '';
    switch (mission.tier) {
        case 1:
            url = 'https://mappersguild.com/images/bronze.png';
            break;
        case 2:
            url = 'https://mappersguild.com/images/silver.png';
            break;
        case 3:
            url = 'https://mappersguild.com/images/gold.png';
            break;
        case 4:
            url = 'https://mappersguild.com/images/platinum.png';
            break;
        default:
            url = 'https://mappersguild.com/images/bronze.png';
            break;
    }
    return {
        thumbnail: {
            url,
        },
    };
}
exports.generateMissionThumbnailUrl = generateMissionThumbnailUrl;
/** Get user's osu url and avatar */
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
/** Get mg bot user's osu url and avatar */
async function generateBotAuthorWebhook() {
    const mg = await user_1.UserModel.findOne({ osuId: 23648635 }).orFail();
    return {
        author: {
            name: `${mg.username}`,
            url: `https://osu.ppy.sh/users/${mg.osuId}`,
            icon_url: `https://a.ppy.sh/${mg.osuId}`,
        },
    };
}
exports.generateBotAuthorWebhook = generateBotAuthorWebhook;
/**
 * Set tokens and session age
 */
function setSession(session, response) {
    const maxAge = new Date();
    maxAge.setDate(maxAge.getDate() + 7);
    session.cookie.maxAge = maxAge.getTime();
    // *1000 because maxAge is miliseconds, oauth is seconds
    session.expireDate = Date.now() + (response.expires_in * 1000);
    session.accessToken = response.access_token;
    session.refreshToken = response.refresh_token;
}
exports.setSession = setSession;
exports.defaultErrorMessage = { error: 'Something went wrong!' };
