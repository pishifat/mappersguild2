"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../helpers/middlewares");
const points_1 = require("../helpers/points");
const helpers_1 = require("../helpers/helpers");
const beatmap_1 = require("../../interfaces/beatmap/beatmap");
const quest_1 = require("../../interfaces/quest");
const log_1 = require("../../interfaces/log");
const discordApi_1 = require("../helpers/discordApi");
const spentPoints_1 = require("../../interfaces/spentPoints");
const spentPoints_2 = require("../models/spentPoints");
const points_2 = require("../helpers/points");
const quest_2 = require("../models/quest");
const log_2 = require("../models/log");
const featuredArtist_1 = require("../models/featuredArtist");
const extras_1 = require("../../interfaces/extras");
const user_1 = require("../models/user");
async function isPartyLeader(req, res, next) {
    if (!req.params.id)
        return res.json({ error: 'Invalid' });
    const quest = await quest_2.QuestModel.defaultFindByIdOrFail(req.params.id);
    if (quest.currentParty?.leader.id != res.locals.userRequest.id) {
        return res.json({ error: 'Unauthorized' });
    }
    res.locals.quest = quest;
    next();
}
const questsRouter = express_1.default.Router();
questsRouter.use(middlewares_1.isLoggedIn);
/* GET quests */
questsRouter.get('/search', async (req, res) => {
    let query = {};
    const mode = req.query.mode?.toString();
    const limit = req.query.limit.toString();
    const artist = req.query.artist?.toString();
    const id = req.query.id?.toString();
    if (mode !== extras_1.FilterMode.any)
        query.modes = mode;
    query.status = { $ne: quest_1.QuestStatus.Hidden };
    if (artist) {
        if (artist == 'user') {
            const pishifat = await user_1.UserModel.findOne({ osuId: 3178418 }).orFail();
            query = { creator: { $ne: pishifat._id } };
        }
        else if (artist == 'none') {
            query.art = null;
        }
        else {
            query.art = artist;
        }
    }
    if (id) {
        query = { _id: id };
    }
    const quests = await quest_2.QuestModel
        .find(query)
        .defaultPopulate()
        .sortByLatest()
        .limit(parseInt(limit));
    res.json(quests);
});
/* POST accepts quest. */
questsRouter.post('/:id/accept', async (req, res) => {
    let quest = await quest_2.QuestModel
        .findById(req.params.id)
        .where('status', quest_1.QuestStatus.Open)
        .defaultPopulate()
        .orFail();
    const party = quest.parties.find(p => p.leader.id == req.session.mongoId);
    if (!party)
        throw new Error('Party not found');
    if (!party.modes.length) {
        return res.json({ error: 'Your party has no modes selected!' });
    }
    // check if quest is valid to accept
    if (party.members.length < quest.minParty
        || party.members.length > quest.maxParty
        || party.rank < quest.minRank
        || quest.isExpired) {
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
    if (quest.isMbc && party.modes.some(m => m != beatmap_1.BeatmapMode.Osu)) {
        return res.json({ error: 'MBC quests do not support modes other than osu!' });
    }
    for (const p of quest.parties) {
        // parties that selected a same mode as the current party taking the quest aren't welcome anymore
        if (p.id != party.id && party.modes.some(m => p.modes.includes(m))) {
            await p.remove();
        }
    }
    const status = quest_1.QuestStatus.WIP;
    const accepted = new Date();
    const deadline = new Date(new Date().getTime() + quest.timeframe);
    if (party.modes.length === quest.modes.length) {
        // No need to create a new quest when there are no modes left for use
        quest.status = status;
        quest.accepted = accepted;
        quest.deadline = deadline;
        await quest.save();
    }
    else {
        // Create a new WIP quest and leave the old one open with the remaning modes
        const newQuest = new quest_2.QuestModel();
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
            await spentPoints_2.SpentPointsModel.generate(spentPoints_1.SpentPointsCategory.AcceptQuest, member._id, quest._id, null);
            await points_2.updateUserPoints(member.id);
        }
        else { // if user can't afford it, suck party leader's points (even if that goes negative i don't care. if someone bypasses the front-end lock for this they deserve to do the quest)
            await spentPoints_2.SpentPointsModel.generate(spentPoints_1.SpentPointsCategory.AcceptQuest, party.leader._id, quest._id, null);
            await points_2.updateUserPoints(party.leader.id);
        }
    }
    quest = await quest_2.QuestModel
        .findById(quest.id)
        .defaultPopulate()
        .orFail();
    res.json({
        quests: [quest],
        availablePoints: res.locals.userRequest.availablePoints - quest.price,
    });
    //logs
    const { modeList, memberList } = helpers_1.generateLists(party.modes, party.members);
    log_2.LogModel.generate(req.session?.mongoId, `party accepted quest "${quest.name}" for mode${party.modes.length > 1 ? 's' : ''} "${modeList}"`, log_1.LogCategory.Quest);
    //webhook
    discordApi_1.webhookPost([{
            ...helpers_1.generateAuthorWebhook(party.leader),
            description: `Accepted quest: [**${quest.name}**](https://mappersguild.com/quests?id=${quest.id}) [**${party.modes.join(', ')}**]`,
            color: discordApi_1.webhookColors.green,
            ...helpers_1.generateThumbnailUrl(quest),
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
    const quest = res.locals.quest;
    if (quest.status !== quest_1.QuestStatus.WIP) {
        return res.json({ error: 'Invalid request!' });
    }
    // Party is removed in the next step so members wouldn't extist
    const members = quest.currentParty.members;
    const leader = quest.currentParty.leader;
    await quest.drop();
    const allQuests = await quest_2.QuestModel.findAll(100);
    res.json(allQuests);
    //logs
    const { modeList, memberList } = helpers_1.generateLists(quest.modes, members);
    log_2.LogModel.generate(req.session?.mongoId, `party dropped quest "${quest.name}" for mode${quest.modes.length > 1 ? 's' : ''} "${modeList}"`, log_1.LogCategory.Quest);
    //webhook
    discordApi_1.webhookPost([{
            ...helpers_1.generateAuthorWebhook(leader),
            color: discordApi_1.webhookColors.red,
            description: `Dropped quest: [**${quest.name}**](https://mappersguild.com/quests?id=${quest.id}) [**${modeList}**]`,
            ...helpers_1.generateThumbnailUrl(quest),
            fields: [{
                    name: 'Party members',
                    value: memberList,
                }],
        }]);
});
/* POST reopen expired quest. */
questsRouter.post('/:id/reopen', async (req, res) => {
    const questId = req.params.id;
    const user = res.locals.userRequest;
    let quest = await quest_2.QuestModel
        .findById(questId)
        .defaultPopulate()
        .orFail();
    if (user.availablePoints < quest.reopenPrice) {
        return res.json({ error: `You don't have enough points to re-open this quest!` });
    }
    const newExpiration = new Date();
    newExpiration.setDate(newExpiration.getDate() + 90);
    quest = await quest_2.QuestModel
        .findByIdAndUpdate(questId, {
        expiration: newExpiration,
    })
        .defaultPopulate()
        .orFail();
    spentPoints_2.SpentPointsModel.generate(spentPoints_1.SpentPointsCategory.ReopenQuest, req.session?.mongoId, quest._id, null);
    points_2.updateUserPoints(req.session?.mongoId);
    res.json({ quests: [quest], availablePoints: user.availablePoints });
    log_2.LogModel.generate(req.session?.mongoId, `re-opened quest "${quest.name}"`, log_1.LogCategory.Quest);
    // webhook
    discordApi_1.webhookPost([{
            ...helpers_1.generateAuthorWebhook(user),
            color: discordApi_1.webhookColors.white,
            description: `Quest re-opened: [**${quest.name}**](https://mappersguild.com/quests?id=${quest.id})`,
            ...helpers_1.generateThumbnailUrl(quest),
            fields: [{
                    name: 'Objective',
                    value: `${quest.descriptionMain}`,
                }],
        }]);
});
/* POST add quest */
questsRouter.post('/submit', async (req, res) => {
    //quest creation
    const user = res.locals.userRequest;
    const artist = await featuredArtist_1.FeaturedArtistModel.findOne({ osuId: req.body.art });
    const quest = new quest_2.QuestModel();
    quest.name = req.body.name;
    quest.price = req.body.price;
    quest.descriptionMain = req.body.descriptionMain;
    quest.timeframe = req.body.timeframe;
    quest.minParty = req.body.minParty;
    quest.maxParty = req.body.maxParty;
    quest.requiredMapsets = req.body.requiredMapsets;
    quest.art = artist?.osuId || 0;
    quest.modes = req.body.modes;
    quest.minRank = 0;
    quest.status = quest_1.QuestStatus.Pending;
    quest.creator = user._id;
    // points
    const points = points_1.findCreateQuestPointsSpent(quest.art, quest.requiredMapsets);
    if (user.availablePoints < points) {
        return res.json({ error: 'Not enough points to perform this action!' });
    }
    await quest.save();
    res.json({ success: 'Quest submitted for approval' });
    spentPoints_2.SpentPointsModel.generate(spentPoints_1.SpentPointsCategory.CreateQuest, user._id, quest._id, null);
    points_2.updateUserPoints(user._id);
    log_2.LogModel.generate(user._id, `submitted quest for approval`, log_1.LogCategory.Quest);
});
exports.default = questsRouter;
