"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const helpers_1 = require("./helpers");
const osuApi_1 = require("./osuApi");
const discordApi_1 = require("./discordApi");
const beatmap_1 = require("../models/beatmap/beatmap");
const log_1 = require("../models/log");
const beatmap_2 = require("../../interfaces/beatmap/beatmap");
const quest_1 = require("../models/quest");
const mission_1 = require("../models/mission");
const contest_1 = require("../models/contest/contest");
const contest_2 = require("../../interfaces/contest/contest");
const quest_2 = require("../../interfaces/quest");
const mission_2 = require("../../interfaces/mission");
const log_2 = require("../../interfaces/log");
const user_1 = require("../models/user");
const featuredArtist_1 = require("../models/featuredArtist");
const points_1 = require("./points");
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
/* generate description for mission webhook */
function generateMissionDetails(mission) {
    let text = '';
    text += `\n[**${mission.name}**](https://mappersguild.com/missions?id=${mission.id})\n`;
    text += `\n**Objective:** ${mission.objective}\n`;
    //text += `\n**Win condition:** ${mission.winCondition}`;
    if (mission.userMaximumRankedBeatmapsCount || mission.userMaximumRankedBeatmapsCount === 0) {
        text += `\n\nTo participate in this quest, you must meet you **cannot** have more than **${mission.userMaximumRankedBeatmapsCount} ranked maps**`;
    }
    if (mission.userMinimumPp) {
        text += `\n\nTo participate in this quest, you must have **${mission.userMinimumPp} pp** in your map's game mode.`;
    }
    return text;
}
/* generate description for closing mission webhook */
function generateMissionClosedDetails(mission) {
    let text = '';
    text += `Closed priority quest: [**${mission.name}**](https://mappersguild.com/missions?id=${mission.id})`;
    text += `\n\n**Winning beatmap${mission.winningBeatmaps.length > 1 ? 's' : ''}:**`;
    for (const beatmap of mission.winningBeatmaps) {
        const modes = [];
        // fill empty variables with data
        for (const task of beatmap.tasks) {
            if (task.mode != 'sb' && task.mode != 'hs') {
                if (!modes.includes(task.mode)) {
                    modes.push(task.mode);
                }
            }
        }
        text += `\n- [**${beatmap.song.artist} - ${beatmap.song.title}**](${beatmap.url}) [**${modes.join(', ')}**] hosted by [**${beatmap.host.username}**](https://osu.ppy.sh/users/${beatmap.host.osuId})`;
    }
    return text;
}
/* compare beatmap status MG vs. osu and update */
const setQualified = node_cron_1.default.schedule('0 16 * * *', async () => {
    const statusQuery = [
        { status: { $ne: beatmap_2.BeatmapStatus.Ranked } },
        { status: { $ne: beatmap_2.BeatmapStatus.WIP } },
    ];
    const allBeatmaps = await beatmap_1.BeatmapModel
        .find({
        url: { $exists: true },
        $and: statusQuery,
    })
        .defaultPopulate();
    const response = await osuApi_1.getClientCredentialsGrant();
    if (!osuApi_1.isOsuResponseError(response)) {
        const token = response.access_token;
        for (const bm of allBeatmaps) {
            if (bm.url && bm.url.length && bm.url.indexOf('osu.ppy.sh/beatmapsets/') > -1) {
                const osuId = helpers_1.findBeatmapsetId(bm.url);
                const bmInfo = await osuApi_1.getBeatmapsetV2Info(token, osuId);
                await helpers_1.sleep(500);
                if (!osuApi_1.isOsuResponseError(bmInfo)) {
                    const status = helpers_1.findBeatmapsetStatus(bmInfo.ranked);
                    /*  osu:    Qualified/Ranked
                        MG:     Pending
                        save:   Qualified on MG */
                    if ((status == beatmap_2.BeatmapStatus.Qualified || status == beatmap_2.BeatmapStatus.Ranked) && bm.status == beatmap_2.BeatmapStatus.Done) {
                        bm.status = beatmap_2.BeatmapStatus.Qualified;
                        if (status == beatmap_2.BeatmapStatus.Ranked) {
                            bm.rankedDate = new Date(bmInfo.ranked_date);
                        }
                        await bm.save();
                        // remove modders who didn't post anything
                        for (const modder of bm.modders) {
                            const currentBeatmap = await beatmap_1.BeatmapModel
                                .findById(bm._id)
                                .defaultPopulate()
                                .orFail();
                            const discussionInfo = await osuApi_1.getDiscussions(token, `?beatmapset_id=${osuId}&message_types%5B%5D=suggestion&message_types%5B%5D=problem&user=${modder.osuId}`);
                            await helpers_1.sleep(500);
                            if (!osuApi_1.isOsuResponseError(discussionInfo) && discussionInfo.discussions && !discussionInfo.discussions.length) {
                                const i = currentBeatmap.modders.findIndex(m => m.id == modder.id);
                                if (i !== -1) {
                                    currentBeatmap.modders.splice(i, 1);
                                    await currentBeatmap.save();
                                }
                            }
                        }
                        // add bns to modders (after above, in case a bn didn't post anything)
                        await helpers_1.setNominators(bm, bmInfo);
                    }
                    /*  osu:    Pending
                        MG:     Qualified
                        save:   Pending on MG + un-queue for rank */
                    if (status == beatmap_2.BeatmapStatus.Done && bm.status == beatmap_2.BeatmapStatus.Qualified) {
                        bm.status = beatmap_2.BeatmapStatus.Done;
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
const processDailyArtists = node_cron_1.default.schedule('0 18 * * *', async () => {
    const response = await osuApi_1.getClientCredentialsGrant();
    let token;
    if (!osuApi_1.isOsuResponseError(response))
        token = response.access_token;
    const searchResults = await osuApi_1.getBeatmapsSearch(token, ``);
    if (searchResults.beatmapsets && searchResults.beatmapsets.length) {
        for (const beatmapset of searchResults.beatmapsets) {
            const fa = await featuredArtist_1.FeaturedArtistModel.findOne({ label: beatmapset.artist });
            if (!fa) {
                const artistSearchResults = await osuApi_1.getBeatmapsSearch(token, `?q=artist%3D"${beatmapset.artist}"&s=any&sort=plays_desc`);
                if (artistSearchResults.beatmapsets && artistSearchResults.beatmapsets.length) {
                    let playcount = 0;
                    for (const beatmapset of artistSearchResults.beatmapsets) {
                        playcount += beatmapset.play_count;
                    }
                    if (playcount > 5000) {
                        const a = new featuredArtist_1.FeaturedArtistModel();
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
const publishQuests = node_cron_1.default.schedule('0 22 * * *', async () => {
    const scheduledQuests = await quest_1.QuestModel
        .find({
        status: quest_2.QuestStatus.Scheduled,
    })
        .defaultPopulate();
    const webhooks = [];
    for (const quest of scheduledQuests) {
        const i = webhooks.findIndex(w => w.artist && w.artist == quest.art);
        if (i !== -1) {
            webhooks[i].quests.push(quest);
        }
        else {
            webhooks.push({
                creator: quest.creator,
                artist: quest.art,
                isMbc: quest.isMbc,
                url: quest.isMbc ? 'https://mappersguild.com/images/mbc-icon.png' : quest.art ? `https://assets.ppy.sh/artists/${quest.art}/cover.jpg` : 'https://mappersguild.com/images/no-art-icon.png',
                quests: [quest],
            });
        }
        quest.status = quest_2.QuestStatus.Open;
        await quest.save();
    }
    for (const webhook of webhooks) {
        // new fa quests
        if (webhook.creator.osuId == 3178418) {
            let title = 'New ';
            if (webhook.artist && !webhook.isMbc) {
                const artist = await featuredArtist_1.FeaturedArtistModel.findOne({ osuId: webhook.artist }).orFail();
                title += `${artist.label} `;
            }
            title += webhook.quests.length > 1 ? `quests:\n` : `quest:\n`;
            let description = '';
            for (const quest of webhook.quests) {
                description += generateQuestDetails(quest);
            }
            await discordApi_1.webhookPost([{
                    ...await helpers_1.generateBotAuthorWebhook(),
                    color: discordApi_1.webhookColors.orange,
                    title,
                    description,
                    thumbnail: {
                        url: webhook.url,
                    },
                }]);
            // user-submitted quests
        }
        else {
            let description = '';
            for (const quest of webhook.quests) {
                description += generateQuestDetails(quest);
            }
            await discordApi_1.webhookPost([{
                    author: {
                        name: `${webhook.creator.username}`,
                        url: `https://osu.ppy.sh/users/${webhook.creator.osuId}`,
                        icon_url: `https://a.ppy.sh/${webhook.creator.osuId}`,
                    },
                    color: discordApi_1.webhookColors.yellow,
                    title: 'New custom quest:',
                    description,
                    thumbnail: {
                        url: webhook.url,
                    },
                }]);
        }
        await helpers_1.sleep(1000);
    }
}, {
    scheduled: false,
});
/* dev notification for actions */
const sendActionNotifications = node_cron_1.default.schedule('0 23 * * *', async () => {
    // beatmaps
    const actionBeatmaps = await beatmap_1.BeatmapModel
        .find({
        status: beatmap_2.BeatmapStatus.Qualified,
        queuedForRank: { $ne: true },
    })
        .defaultPopulate()
        .sort({ updatedAt: 1 });
    if (actionBeatmaps.length > 5) {
        discordApi_1.devWebhookPost([{
                title: `beatmaps`,
                color: discordApi_1.webhookColors.lightRed,
                description: `**${actionBeatmaps.length}** pending beatmaps\n\nadmin: https://mappersguild.com/admin/summary`,
            }]);
    }
    // quests
    let quests = await quest_1.QuestModel
        .find({ status: quest_2.QuestStatus.WIP, queuedForCompletion: { $ne: true } })
        .defaultPopulate();
    quests = quests.filter(q => q.associatedMaps.length >= q.requiredMapsets &&
        q.associatedMaps.every(b => b.status === beatmap_2.BeatmapStatus.Ranked));
    const pendingQuests = await quest_1.QuestModel
        .find({ status: quest_2.QuestStatus.Pending })
        .defaultPopulate();
    quests = quests.concat(pendingQuests);
    if (quests.length) {
        discordApi_1.devWebhookPost([{
                title: `quests`,
                color: discordApi_1.webhookColors.lightRed,
                description: `**${quests.length}** pending quests\n\nadmin: https://mappersguild.com/admin/summary`,
            }]);
    }
    // users
    const day = new Date().getDate();
    const invalids = [5226970, 7496029]; // user IDs for people who specifically asked not to earn badges
    const allUsers = await user_1.UserModel.find({
        osuId: { $nin: invalids },
    });
    const actionUsers = allUsers.filter(u => u.badge < u.rank);
    if (actionUsers.length > 5) {
        discordApi_1.devWebhookPost([{
                title: `users`,
                color: discordApi_1.webhookColors.lightRed,
                description: `**${actionUsers.length}** pending user badges\n\nadmin: https://mappersguild.com/admin/summary`,
            }]);
    }
    // contests
    const actionContests = await contest_1.ContestModel
        .find({
        isApproved: { $ne: true },
        status: { $ne: contest_2.ContestStatus.Hidden },
    })
        .populate({ path: 'creators' });
    if (actionContests.length) {
        discordApi_1.devWebhookPost([{
                title: `contests`,
                color: discordApi_1.webhookColors.lightRed,
                description: `**${actionContests.length}** pending contests\n\nadmin: https://mappersguild.com/admin/summary`,
            }]);
    }
}, {
    scheduled: false,
});
/* open/close announcements and mark missions as inactive */
const processMissions = node_cron_1.default.schedule('4 20 * * *', async () => {
    const today = new Date();
    const ids = [];
    const missions = await mission_1.MissionModel
        .find({
        $or: [
            { status: mission_2.MissionStatus.Open },
            { status: mission_2.MissionStatus.Closed, openingAnnounced: true, closingAnnounced: false },
        ],
    })
        .extendedDefaultPopulate();
    for (const mission of missions) {
        await helpers_1.sleep(500);
        if (mission.status == mission_2.MissionStatus.Open && !mission.openingAnnounced) {
            // logs
            log_1.LogModel.generate(null, `"${mission.name}" opened`, log_2.LogCategory.Mission);
            // webhook
            await discordApi_1.webhookPost([{
                    ...await helpers_1.generateBotAuthorWebhook(),
                    color: discordApi_1.webhookColors.lightBlue,
                    title: `New priority quest`,
                    description: generateMissionDetails(mission),
                    ...helpers_1.generateMissionThumbnailUrl(mission),
                }]);
            await mission_1.MissionModel.findByIdAndUpdate(mission.id, { openingAnnounced: true });
        }
        else if (mission.status == mission_2.MissionStatus.Closed && !mission.closingAnnounced && mission.winningBeatmaps && mission.winningBeatmaps.length) {
            for (const beatmap of mission.winningBeatmaps) {
                for (const task of beatmap.tasks) {
                    for (const mapper of task.mappers) {
                        if (!ids.includes(mapper.id)) {
                            ids.push(mapper.id);
                        }
                    }
                }
            }
            await discordApi_1.webhookPost([{
                    ...await helpers_1.generateBotAuthorWebhook(),
                    color: discordApi_1.webhookColors.lightOrange,
                    description: generateMissionClosedDetails(mission),
                }]);
            await mission_1.MissionModel.findByIdAndUpdate(mission.id, { closingAnnounced: true });
        }
        else if (mission.status == mission_2.MissionStatus.Open && mission.openingAnnounced && !mission.isShowcaseMission) {
            let closeTrigger = false;
            const deadline = new Date(mission.deadline);
            // trigger if past deadline
            if (today > deadline) {
                closeTrigger = true;
            }
            if (closeTrigger) {
                await mission_1.MissionModel.findByIdAndUpdate(mission.id, { status: mission_2.MissionStatus.Closed });
                //logs
                log_1.LogModel.generate(null, `"${mission.name}" closed (past deadline)`, log_2.LogCategory.Mission);
                // dev webhook
                discordApi_1.devWebhookPost([{
                        title: `mission deadline met`,
                        color: discordApi_1.webhookColors.black,
                        description: `mission [**${mission.name}**](https://mappersguild.com/missions?id=${mission.id}) needs winners selected`,
                    }]);
            }
        }
    }
    for (const id of ids) {
        await points_1.updateUserPoints(id);
    }
}, {
    scheduled: false,
});
/* if MG Qualified beatmap is osu Ranked and already checked, post webhook */
const setRanked = node_cron_1.default.schedule('0 1 * * *', async () => {
    const qualifiedBeatmaps = await beatmap_1.BeatmapModel
        .find({
        status: beatmap_2.BeatmapStatus.Qualified,
        url: { $exists: true },
        queuedForRank: true,
    });
    for (const bm of qualifiedBeatmaps) {
        if (bm.url.indexOf('osu.ppy.sh/beatmapsets/') > -1) {
            const osuId = helpers_1.findBeatmapsetId(bm.url);
            const response = await osuApi_1.getClientCredentialsGrant();
            await helpers_1.sleep(500);
            if (!osuApi_1.isOsuResponseError(response)) {
                const token = response.access_token;
                const bmInfo = await osuApi_1.getBeatmapsetV2Info(token, osuId);
                await helpers_1.sleep(500);
                if (!osuApi_1.isOsuResponseError(bmInfo)) {
                    const status = helpers_1.findBeatmapsetStatus(bmInfo.ranked);
                    if (status == beatmap_2.BeatmapStatus.Ranked) {
                        await helpers_1.setBeatmapStatusRanked(bm.id, bmInfo);
                    }
                }
            }
        }
    }
}, {
    scheduled: false,
});
/* publish completed quest webhooks */
const completeQuests = node_cron_1.default.schedule('0 3 * * *', async () => {
    const scheduledQuests = await quest_1.QuestModel
        .find({
        queuedForCompletion: true,
        status: quest_2.QuestStatus.WIP,
    })
        .defaultPopulate();
    for (let i = 0; i < scheduledQuests.length; i++) {
        const quest = scheduledQuests[i];
        quest.completed = new Date();
        quest.status = quest_2.QuestStatus.Done;
        await quest.save();
        for (const member of quest.currentParty.members) {
            points_1.updateUserPoints(member.id);
        }
        //webhook
        const { modeList, memberList } = helpers_1.generateLists(quest.modes, quest.currentParty.members);
        await discordApi_1.webhookPost([{
                ...helpers_1.generateAuthorWebhook(quest.currentParty.leader),
                color: discordApi_1.webhookColors.purple,
                description: `Completed quest: [**${quest.name}**](https://mappersguild.com/quests?id=${quest.id}) [**${modeList}**]`,
                ...helpers_1.generateThumbnailUrl(quest),
                fields: [{
                        name: 'Members',
                        value: memberList,
                    }],
            }]);
        await helpers_1.sleep(1000);
    }
}, {
    scheduled: false,
});
/* publish webhooks for users who rank up */
const rankUsers = node_cron_1.default.schedule('1 3 * * *', async () => {
    const rankedUsers = await user_1.UserModel.find({ rank: { $gte: 1 } });
    for (let i = 0; i < rankedUsers.length; i++) {
        const user = rankedUsers[i];
        if (user.rank !== user.badge && user.rank == user.queuedBadge) {
            user.badge = user.queuedBadge;
            await user.save();
            //webhook
            const badge = user.queuedBadge;
            let rankColor = discordApi_1.webhookColors.white;
            if (badge == 1) {
                rankColor = discordApi_1.webhookColors.brown;
            }
            else if (badge == 2) {
                rankColor = discordApi_1.webhookColors.gray;
            }
            else if (badge == 3) {
                rankColor = discordApi_1.webhookColors.lightYellow;
            }
            else if (badge == 4) {
                rankColor = discordApi_1.webhookColors.lightBlue;
            }
            else if (badge == 5) {
                rankColor = discordApi_1.webhookColors.darkRed;
            }
            const description = `**Reached rank ${badge}** with ${user.totalPoints} total points`;
            discordApi_1.webhookPost([{
                    author: {
                        name: user.username,
                        icon_url: `https://a.ppy.sh/${user.osuId}`,
                        url: `https://osu.ppy.sh/u/${user.osuId}`,
                    },
                    color: rankColor,
                    description,
                }]);
            await helpers_1.sleep(1000);
        }
    }
}, {
    scheduled: false,
});
/* drop quests that have been inactive for >1 year */
const dropOverdueQuests = node_cron_1.default.schedule('2 3 * * *', async () => {
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);
    const quests = await quest_1.QuestModel
        .find({
        status: quest_2.QuestStatus.WIP,
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
            // logs
            const { modeList, memberList } = helpers_1.generateLists(quest.modes, members);
            log_1.LogModel.generate(null, `party dropped quest "${quest.name}" for mode${quest.modes.length > 1 ? 's' : ''} "${modeList}"`, log_2.LogCategory.Quest);
            // webhook
            const openQuest = await quest_1.QuestModel
                .findOne({
                status: quest_2.QuestStatus.Open,
                name: quest.name,
            });
            await discordApi_1.webhookPost([{
                    ...helpers_1.generateAuthorWebhook(leader),
                    color: discordApi_1.webhookColors.red,
                    description: `Automatically dropped quest due to inactivity: [**${quest.name}**](https://mappersguild.com/quests?id=${openQuest ? openQuest.id : quest.id}) [**${modeList}**]`,
                    ...helpers_1.generateThumbnailUrl(quest),
                    fields: [{
                            name: 'Party members',
                            value: memberList,
                        }],
                }]);
            // announcement to party leader. not sending because it'd just make people sad
            /*const channel = {
                name: `MG - Quest dropped`,
                description: `Automatic quest drop due to inactivity`,
            };

            const message = `the [**${quest.name}**](https://mappersguild.com/quests?id=${openQuest ? openQuest.id : quest.id}) quest has been automatically dropped due to being inactive for 1 year.`;

            await sendAnnouncement([leader.osuId], channel, message);*/
        }
    }
}, {
    scheduled: false,
});
/* validate ranked beatmaps for accurate ranked_date/current_nominators/hit_length. limited to 100 beatmaps daily because it takes too long otherwise, and it doesn't need to be done that frequently */
const validateRankedBeatmaps = node_cron_1.default.schedule('0 4 * * *', async () => {
    const [beatmaps, response] = await Promise.all([
        beatmap_1.BeatmapModel
            .find({
            status: beatmap_2.BeatmapStatus.Ranked,
        })
            .defaultPopulate()
            .limit(100)
            .sort({ updatedAt: 1 })
            .orFail(),
        osuApi_1.getClientCredentialsGrant(),
    ]);
    await helpers_1.sleep(250);
    if (!osuApi_1.isOsuResponseError(response)) {
        const token = response.access_token;
        for (const beatmap of beatmaps) {
            const osuId = helpers_1.findBeatmapsetId(beatmap.url);
            const bmInfo = await osuApi_1.getBeatmapsetV2Info(token, osuId);
            await helpers_1.sleep(250);
            if (!osuApi_1.isOsuResponseError(bmInfo)) {
                beatmap.bns = [];
                await helpers_1.setNominators(beatmap, bmInfo);
                beatmap.length = helpers_1.getLongestBeatmapLength(bmInfo.beatmaps);
                beatmap.rankedDate = bmInfo.ranked_date;
                await beatmap.save();
            }
        }
    }
}, {
    scheduled: false,
});
/* update favorites/playcount for pending maps (used for priority quests with this as a requirement). limited to 1000 daily */
const updateFavoritesAndPlayCount = node_cron_1.default.schedule('5 4 * * *', async () => {
    const [beatmaps, response] = await Promise.all([
        beatmap_1.BeatmapModel
            .find({
            $or: [
                { status: beatmap_2.BeatmapStatus.Done },
                { status: beatmap_2.BeatmapStatus.WIP },
            ],
            url: { $exists: true },
        })
            .defaultPopulate()
            .limit(1000)
            .sort({ updatedAt: 1 })
            .orFail(),
        osuApi_1.getClientCredentialsGrant(),
    ]);
    await helpers_1.sleep(250);
    if (!osuApi_1.isOsuResponseError(response)) {
        const token = response.access_token;
        for (const beatmap of beatmaps) {
            if (beatmap.url && beatmap.url.length) {
                const osuId = helpers_1.findBeatmapsetId(beatmap.url);
                const bmInfo = await osuApi_1.getBeatmapsetV2Info(token, osuId);
                await helpers_1.sleep(50);
                if (!osuApi_1.isOsuResponseError(bmInfo)) {
                    beatmap.favorites = bmInfo.favourite_count;
                    beatmap.playCount = bmInfo.play_count;
                    await beatmap.save();
                }
            }
            else {
                beatmap.favorites = 0;
                beatmap.playCount = 0;
            }
        }
    }
}, {
    scheduled: false,
});
exports.default = { sendActionNotifications, setQualified, setRanked, publishQuests, completeQuests, rankUsers, processDailyArtists, validateRankedBeatmaps, dropOverdueQuests, processMissions, updateFavoritesAndPlayCount };
