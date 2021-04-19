import cron from 'node-cron';
import { findBeatmapsetId, sleep, findBeatmapsetStatus, setBeatmapStatusRanked, generateAuthorWebhook, generateThumbnailUrl, generateLists } from './helpers';
import { beatmapsetInfo, isOsuResponseError } from './osuApi';
import { webhookPost, webhookColors } from './discordApi';
import { BeatmapModel } from '../models/beatmap/beatmap';
import { BeatmapStatus } from '../interfaces/beatmap/beatmap';
import { QuestModel } from '../models/quest';
import { QuestStatus } from '../interfaces/quest';
import { UserModel } from '../models/user';
import { FeaturedArtistModel } from '../models/featuredArtist';
import { updateUserPoints } from './points';

/* compare beatmap status MG vs. osu and update */
const setQualified = cron.schedule('0 18 * * *', async () => { /* 10:00 AM PST */
    const statusQuery = [
        { status: { $ne: BeatmapStatus.Ranked } },
        { status: { $ne: BeatmapStatus.Secret } },
        { status: { $ne: BeatmapStatus.WIP } },
    ];

    const allBeatmaps = await BeatmapModel
        .find({
            url: { $exists: true },
            $and: statusQuery,
        });

    for (const bm of allBeatmaps) {
        if (bm.url.indexOf('osu.ppy.sh/beatmapsets/') > -1) {
            const osuId = findBeatmapsetId(bm.url);
            const bmInfo = await beatmapsetInfo(osuId);
            await sleep(500);

            if (!isOsuResponseError(bmInfo)) {
                const status = findBeatmapsetStatus(bmInfo.approved);

                /*  osu:    Qualified/Ranked
                    MG:     Pending
                    save:   Qualified on MG */
                if ((status == BeatmapStatus.Qualified || status == BeatmapStatus.Ranked) && bm.status == BeatmapStatus.Done) {
                    bm.status = BeatmapStatus.Qualified;
                    await bm.save();
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
}, {
    scheduled: false,
});

/* if MG Qualified beatmap is osu Ranked and already checked, post webhook */
const setRanked = cron.schedule('0 1 * * *', async () => { /* 5:00 PM PST */
    const qualifiedBeatmaps = await BeatmapModel
        .find({
            status: BeatmapStatus.Qualified,
            url: { $exists: true },
            queuedForRank: true,
        });

    for (const bm of qualifiedBeatmaps) {
        if (bm.url.indexOf('osu.ppy.sh/beatmapsets/') > -1) {
            const osuId = findBeatmapsetId(bm.url);
            const bmInfo = await beatmapsetInfo(osuId);
            await sleep(500);

            if (!isOsuResponseError(bmInfo)) {
                const status = findBeatmapsetStatus(bmInfo.approved);

                if (status == BeatmapStatus.Ranked) {
                    await setBeatmapStatusRanked(bm.id, bmInfo);
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
const publishQuests = cron.schedule('0 22 * * *', async () => { /* 1:00 PM PST */
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

/* publish completed quest webhooks */
const completeQuests = cron.schedule('0 3 * * *', async () => { /* 7:00 PM PST */
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
const rankUsers = cron.schedule('1 3 * * *', async () => { /* 7:01 PM PST */
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

            let description = `**Reached rank ${badge}** with ${user.totalPoints} total points`;

            if (badge == 4) description += `\n\n...there's no reward for this (yet) but 1000+ points is pretty impressive`;

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

export default { setQualified, setRanked, publishQuests, completeQuests, rankUsers };