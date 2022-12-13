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
const beatmap_2 = require("../../interfaces/beatmap/beatmap");
const quest_1 = require("../models/quest");
const contest_1 = require("../models/contest/contest");
const contest_2 = require("../../interfaces/contest/contest");
const quest_2 = require("../../interfaces/quest");
const user_1 = require("../models/user");
const featuredArtist_1 = require("../models/featuredArtist");
const points_1 = require("./points");
const user_2 = require("../../interfaces/user");
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
    if (actionBeatmaps.length) {
        discordApi_1.devWebhookPost([{
                title: `beatmaps`,
                color: discordApi_1.webhookColors.lightRed,
                description: `**${actionBeatmaps.length}** pending beatmaps\n\nadmin: https://mappersguild.com/admin/summary`,
            }]);
    }
    // quests
    let quests = await quest_1.QuestModel
        .find({ status: quest_2.QuestStatus.WIP })
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
    const invalids = [5226970, 7496029]; // user IDs for people who specifically asked not to earn badges
    const allUsers = await user_1.UserModel.find({
        osuId: { $nin: invalids },
    });
    const actionUsers = allUsers.filter(u => u.badge !== u.rank);
    if (actionUsers.length) {
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
/* compare beatmap status MG vs. osu and update */
const setQualified = node_cron_1.default.schedule('0 18 * * *', async () => {
    const statusQuery = [
        { status: { $ne: beatmap_2.BeatmapStatus.Ranked } },
        { status: { $ne: beatmap_2.BeatmapStatus.WIP } },
    ];
    const allBeatmaps = await beatmap_1.BeatmapModel
        .find({
        url: { $exists: true },
        $and: statusQuery,
    });
    for (const bm of allBeatmaps) {
        if (bm.url.indexOf('osu.ppy.sh/beatmapsets/') > -1) {
            const osuId = helpers_1.findBeatmapsetId(bm.url);
            const bmInfo = await osuApi_1.beatmapsetInfo(osuId);
            await helpers_1.sleep(500);
            if (!osuApi_1.isOsuResponseError(bmInfo)) {
                const status = helpers_1.findBeatmapsetStatus(bmInfo.approved);
                /*  osu:    Qualified/Ranked
                    MG:     Pending
                    save:   Qualified on MG */
                if ((status == beatmap_2.BeatmapStatus.Qualified || status == beatmap_2.BeatmapStatus.Ranked) && bm.status == beatmap_2.BeatmapStatus.Done) {
                    bm.status = beatmap_2.BeatmapStatus.Qualified;
                    await bm.save();
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
            const bmInfo = await osuApi_1.beatmapsetInfo(osuId);
            await helpers_1.sleep(500);
            if (!osuApi_1.isOsuResponseError(bmInfo)) {
                const status = helpers_1.findBeatmapsetStatus(bmInfo.approved);
                if (status == beatmap_2.BeatmapStatus.Ranked) {
                    await helpers_1.setBeatmapStatusRanked(bm.id, bmInfo);
                }
            }
        }
    }
}, {
    scheduled: false,
});
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
/* update points for all users once every month (21st) */
const updatePoints = node_cron_1.default.schedule('0 0 21 * *', async () => {
    const users = await user_1.UserModel.find({ group: { $ne: user_2.UserGroup.Spectator } });
    for (const user of users) {
        points_1.updateUserPoints(user.id);
    }
}, {
    scheduled: false,
});
exports.default = { sendActionNotifications, setQualified, setRanked, publishQuests, completeQuests, rankUsers, updatePoints };
