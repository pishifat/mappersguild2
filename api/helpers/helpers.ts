import { Party } from '../../interfaces/party';
import { Quest } from '../../interfaces/quest';
import { User } from '../../interfaces/user';
import { OsuAuthResponse } from './osuApi';
import { webhookPost, webhookColors } from './discordApi';
import { BeatmapStatus } from '../../interfaces/beatmap/beatmap';
import { BeatmapModel } from '../models/beatmap/beatmap';
import { updateUserPoints } from './points';
import { FeaturedArtistModel } from '../models/featuredArtist';
import { FeaturedSong } from '../../interfaces/featuredSong';
import { UserModel } from '../models/user';

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

export function findBeatmapsetStatus(osuStatus): string {
    let status = '';

    switch (osuStatus) {
        case 4:
            status = 'Loved';
            break;
        case 3:
            status = BeatmapStatus.Qualified;
            break;
        case 2:
            status = 'Approved';
            break;
        case 1:
            status = BeatmapStatus.Ranked;
            break;
        default:
            status = BeatmapStatus.Done;
            break;
    }

    return status;
}

export async function setBeatmapStatusRanked(id, bmInfo): Promise<void> {
    // update status (only helpful for automated calls)
    await BeatmapModel.findByIdAndUpdate(id, { status: BeatmapStatus.Ranked });

    // query for populated beatmap
    let beatmap = await BeatmapModel
        .findById(id)
        .defaultPopulate()
        .orFail();

    // put nominators in fields if applicable
    const modderIds = beatmap.modders.map(m => m.id);
    const bnsIds = beatmap.bns.map(b => b.id);

    if (bmInfo.current_nominations && bmInfo.current_nominations.length) {
        for (const nom of bmInfo.current_nominations) {
            const nomModder = await UserModel.findOne({ osuId: nom.user_id });

            if (nomModder) {
                if (!modderIds.includes(nomModder.id)) {
                    beatmap.modders.push(nomModder._id);
                    await beatmap.save();
                }

                if (!bnsIds.includes(nomModder.id)) {
                    beatmap.bns.push(nomModder._id);
                    await beatmap.save();
                }
            }
        }
    }

    // re-query to include nominators in modders pool
    beatmap = await BeatmapModel
        .findById(id)
        .defaultPopulate()
        .orFail();

    // set length (for task points calculation) and ranked date (for quest points calculation) according to osu! db
    let longestBeatmap = bmInfo.beatmaps[0];

    for (const b of bmInfo.beatmaps) {
        if (parseInt(b.hit_length) > parseInt(longestBeatmap.hit_length)) {
            longestBeatmap = beatmap;
        }
    }

    beatmap.length = longestBeatmap.hit_length;
    beatmap.rankedDate = bmInfo.ranked_date;
    await beatmap.save();

    // calculate points for modders
    for (const modder of beatmap.modders) {
        updateUserPoints(modder.id);
    }

    // calculate points for host
    updateUserPoints(beatmap.host.id);

    // establish empty variables
    const gdUsernames: string[] = [];
    const gdUsers: User[] = [];
    const modes: string[] = [];
    let storyboard;

    // fill empty variables with data
    for (const task of beatmap.tasks) {
        if (task.mode == 'sb' && task.mappers[0].id != beatmap.host.id) {
            storyboard = task;
        } else if (task.mode != 'sb') {
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

    // create template for webhook descriptiuon
    let gdText = '';

    if (!gdUsers.length) {
        gdText = '\nNo guest difficulties';
    } else if (gdUsers.length > 1) {
        gdText = '\nGuest difficulties by ';
    } else if (gdUsers.length == 1) {
        gdText = '\nGuest difficulty by ';
    }

    // add users to webhook description
    if (gdUsers.length) {
        for (let i = 0; i < gdUsers.length; i++) {
            const user = gdUsers[i];
            gdText += `[**${user.username}**](https://osu.ppy.sh/users/${user.osuId})`;

            if (i+1 < gdUsers.length) {
                gdText += ', ';
            }

            // update points for all guest difficulty creators
            updateUserPoints(user.id);
        }
    }

    let storyboardText = '';

    // add storyboarder to webhook and update points for storyboarder
    if (storyboard) {
        const storyboarder = storyboard.mappers[0];
        storyboardText = `\nStoryboard by [**${storyboarder.username}**](https://osu.ppy.sh/users/${storyboarder.osuId})`;
        updateUserPoints(storyboarder.id);
    }

    let showcaseText = '';

    if (beatmap.isShowcase) {
        const artist = await FeaturedArtistModel.findOne({ songs: beatmap.song._id as FeaturedSong });
        if (artist) showcaseText = `\n\nThis beatmap was created for [${beatmap.song.artist}](https://osu.ppy.sh/beatmaps/artists/${artist.osuId})'s Featured Artist announcement!`;
    }

    const description = `💖 [**${beatmap.song.artist} - ${beatmap.song.title}**](${beatmap.url}) [**${modes.join(', ')}**] has been ranked\n\nHosted by [**${beatmap.host.username}**](https://osu.ppy.sh/users/${beatmap.host.osuId})${gdText}${storyboardText}${showcaseText}`;

    // publish webhook
    await webhookPost([{
        color: webhookColors.blue,
        description,
        thumbnail: {
            url: `https://assets.ppy.sh/beatmaps/${bmInfo.id}/covers/list.jpg`,
        },
    }]);

    // pause to not exceed rate limit
    await sleep(500);
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
