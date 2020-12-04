import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';
import { updateUserPoints } from '../../helpers/points';
import { QuestModel, Quest } from '../../models/quest';
import { QuestStatus } from '../../interfaces/quest';
import { BeatmapMode } from '../../interfaces/beatmap/beatmap';
import { LogModel } from '../../models/log';
import { LogCategory } from '../../interfaces/log';
import { webhookPost, webhookColors } from '../../helpers/discordApi';
import { BeatmapModel } from '../../models/beatmap/beatmap';
import { PartyModel } from '../../models/party';
import { SpentPointsModel } from '../../models/spentPoints';
import { sleep } from '../../helpers/helpers';
import { FeaturedArtistModel } from '../../models/featuredArtist';

const adminQuestsRouter = express.Router();

adminQuestsRouter.use(isLoggedIn);
adminQuestsRouter.use(isAdmin);
adminQuestsRouter.use(isSuperAdmin);

/* GET quests */
adminQuestsRouter.get('/load', async (req, res) => {
    const q = await QuestModel
        .find({})
        .defaultPopulate()
        .sort({ status: -1, name: 1 });

    res.json(q);
});

/* POST add quest */
adminQuestsRouter.post('/create', async (req, res) => {
    const newQuests: Quest[] = [];

    for (const quest of req.body.quests) {
        if (quest.isMbc) {
            quest.modes = [ BeatmapMode.Osu ];
        } else {
            quest.modes = [ BeatmapMode.Osu, BeatmapMode.Taiko, BeatmapMode.Catch, BeatmapMode.Mania ];
        }

        quest.expiration = new Date();
        quest.expiration.setDate(quest.expiration.getDate() + 90);
        quest.creator = req?.session?.mongoId;

        const newQuest = await QuestModel.create(quest);
        newQuests.push(newQuest);

        LogModel.generate(req.session?.mongoId, `created quest "${newQuest.name}"`, LogCategory.Quest);
    }

    const webhooks: any = [];

    for (const quest of newQuests) {
        const i = webhooks.findIndex(w => w.artist && w.artist == quest.art);

        if (i !== -1) {
            webhooks[i].quests.push(quest);
        } else {
            webhooks.push({
                artist: quest.art,
                isMbc: quest.isMbc,
                url: quest.isMbc ? 'https://mappersguild.com/images/mbc-icon.png' : quest.art ? `https://assets.ppy.sh/artists/${quest.art}/cover.jpg` : 'https://mappersguild.com/images/no-art-icon.png',
                quests: [quest],
            });
        }
    }

    for (const webhook of webhooks) {
        let title = 'New ';

        if (webhook.artist && !webhook.isMbc) {
            const artist = await FeaturedArtistModel.findOne({ osuId: webhook.artist }).orFail();
            title += `${artist.label} `;
        }

        title += webhook.quests.length > 1 ? `quests:\n` : `quest:\n`;

        let description = '';

        for (const quest of webhook.quests) {
            description += `\n[**${quest.name}**](https://mappersguild.com/quests?id=${quest.id})`;
            description += `\n- **Objective:** ${quest.descriptionMain}`;
            description += `\n- **Members:** ${quest.minParty == quest.maxParty ? quest.maxParty : quest.minParty + '-' + quest.maxParty} member${quest.maxParty == 1 ? '' : 's'}`;
            description += `\n- **Price:** ${quest.price} points from each member`;
            description += `\n`;
        }

        webhookPost([{
            color: webhookColors.orange,
            title,
            description,
            thumbnail: {
                url: webhook.url,
            },
        }]);

        await sleep(1000);
    }

    const allQuests = await QuestModel
        .find({})
        .defaultPopulate()
        .sortByLastest();

    res.json(allQuests);
});

/* POST publish quest */
adminQuestsRouter.post('/:id/publish', async (req, res) => {
    const quest = await QuestModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();

    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 90);
    quest.expiration = expiration;

    quest.status = QuestStatus.Open;

    await quest.save();

    LogModel.generate(req.session?.mongoId, `published quest "${quest.name}" by "${quest.creator.username}"`, LogCategory.Quest);

    webhookPost([{
        author: {
            name: quest.creator.username,
            url: `https://osu.ppy.sh/users/${quest.creator.osuId}`,
            icon_url: `https://a.ppy.sh/${quest.creator.osuId}`,
        },
        color: webhookColors.yellow,
        description: `New custom quest: [**${quest.name}**](https://mappersguild.com/quests?id=${quest.id})`,
        thumbnail: {
            url: `https://assets.ppy.sh/artists/${quest.art}/cover.jpg`,
        },
        fields: [{
            name: 'Objective',
            value: `${quest.descriptionMain}`,
        },
        {
            name: 'Party size',
            value: `${quest.minParty == quest.maxParty ? quest.maxParty : quest.minParty + '-' + quest.maxParty} member${quest.maxParty == 1 ? '' : 's'}`,
        },
        {
            name: 'Price',
            value: `${quest.price} points from each member`,
        }],
    }]);

    res.json(quest.status);
});

/* POST reject quest */
adminQuestsRouter.post('/:id/reject', async (req, res) => {
    await QuestModel.findByIdAndUpdate(req.params.id, { status: QuestStatus.Rejected }).orFail();

    const quest = await QuestModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();

    updateUserPoints(quest.creator.id);

    const spentPoints = await SpentPointsModel.findOne({ quest: quest._id }).orFail();
    await SpentPointsModel.findByIdAndRemove(spentPoints.id);

    res.json(quest.status);
});

/* POST update quest objective */
adminQuestsRouter.post('/:id/updateArt', async (req, res) => {
    const art = parseInt(req.body.art, 10);
    await QuestModel.findByIdAndUpdate(req.params.id, { art }).orFail();

    res.json(art);
});

/* POST rename quest */
adminQuestsRouter.post('/:id/rename', async (req, res) => {
    await QuestModel.findByIdAndUpdate(req.params.id, { name: req.body.name }).orFail();

    res.json(req.body.name);
});

/* POST update quest objective */
adminQuestsRouter.post('/:id/updateDescription', async (req, res) => {
    await QuestModel.findByIdAndUpdate(req.params.id, { descriptionMain: req.body.description }).orFail();

    res.json(req.body.description);
});

/* POST update price */
adminQuestsRouter.post('/:id/updatePrice', async (req, res) => {
    const price = parseInt(req.body.price, 10);
    await QuestModel.findByIdAndUpdate(req.params.id, { price }).orFail();

    res.json(price);
});

/* POST update required mapsets */
adminQuestsRouter.post('/:id/updateRequiredMapsets', async (req, res) => {
    const requiredMapsets = parseInt(req.body.requiredMapsets, 10);
    await QuestModel.findByIdAndUpdate(req.params.id, { requiredMapsets }).orFail();

    res.json(requiredMapsets);
});

/* POST update timeframe */
adminQuestsRouter.post('/:id/updateTimeframe', async (req, res) => {
    const timeframe = parseInt(req.body.timeframe, 10);
    await QuestModel.findByIdAndUpdate(req.params.id, { timeframe: timeframe * (24*3600*1000) }).orFail();

    res.json(timeframe);
});

/* POST update minimum party size */
adminQuestsRouter.post('/:id/updateMinParty', async (req, res) => {
    const minParty = parseInt(req.body.minParty, 10);
    await QuestModel.findByIdAndUpdate(req.params.id, { minParty }).orFail();

    res.json(minParty);
});

/* POST update maximum party size */
adminQuestsRouter.post('/:id/updateMaxParty', async (req, res) => {
    const maxParty = parseInt(req.body.maxParty, 10);
    await QuestModel.findByIdAndUpdate(req.params.id, { maxParty }).orFail();

    res.json(maxParty);
});

/* POST drop quest */
adminQuestsRouter.post('/:id/drop', async (req, res) => {
    // establish data
    let q = await QuestModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();

    const party = await PartyModel
        .findById(q.currentParty._id)
        .defaultPopulate()
        .orFail(); // only used in webhook

    const openQuest = await QuestModel.findOne({
        name: q.name,
        status: QuestStatus.Open,
    });

    if (openQuest) { // push mode to open quest if it exists and hide existing quest
        await Promise.all([
            QuestModel.findByIdAndUpdate(openQuest._id, {
                $push: { modes: q.modes as any },
            }),
            QuestModel.findByIdAndUpdate(req.params.id, { status: QuestStatus.Hidden }),
        ]);
    } else {
        await QuestModel.findByIdAndUpdate(req.params.id, { // change quest status to open otherwise
            status: QuestStatus.Open,
            currentParty: undefined,
        });
    }

    // find all beatmaps and remove quest field from any that have dropped quest
    const maps = await BeatmapModel.find({}).orFail();

    for (let i = 0; i < maps.length; i++) {
        if (maps[i].quest && maps[i].quest.toString() == q.id) {
            BeatmapModel.findByIdAndUpdate(maps[i]._id, { quest: undefined }).orFail();
        }
    }

    // remove party
    await PartyModel.findByIdAndRemove(q.currentParty._id);

    if (openQuest) { // return open quest if original is hidden
        res.json(q);
    } else { // otherwise return new quest
        q = await QuestModel
            .findById(req.params.id)
            .defaultPopulate()
            .orFail();

        res.json(q);
    }

    //webhook
    let memberList = '';

    for (let i = 0; i < party.members.length; i++) {
        const user = party.members[i];
        memberList += `[**${user.username}**](https://osu.ppy.sh/users/${user.osuId})`;

        if (i+1 < party.members.length) {
            memberList += ', ';
        }
    }

    let url = `https://assets.ppy.sh/artists/${q.art}/cover.jpg`;

    if (q.isMbc) {
        url = 'https://mappersguild.com/images/mbc-icon.png';
    }

    webhookPost([{
        author: {
            name: `${party.leader.username}'s party`,
            url: `https://osu.ppy.sh/users/${party.leader.osuId}`,
            icon_url: `https://a.ppy.sh/${party.leader.osuId}`,
        },
        color: webhookColors.red,
        description: `Dropped quest: [**${q.name}**](https://mappersguild.com/quests?id=${openQuest ? openQuest.id : q.id}) [**${party.modes.join(', ')}**]`,
        thumbnail: {
            url,
        },
        fields: [{
            name: 'Party members',
            value: memberList,
        }],
    }]);

    // logs
    LogModel.generate(req.session?.mongoId, `forced party to drop quest "${q.name}"`, LogCategory.Quest);
});

/* POST complete quest */
adminQuestsRouter.post('/:id/complete', async (req, res) => {
    const quest = await QuestModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();

    if (quest.status == QuestStatus.WIP) {
        //webhook
        let memberList = '';

        for (let i = 0; i < quest.currentParty.members.length; i++) {
            const user = quest.currentParty.members[i];
            memberList += `[**${user.username}**](https://osu.ppy.sh/users/${user.osuId})`;

            if (i+1 < quest.currentParty.members.length) {
                memberList += ', ';
            }

            updateUserPoints(user.id);
        }

        let url = `https://assets.ppy.sh/artists/${quest.art}/cover.jpg`;

        if (quest.isMbc) {
            url = 'https://mappersguild.com/images/mbc-icon.png';
        }

        webhookPost([{
            author: {
                name: `${quest.currentParty.leader.username}'s party`,
                url: `https://osu.ppy.sh/users/${quest.currentParty.leader.osuId}`,
                icon_url: `https://a.ppy.sh/${quest.currentParty.leader.osuId}`,
            },
            color: webhookColors.purple,
            description: `Completed quest: [**${quest.name}**](https://mappersguild.com/quests?id=${quest.id}) [**${quest.currentParty.modes.join(', ')}**]`,
            thumbnail: {
                url,
            },
            fields: [{
                name: 'Members',
                value: memberList,
            }],
        }]);

        //quest changes
        await PartyModel.findByIdAndRemove(quest.currentParty._id);
        await QuestModel.findByIdAndUpdate(quest._id, {
            status: QuestStatus.Done,
            currentParty: undefined,
            completedMembers: quest.currentParty.members,
            completed: new Date(),
        });
    }

    const newQuest = await QuestModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();

    res.json(newQuest);

    LogModel.generate(req.session?.mongoId, `marked quest "${newQuest.name}" as complete`, LogCategory.Quest);
});

/* POST duplicate quest */
adminQuestsRouter.post('/:id/duplicate', async (req, res) => {
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 90);
    const q = await QuestModel.findById(req.params.id).orFail();
    await QuestModel.create<Partial<Quest>>({
        creator: q.creator,
        name: req.body.name,
        price: q.price,
        descriptionMain: q.descriptionMain,
        timeframe: q.timeframe,
        minParty: q.minParty,
        maxParty: q.maxParty,
        minRank: q.minRank,
        art: q.art,
        modes: [ BeatmapMode.Osu, BeatmapMode.Taiko, BeatmapMode.Catch, BeatmapMode.Mania ],
        expiration,
        requiredMapsets: q.requiredMapsets,
    });

    const allQuests = await QuestModel
        .find({})
        .defaultPopulate()
        .sortByLastest();

    res.json(allQuests);
});

/* POST reset quest deadline */
adminQuestsRouter.post('/:id/reset', async (req, res) => {
    const date = new Date();
    date.setDate(date.getDate() + 7);

    await QuestModel.findByIdAndUpdate(req.params.id, { deadline: date }).orFail();

    res.json(date);
});

/* POST delete quest */
adminQuestsRouter.post('/:id/delete', async (req, res) => {
    const q = await QuestModel.findById(req.params.id).orFail();

    if (q.status == QuestStatus.Open) {
        await QuestModel.findByIdAndRemove(req.params.id).orFail();
        res.json({ success: 'ok' });

        LogModel.generate(req.session?.mongoId, `deleted quest "${q.name}"`, LogCategory.Quest);
    } else {
        res.json({ success: 'ok' });
    }
});


/* POST toggle quest mode */
adminQuestsRouter.post('/:id/toggleMode', async (req, res) => {
    let quest = await QuestModel.findById(req.params.id).orFail();

    if (quest.modes.includes(req.body.mode)) {
        await QuestModel.findByIdAndUpdate(req.params.id, { $pull: { modes: req.body.mode } });
    } else {
        await QuestModel.findByIdAndUpdate(req.params.id, { $push: { modes: req.body.mode } });
    }

    quest = await QuestModel.findById(req.params.id).orFail();
    res.json(quest);
});

/* POST update quest expiration */
adminQuestsRouter.post('/:id/updateExpiration', async (req, res) => {
    const date = new Date(req.body.expiration);

    if (!(date instanceof Date && !isNaN(date.getTime()))) {
        return res.json({ error: 'Invalid date' });
    }

    await QuestModel.findByIdAndUpdate(req.params.id, { expiration: date }).orFail();

    res.json(date);
});

/* POST update quest minParty */
adminQuestsRouter.post('/:id/updateMinParty', async (req, res) => {
    const minParty = parseInt(req.body.minParty, 10);

    if (isNaN(minParty)) {
        return res.json({ error: 'Invalid number' });
    }

    await QuestModel.findByIdAndUpdate(req.params.id, { minParty }).orFail();

    res.json(minParty);
});

/* POST update quest maxParty */
adminQuestsRouter.post('/:id/updateMaxParty', async (req, res) => {
    const maxParty = parseInt(req.body.maxParty, 10);

    if (isNaN(maxParty)) {
        return res.json({ error: 'Invalid number' });
    }

    await QuestModel.findByIdAndUpdate(req.params.id, { maxParty }).orFail();

    res.json(maxParty);
});

/* POST remove duplicate party members from all parties */
adminQuestsRouter.post('/removeDuplicatePartyMembers', async (req, res) => {
    const parties = await PartyModel
        .find({})
        .orFail(); // only used in webhook

    for (const party of parties) {
        const members = party.members.sort();

        for (let i = 1; i < members.length; i++) {
            if (members[i].toString() == members[i-1].toString()) {
                await PartyModel.findByIdAndUpdate(party.id, { $pull: { members: members[i] } }); // removes all
                await PartyModel.findByIdAndUpdate(party.id, { $push: { members: members[i] } }); // adds 1
            }
        }
    }

    res.json(true);
});

export default adminQuestsRouter;
