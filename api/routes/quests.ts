import express from 'express';
import { isLoggedIn } from '../helpers/middlewares';
import { findCreateQuestPointsSpent } from '../helpers/points';
import { generateLists, generateThumbnailUrl, generateAuthorWebhook } from '../helpers/helpers';
import { BeatmapMode } from '../../interfaces/beatmap/beatmap';
import { Quest, QuestStatus } from '../../interfaces/quest';
import { LogCategory } from '../../interfaces/log';
import { webhookPost, webhookColors } from '../helpers/discordApi';
import { SpentPointsCategory } from '../../interfaces/spentPoints';
import { SpentPointsModel } from '../models/spentPoints';
import { updateUserPoints } from '../helpers/points';
import { QuestModel } from '../models/quest';
import { LogModel } from '../models/log';
import { FeaturedArtistModel } from '../models/featuredArtist';
import { User } from '../../interfaces/user';
import { FilterMode } from '../../interfaces/extras';
import { PointsRefreshResponse } from '../../interfaces/api/quests';
import { UserModel } from '../models/user';

async function isPartyLeader (req, res, next): Promise<void> {
    if (!req.params.id) return res.json({ error: 'Invalid' });

    const quest = await QuestModel.defaultFindByIdOrFail(req.params.id);

    if (quest.currentParty?.leader.id != res.locals.userRequest.id) {
        return res.json({ error: 'Unauthorized' });
    }

    res.locals.quest = quest;
    next();
}

const questsRouter = express.Router();

questsRouter.use(isLoggedIn);

/* GET quests */
questsRouter.get('/search', async (req, res) => {
    let query: Record<string, any> = {};

    const mode = req.query.mode?.toString();
    const limit = req.query.limit!.toString();
    const artist = req.query.artist?.toString();
    const id = req.query.id?.toString();

    if (mode !== FilterMode.any) query.modes = mode;

    query.status = { $ne: QuestStatus.Hidden };

    if (artist) {
        if (artist == 'user') {
            const pishifat = await UserModel.findOne({ osuId: 3178418 }).orFail();
            query = { creator: { $ne: pishifat._id } };
        } else if (artist == 'none') {
            query.art = null;
        } else {
            query.art = artist;
        }
    }

    if (id) {
        query = { _id: id };
    }

    const quests = await QuestModel
        .find(query)
        .defaultPopulate()
        .sortByLatest()
        .limit(parseInt(limit));

    res.json(quests);
});

/* GET example quest */
questsRouter.get('/example', async (req, res) => {
    res.json(await QuestModel.findById('62d0799b1cfaf430df14eae3').defaultPopulate());
});

/* POST accepts quest. */
questsRouter.post('/:id/accept', async (req, res) => {
    let quest = await QuestModel
        .findById(req.params.id)
        .where('status', QuestStatus.Open)
        .defaultPopulate()
        .orFail();

    const party = quest.parties.find(p => p.leader.id == req.session.mongoId);
    if (!party) throw new Error('Party not found');

    if (!party.modes.length) {
        return res.json({ error: 'Your party has no modes selected!' });
    }

    // check if quest is valid to accept
    if (party.members.length < quest.minParty
        || party.members.length > quest.maxParty
        || party.rank < quest.minRank
        || quest.isExpired
    ) {
        return res.json({ error: `Requirements weren't met` });
    }

    const remainingModes = [...quest.modes];

    // check if quest has the modes available for the party's modes
    for (const mode of party.modes) {
        const i = remainingModes.findIndex(m => m === mode);

        if (i === -1) {
            return res.json({ error: `Quest already exists for selected mode(s)! (${mode})` });
        }

        remainingModes.splice(i, 1);
    }

    // check if MBC quest with non-osu! modes selected
    if (quest.isMbc && party.modes.some(m => m != BeatmapMode.Osu)) {
        return res.json({ error: 'MBC quests do not support modes other than osu!' });
    }

    for (const p of quest.parties) {
        // parties that selected a same mode as the current party taking the quest aren't welcome anymore
        if (p.id != party.id && party.modes.some(m => p.modes.includes(m))) {
            await p.remove();
        }
    }

    const status = QuestStatus.WIP;
    const accepted = new Date();
    const deadline = new Date(new Date().getTime() + quest.timeframe);

    if (party.modes.length === quest.modes.length) {
        // No need to create a new quest when there are no modes left for use
        quest.status = status;
        quest.accepted = accepted;
        quest.deadline = deadline;

        await quest.save();
    } else {
        // Create a new WIP quest and leave the old one open with the remaning modes
        const newQuest = new QuestModel();
        newQuest.creator = quest.creator;
        newQuest.name = quest.name;
        newQuest.price = quest.price;
        newQuest.descriptionMain = quest.descriptionMain;
        newQuest.timeframe = quest.timeframe;
        newQuest.requiredMapsets = quest.requiredMapsets;
        newQuest.minParty = quest.minParty;
        newQuest.maxParty = quest.maxParty;
        newQuest.minRank = quest.minRank;
        newQuest.art = quest.art;
        newQuest.isMbc = quest.isMbc;
        newQuest.expiration = quest.expiration;
        newQuest.status = status;
        newQuest.modes = party.modes;
        newQuest.accepted = accepted;
        newQuest.deadline = deadline;
        await newQuest.save();

        quest.modes = remainingModes;
        await quest.save();

        party.quest = newQuest;
        party.pendingMembers = [];
        await party.save();

        quest = newQuest;
    }

    // spend points
    for (const member of party.members) {
        if (member.availablePoints > quest.price) { // if user can afford it, suck their points
            await SpentPointsModel.generate(SpentPointsCategory.AcceptQuest, member._id, quest._id);
            await updateUserPoints(member.id);
        } else {                                    // if user can't afford it, suck party leader's points (even if that goes negative i don't care. if someone bypasses the front-end lock for this they deserve to do the quest)
            await SpentPointsModel.generate(SpentPointsCategory.AcceptQuest, party.leader._id, quest._id);
            await updateUserPoints(party.leader.id);
        }
    }

    quest = await QuestModel
        .findById(quest.id)
        .defaultPopulate()
        .orFail();

    res.json({
        quests: [quest],
        availablePoints: res.locals.userRequest.availablePoints - quest.price,
    } as PointsRefreshResponse);

    //logs
    const { modeList, memberList } = generateLists(party.modes, party.members);
    LogModel.generate(req.session?.mongoId, `party accepted quest "${quest.name}" for mode${party.modes.length > 1 ? 's' : ''} "${modeList}"`, LogCategory.Quest );

    //webhook
    webhookPost([{
        ...generateAuthorWebhook(party.leader),
        description: `Accepted quest: [**${quest.name}**](https://mappersguild.com/quests?id=${quest.id}) [**${party.modes.join(', ')}**]`,
        color: webhookColors.green,
        ...generateThumbnailUrl(quest),
        fields: [
            {
                name: 'Party members',
                value: memberList,
            },
        ],
    }]);
});

/* POST drop a WIP quest. */
questsRouter.post('/:id/drop', isPartyLeader, async (req, res) => {
    const quest: Quest = res.locals.quest;

    if (quest.status !== QuestStatus.WIP) {
        return res.json({ error: 'Invalid request!' });
    }

    // Party is removed in the next step so members wouldn't extist
    const members = quest.currentParty.members;
    const leader = quest.currentParty.leader;
    await quest.drop();

    const allQuests = await QuestModel.findAll(100);

    res.json(allQuests);

    //logs
    const { modeList, memberList } = generateLists(quest.modes, members);
    LogModel.generate(req.session?.mongoId, `party dropped quest "${quest.name}" for mode${quest.modes.length > 1 ? 's' : ''} "${modeList}"`, LogCategory.Quest );

    //webhook
    webhookPost([{
        ...generateAuthorWebhook(leader),
        color: webhookColors.red,
        description: `Dropped quest: [**${quest.name}**](https://mappersguild.com/quests?id=${quest.id}) [**${modeList}**]`,
        ...generateThumbnailUrl(quest),
        fields: [{
            name: 'Party members',
            value: memberList,
        }],
    }]);
});

/* POST reopen expired quest. */
questsRouter.post('/:id/reopen', async (req, res) => {
    const questId = req.params.id;
    const user: User = res.locals.userRequest;
    let quest = await QuestModel
        .findById(questId)
        .defaultPopulate()
        .orFail();

    if (user.availablePoints < quest.reopenPrice) {
        return res.json({ error: `You don't have enough points to re-open this quest!` });
    }

    const newExpiration = new Date();
    newExpiration.setDate(newExpiration.getDate() + 90);

    quest = await QuestModel
        .findByIdAndUpdate(questId, {
            expiration: newExpiration,
        })
        .defaultPopulate()
        .orFail();

    SpentPointsModel.generate(SpentPointsCategory.ReopenQuest, req.session?.mongoId, quest._id);
    updateUserPoints(req.session?.mongoId);

    res.json({ quests: [quest], availablePoints: user.availablePoints } as PointsRefreshResponse);

    LogModel.generate(req.session?.mongoId, `re-opened quest "${quest.name}"`, LogCategory.Quest );

    // webhook
    webhookPost([{
        ...generateAuthorWebhook(user),
        color: webhookColors.white,
        description: `Quest re-opened: [**${quest.name}**](https://mappersguild.com/quests?id=${quest.id})`,
        ...generateThumbnailUrl(quest),
        fields: [{
            name: 'Objective',
            value: `${quest.descriptionMain}`,
        }],
    }]);
});

/* POST add quest */
questsRouter.post('/submit', async (req, res) => {
    //quest creation
    const user: User = res.locals.userRequest;
    const artist = await FeaturedArtistModel.findOne({ osuId: req.body.art });
    const quest = new QuestModel();
    quest.name = req.body.name;
    quest.price = req.body.price;
    quest.descriptionMain = req.body.descriptionMain;
    quest.timeframe = req.body.timeframe;
    quest.minParty = req.body.minParty;
    quest.maxParty = req.body.maxParty;
    quest.requiredMapsets = req.body.requiredMapsets;
    quest.art = artist?.osuId || 0;
    quest.modes = [ BeatmapMode.Osu, BeatmapMode.Taiko, BeatmapMode.Catch, BeatmapMode.Mania ];
    quest.minRank = 0;
    quest.status = QuestStatus.Pending;
    quest.creator = user._id;

    // points
    const points = findCreateQuestPointsSpent(quest.art, quest.requiredMapsets);

    if (user.availablePoints < points) {
        return res.json({ error: 'Not enough points to perform this action!' });
    }

    await quest.save();

    res.json({ success: 'Quest submitted for approval' });

    SpentPointsModel.generate(SpentPointsCategory.CreateQuest, user._id, quest._id);
    updateUserPoints(user._id);
    LogModel.generate(user._id, `submitted quest for approval`, LogCategory.Quest);
});

export default questsRouter;
