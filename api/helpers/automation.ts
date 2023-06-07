import cron from 'node-cron';
import { findBeatmapsetId, sleep, findBeatmapsetStatus, setBeatmapStatusRanked, generateAuthorWebhook, generateThumbnailUrl, generateLists, setNominators, getLongestBeatmapLength } from './helpers';
import { isOsuResponseError, getClientCredentialsGrant, getBeatmapsetV2Info, getDiscussions, getBeatmapsSearch } from './osuApi';
import { devWebhookPost, webhookPost, webhookColors } from './discordApi';
import { BeatmapModel } from '../models/beatmap/beatmap';
import { LogModel } from '../models/log';
import { BeatmapStatus } from '../../interfaces/beatmap/beatmap';
import { QuestModel } from '../models/quest';
import { ContestModel } from '../models/contest/contest';
import { ContestStatus } from '../../interfaces/contest/contest';
import { QuestStatus } from '../../interfaces/quest';
import { LogCategory } from '../../interfaces/log';
import { UserModel } from '../models/user';
import { FeaturedArtistModel } from '../models/featuredArtist';
import { updateUserPoints } from './points';
import { UserGroup } from '../../interfaces/user';

/* generate description for quest webhook */
function generateQuestDetails(quest) {
    let text = '';

    text += `\n[**${quest.name}**](https://mappersguild.com/quests?id=${quest.id})`;
    text += `\n- **Objective:** ${quest.descriptionMain}`;
    text += `\n- **Members:** ${quest.minParty == quest.maxParty ? quest.maxParty : quest.minParty + '-' + quest.maxParty} member${quest.maxParty == 1 ? '' : 's'}`;
    text += `\n- **Price:** ${quest.price} points from each member`;
    text += `\n`;

    return text;
}

/* compare beatmap status MG vs. osu and update */
const setQualified = cron.schedule('0 16 * * *', async () => { /* 9:00 AM PST */
    const statusQuery = [
        { status: { $ne: BeatmapStatus.Ranked } },
        { status: { $ne: BeatmapStatus.WIP } },
    ];

    const allBeatmaps = await BeatmapModel
        .find({
            url: { $exists: true },
            $and: statusQuery,
        });

    const response = await getClientCredentialsGrant();

    if (!isOsuResponseError(response)) {
        const token = response.access_token;

        for (const bm of allBeatmaps) {
            if (bm.url.indexOf('osu.ppy.sh/beatmapsets/') > -1) {
                const osuId = findBeatmapsetId(bm.url);
                const bmInfo = await getBeatmapsetV2Info(token, osuId);
                await sleep(500);

                if (!isOsuResponseError(bmInfo)) {
                    const status = findBeatmapsetStatus(bmInfo.ranked_date);

                    /*  osu:    Qualified/Ranked
                        MG:     Pending
                        save:   Qualified on MG */
                    if ((status == BeatmapStatus.Qualified || status == BeatmapStatus.Ranked) && bm.status == BeatmapStatus.Done) {
                        bm.status = BeatmapStatus.Qualified;
                        await bm.save();

                        // remove modders who didn't post anything
                        for (const modder of bm.modders) {
                            const currentBeatmap = await BeatmapModel
                                .findById(bm._id)
                                .defaultPopulate()
                                .orFail();

                            const discussionInfo = await getDiscussions(token, `?beatmapset_id=${osuId}&message_types%5B%5D=suggestion&message_types%5B%5D=problem&user=${modder.osuId}`);
                            await sleep(500);

                            if (!isOsuResponseError(discussionInfo) && discussionInfo.discussions && !discussionInfo.discussions.length) {
                                const i = currentBeatmap.modders.findIndex(m => m.id == modder.id);

                                if (i !== -1) {
                                    currentBeatmap.modders.splice(i, 1);
                                    await currentBeatmap.save();
                                }
                            }
                        }
                    }

                    /*  osu:    Pending
                        MG:     Qualified
                        save:   Pending on MG + un-queue for rank */
                    if (status == BeatmapStatus.Done && bm.status == BeatmapStatus.Qualified) {
                        bm.status = BeatmapStatus.Done;
                        bm.queuedForRank = false;
                        await bm.save();
                    }
                }
            }
        }
    }
}, {
    scheduled: false,
});

/* create FeaturedArtist for every artist that doesn't already exist based on the last 50 maps ranked per day */
const processDailyArtists = cron.schedule('0 18 * * *', async () => { /* 11:00 AM PST */
    const response = await getClientCredentialsGrant();
    let token;
    if (!isOsuResponseError(response)) token = response.access_token;

    const searchResults: any = await getBeatmapsSearch(token, ``);

    if (searchResults.beatmapsets && searchResults.beatmapsets.length) {
        for (const beatmapset of searchResults.beatmapsets) {
            const fa = await FeaturedArtistModel.findOne({ label: beatmapset.artist });

            if (!fa) {
                const artistSearchResults: any = await getBeatmapsSearch(token, `?q=artist%3D"${beatmapset.artist}"&s=any&sort=plays_desc`);

                if (artistSearchResults.beatmapsets && artistSearchResults.beatmapsets.length) {
                    let playcount = 0;

                    for (const beatmapset of artistSearchResults.beatmapsets) {
                        playcount += beatmapset.play_count;
                    }

                    if (playcount > 5000) {
                        const a = new FeaturedArtistModel();
                        a.label = beatmapset.artist;
                        await a.save();
                    }
                }
            }
        }
    }
}, {
    scheduled: false,
});

/* publish new quests */
const publishQuests = cron.schedule('0 22 * * *', async () => { /* 3:00 PM PST */
    const scheduledQuests = await QuestModel
        .find({
            status: QuestStatus.Scheduled,
        })
        .defaultPopulate();

    const webhooks: any = [];

    for (const quest of scheduledQuests) {
        const i = webhooks.findIndex(w => w.artist && w.artist == quest.art);

        if (i !== -1) {
            webhooks[i].quests.push(quest);
        } else {
            webhooks.push({
                creator: quest.creator,
                artist: quest.art,
                isMbc: quest.isMbc,
                url: quest.isMbc ? 'https://mappersguild.com/images/mbc-icon.png' : quest.art ? `https://assets.ppy.sh/artists/${quest.art}/cover.jpg` : 'https://mappersguild.com/images/no-art-icon.png',
                quests: [quest],
            });
        }

        quest.status = QuestStatus.Open;
        await quest.save();
    }

    for (const webhook of webhooks) {
        // new fa quests
        if (webhook.creator.osuId == 3178418) {
            let title = 'New ';

            if (webhook.artist && !webhook.isMbc) {
                const artist = await FeaturedArtistModel.findOne({ osuId: webhook.artist }).orFail();
                title += `${artist.label} `;
            }

            title += webhook.quests.length > 1 ? `quests:\n` : `quest:\n`;

            let description = '';

            for (const quest of webhook.quests) {
                description += generateQuestDetails(quest);
            }

            await webhookPost([{
                color: webhookColors.orange,
                title,
                description,
                thumbnail: {
                    url: webhook.url,
                },
            }]);

        // user-submitted quests
        } else {
            let description = '';

            for (const quest of webhook.quests) {
                description += generateQuestDetails(quest);
            }

            await webhookPost([{
                author: {
                    name: `${webhook.creator.username}`,
                    url: `https://osu.ppy.sh/users/${webhook.creator.osuId}`,
                    icon_url: `https://a.ppy.sh/${webhook.creator.osuId}`,
                },
                color: webhookColors.yellow,
                title: 'New custom quest:',
                description,
                thumbnail: {
                    url: webhook.url,
                },
            }]);
        }

        await sleep(1000);
    }
}, {
    scheduled: false,
});

/* dev notification for actions */
const sendActionNotifications = cron.schedule('0 23 * * *', async () => { /* 4:00 PM PST */
    // beatmaps
    const actionBeatmaps = await BeatmapModel
        .find({
            status: BeatmapStatus.Qualified,
            queuedForRank: { $ne: true },
        })
        .defaultPopulate()
        .sort({ updatedAt: 1 });

    if (actionBeatmaps.length) {
        devWebhookPost([{
            title: `beatmaps`,
            color: webhookColors.lightRed,
            description: `**${actionBeatmaps.length}** pending beatmaps\n\nadmin: https://mappersguild.com/admin/summary`,
        }]);
    }

    // quests
    let quests = await QuestModel
        .find({ status: QuestStatus.WIP })
        .defaultPopulate();

    quests = quests.filter(q =>
        q.associatedMaps.length >= q.requiredMapsets &&
        q.associatedMaps.every(b => b.status === BeatmapStatus.Ranked)
    );

    const pendingQuests = await QuestModel
        .find({ status: QuestStatus.Pending })
        .defaultPopulate();

    quests = quests.concat(pendingQuests);

    if (quests.length) {
        devWebhookPost([{
            title: `quests`,
            color: webhookColors.lightRed,
            description: `**${quests.length}** pending quests\n\nadmin: https://mappersguild.com/admin/summary`,
        }]);
    }

    // users
    const invalids = [5226970, 7496029]; // user IDs for people who specifically asked not to earn badges

    const allUsers = await UserModel.find({
        osuId: { $nin: invalids },
    });
    const actionUsers = allUsers.filter(u => u.badge !== u.rank);

    if (actionUsers.length) {
        devWebhookPost([{
            title: `users`,
            color: webhookColors.lightRed,
            description: `**${actionUsers.length}** pending user badges\n\nadmin: https://mappersguild.com/admin/summary`,
        }]);
    }

    // contests
    const actionContests = await ContestModel
        .find({
            isApproved: { $ne: true },
            status: { $ne: ContestStatus.Hidden },
        })
        .populate({ path: 'creators' });

    if (actionContests.length) {
        devWebhookPost([{
            title: `contests`,
            color: webhookColors.lightRed,
            description: `**${actionContests.length}** pending contests\n\nadmin: https://mappersguild.com/admin/summary`,
        }]);
    }

}, {
    scheduled: false,
});

/* if MG Qualified beatmap is osu Ranked and already checked, post webhook */
const setRanked = cron.schedule('0 1 * * *', async () => { /* 6:00 PM PST */
    const qualifiedBeatmaps = await BeatmapModel
        .find({
            status: BeatmapStatus.Qualified,
            url: { $exists: true },
            queuedForRank: true,
        });

    for (const bm of qualifiedBeatmaps) {
        if (bm.url.indexOf('osu.ppy.sh/beatmapsets/') > -1) {
            const osuId = findBeatmapsetId(bm.url);
            const response = await getClientCredentialsGrant();
            await sleep(500);

            if (!isOsuResponseError(response)) {
                const token = response.access_token;
                const bmInfo: any = await getBeatmapsetV2Info(token, osuId);
                await sleep(500);

                if (!isOsuResponseError(bmInfo)) {
                    const status = findBeatmapsetStatus(bmInfo.ranked);

                    if (status == BeatmapStatus.Ranked) {
                        await setBeatmapStatusRanked(bm.id, bmInfo);
                    }
                }
            }
        }
    }
}, {
    scheduled: false,
});

/* publish completed quest webhooks */
const completeQuests = cron.schedule('0 3 * * *', async () => { /* 8:00 PM PST */
    const scheduledQuests = await QuestModel
        .find({
            queuedForCompletion: true,
            status: QuestStatus.WIP,
        })
        .defaultPopulate();

    for (let i = 0; i < scheduledQuests.length; i++) {
        const quest = scheduledQuests[i];

        quest.completed = new Date();
        quest.status = QuestStatus.Done;
        await quest.save();

        for (const member of quest.currentParty.members) {
            updateUserPoints(member.id);
        }

        //webhook
        const { modeList, memberList } = generateLists(quest.modes, quest.currentParty.members);

        await webhookPost([{
            ...generateAuthorWebhook(quest.currentParty.leader),
            color: webhookColors.purple,
            description: `Completed quest: [**${quest.name}**](https://mappersguild.com/quests?id=${quest.id}) [**${modeList}**]`,
            ...generateThumbnailUrl(quest),
            fields: [{
                name: 'Members',
                value: memberList,
            }],
        }]);

        await sleep(1000);
    }
}, {
    scheduled: false,
});

/* publish webhooks for users who rank up */
const rankUsers = cron.schedule('1 3 * * *', async () => { /* 8:01 PM PST */
    const rankedUsers = await UserModel.find({ rank: { $gte: 1 } });

    for (let i = 0; i < rankedUsers.length; i++) {
        const user = rankedUsers[i];

        if (user.rank !== user.badge && user.rank == user.queuedBadge) {
            user.badge = user.queuedBadge;
            await user.save();

            //webhook
            const badge = user.queuedBadge;
            let rankColor = webhookColors.white;

            if (badge == 1) {
                rankColor = webhookColors.brown;
            } else if (badge == 2) {
                rankColor = webhookColors.gray;
            } else if (badge == 3) {
                rankColor = webhookColors.lightYellow;
            } else if (badge == 4) {
                rankColor = webhookColors.lightBlue;
            }

            const description = `**Reached rank ${badge}** with ${user.totalPoints} total points`;

            webhookPost([{
                author: {
                    name: user.username,
                    icon_url: `https://a.ppy.sh/${user.osuId}`,
                    url: `https://osu.ppy.sh/u/${user.osuId}`,
                },
                color: rankColor,
                description,
            }]);

            await sleep(1000);
        }
    }
}, {
    scheduled: false,
});

/* drop quests that have been inactive for >1 year */
const dropOverdueQuests = cron.schedule('2 3 * * *', async () => { /* 8:02 PM PST */
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);

    const quests = await QuestModel
        .find({
            status: QuestStatus.WIP,
            updatedAt: { $lt: oneYearAgo },
            deadline: { $lt: oneYearAgo },
        })
        .defaultPopulate();

    for (const quest of quests) {
        let recentlyUpdatedMap = false;

        for (const beatmap of quest.associatedMaps) {
            const lastUpdated = new Date(beatmap.updatedAt);

            if (lastUpdated > oneYearAgo && !recentlyUpdatedMap) {
                recentlyUpdatedMap = true;
            }
        }

        if (!recentlyUpdatedMap) {
            const members = quest.currentParty.members;
            const leader = quest.currentParty.leader;
            await quest.drop();

            //logs
            const { modeList, memberList } = generateLists(quest.modes, members);
            LogModel.generate(null, `party dropped quest "${quest.name}" for mode${quest.modes.length > 1 ? 's' : ''} "${modeList}"`, LogCategory.Quest );

            //webhook
            await webhookPost([{
                ...generateAuthorWebhook(leader),
                color: webhookColors.red,
                description: `Automatically dropped quest due to inactivity: [**${quest.name}**](https://mappersguild.com/quests?id=${quest.id}) [**${modeList}**]`,
                ...generateThumbnailUrl(quest),
                fields: [{
                    name: 'Party members',
                    value: memberList,
                }],
            }]);
        }
    }
}, {
    scheduled: false,
});

/* validate ranked beatmaps for accurate ranked_date/current_nominators/hit_length. limited to 100 beatmaps daily because it takes too long otherwise, and it doesn't need to be done that frequently */
const validateRankedBeatmaps = cron.schedule('0 4 * * *', async () => { /* 9:00 PM PST */
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 100); // this will be a problem after reaching 10,000 ranked maps in the database. so i don't need to worry about it probably

    const [beatmaps, response] = await Promise.all([
        BeatmapModel
            .find({
                status: BeatmapStatus.Ranked,
                updatedAt: { $lt: threeMonthsAgo },
            })
            .defaultPopulate()
            .limit(100)
            .orFail(),
        getClientCredentialsGrant(),
    ]);

    await sleep(250);

    if (!isOsuResponseError(response)) {
        const token = response.access_token;

        for (const beatmap of beatmaps) {
            const osuId = findBeatmapsetId(beatmap.url);
            const bmInfo: any = await getBeatmapsetV2Info(token, osuId);
            await sleep(250);

            if (!isOsuResponseError(bmInfo)) {
                await setNominators(beatmap, bmInfo);
                beatmap.length = getLongestBeatmapLength(bmInfo.beatmaps);
                beatmap.rankedDate = bmInfo.ranked_date;
                await beatmap.save();
            }
        }
    }
}, {
    scheduled: false,
});

/* update points for all users once every month */
const updatePoints = cron.schedule('0 0 21 * *', async () => { /* 21st of each month */
    const users = await UserModel.find({ group: { $ne: UserGroup.Spectator } });

    for (const user of users) {
        updateUserPoints(user.id);
    }
}, {
    scheduled: false,
});

export default { sendActionNotifications, setQualified, setRanked, publishQuests, completeQuests, rankUsers, updatePoints, processDailyArtists, validateRankedBeatmaps, dropOverdueQuests };