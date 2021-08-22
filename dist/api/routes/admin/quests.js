"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../../helpers/middlewares");
const points_1 = require("../../helpers/points");
const quest_1 = require("../../models/quest");
const quest_2 = require("../../../interfaces/quest");
const beatmap_1 = require("../../../interfaces/beatmap/beatmap");
const log_1 = require("../../models/log");
const log_2 = require("../../../interfaces/log");
const discordApi_1 = require("../../helpers/discordApi");
const party_1 = require("../../models/party");
const spentPoints_1 = require("../../models/spentPoints");
const helpers_1 = require("../../helpers/helpers");
const adminQuestsRouter = express_1.default.Router();
adminQuestsRouter.use(middlewares_1.isLoggedIn);
adminQuestsRouter.use(middlewares_1.isAdmin);
adminQuestsRouter.use(middlewares_1.isSuperAdmin);
/* GET quests */
adminQuestsRouter.get('/load', async (req, res) => {
    const q = await quest_1.QuestModel
        .find({})
        .defaultPopulate()
        .sort({ status: -1, name: 1 });
    res.json(q);
});
/* POST add quest */
adminQuestsRouter.post('/create', async (req, res) => {
    const newQuests = [];
    for (const quest of req.body.quests) {
        if (quest.isMbc) {
            quest.modes = [beatmap_1.BeatmapMode.Osu];
        }
        else {
            quest.modes = [beatmap_1.BeatmapMode.Osu, beatmap_1.BeatmapMode.Taiko, beatmap_1.BeatmapMode.Catch, beatmap_1.BeatmapMode.Mania];
        }
        quest.expiration = new Date();
        quest.expiration.setDate(quest.expiration.getDate() + 90);
        quest.creator = req?.session?.mongoId;
        quest.status = quest_2.QuestStatus.Scheduled;
        const newQuest = await quest_1.QuestModel.create(quest);
        newQuests.push(newQuest);
        log_1.LogModel.generate(req.session?.mongoId, `created quest "${newQuest.name}"`, log_2.LogCategory.Quest);
    }
    const quests = await quest_1.QuestModel.findAll();
    res.json({
        quests,
    });
});
/* POST schedule quest */
adminQuestsRouter.post('/:id/schedule', async (req, res) => {
    const quest = await quest_1.QuestModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 90);
    quest.expiration = expiration;
    quest.status = quest_2.QuestStatus.Scheduled;
    await quest.save();
    log_1.LogModel.generate(req.session?.mongoId, `scheduled quest "${quest.name}" by "${quest.creator.username}"`, log_2.LogCategory.Quest);
    res.json(quest.status);
});
/* POST reject quest */
adminQuestsRouter.post('/:id/reject', async (req, res) => {
    await quest_1.QuestModel.findByIdAndUpdate(req.params.id, { status: quest_2.QuestStatus.Rejected }).orFail();
    const quest = await quest_1.QuestModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();
    points_1.updateUserPoints(quest.creator.id);
    const spentPoints = await spentPoints_1.SpentPointsModel.findOne({ quest: quest._id }).orFail();
    await spentPoints_1.SpentPointsModel.findByIdAndRemove(spentPoints.id);
    res.json(quest.status);
});
/* POST update quest objective */
adminQuestsRouter.post('/:id/updateArt', async (req, res) => {
    const art = parseInt(req.body.art, 10);
    await quest_1.QuestModel.findByIdAndUpdate(req.params.id, { art }).orFail();
    res.json(art);
});
/* POST rename quest */
adminQuestsRouter.post('/:id/rename', async (req, res) => {
    await quest_1.QuestModel.findByIdAndUpdate(req.params.id, { name: req.body.name }).orFail();
    res.json(req.body.name);
});
/* POST update quest objective */
adminQuestsRouter.post('/:id/updateDescription', async (req, res) => {
    await quest_1.QuestModel.findByIdAndUpdate(req.params.id, { descriptionMain: req.body.description }).orFail();
    res.json(req.body.description);
});
/* POST update price */
adminQuestsRouter.post('/:id/updatePrice', async (req, res) => {
    const price = parseInt(req.body.price, 10);
    await quest_1.QuestModel.findByIdAndUpdate(req.params.id, { price }).orFail();
    res.json(price);
});
/* POST update required mapsets */
adminQuestsRouter.post('/:id/updateRequiredMapsets', async (req, res) => {
    const requiredMapsets = parseInt(req.body.requiredMapsets, 10);
    await quest_1.QuestModel.findByIdAndUpdate(req.params.id, { requiredMapsets }).orFail();
    res.json(requiredMapsets);
});
/* POST update timeframe */
adminQuestsRouter.post('/:id/updateTimeframe', async (req, res) => {
    const timeframe = parseInt(req.body.timeframe, 10);
    await quest_1.QuestModel.findByIdAndUpdate(req.params.id, { timeframe: timeframe * (24 * 3600 * 1000) }).orFail();
    res.json(timeframe);
});
/* POST update minimum party size */
adminQuestsRouter.post('/:id/updateMinParty', async (req, res) => {
    const minParty = parseInt(req.body.minParty, 10);
    await quest_1.QuestModel.findByIdAndUpdate(req.params.id, { minParty }).orFail();
    res.json(minParty);
});
/* POST update maximum party size */
adminQuestsRouter.post('/:id/updateMaxParty', async (req, res) => {
    const maxParty = parseInt(req.body.maxParty, 10);
    await quest_1.QuestModel.findByIdAndUpdate(req.params.id, { maxParty }).orFail();
    res.json(maxParty);
});
/* POST drop a WIP quest */
adminQuestsRouter.post('/:id/drop', async (req, res) => {
    let quest = await quest_1.QuestModel.defaultFindByIdOrFail(req.params.id);
    quest = await quest.drop();
    res.json(quest);
    //webhook
    const { memberList, modeList } = helpers_1.generateLists(quest.modes, quest.currentParty.members);
    discordApi_1.webhookPost([{
            ...helpers_1.generateAuthorWebhook(quest.currentParty.leader),
            color: discordApi_1.webhookColors.red,
            description: `Dropped quest: [**${quest.name}**](https://mappersguild.com/quests?id=${quest.id}) [**${modeList}**]`,
            ...helpers_1.generateThumbnailUrl(quest),
            fields: [{
                    name: 'Party members',
                    value: memberList,
                }],
        }]);
    // logs
    log_1.LogModel.generate(req.session?.mongoId, `forced party to drop quest "${quest.name}"`, log_2.LogCategory.Quest);
});
/* POST schedule quest for completion */
adminQuestsRouter.post('/:id/scheduleForCompletion', async (req, res) => {
    const quest = await quest_1.QuestModel.defaultFindByIdOrFail(req.params.id);
    if (quest.status !== quest_2.QuestStatus.WIP) {
        throw new Error(`Quest is ${quest.status}`);
    }
    quest.queuedForCompletion = req.body.queuedForCompletion;
    await quest.save();
    res.json(req.body.queuedForCompletion);
    log_1.LogModel.generate(req.session?.mongoId, `marked quest "${quest.name}" as complete`, log_2.LogCategory.Quest);
});
/* POST toggle quest mode */
adminQuestsRouter.post('/:id/toggleMode', async (req, res) => {
    const quest = await quest_1.QuestModel.findById(req.params.id).orFail();
    const mode = req.body.mode;
    const i = quest.modes.findIndex(m => m === mode);
    if (i !== -1) {
        quest.modes.splice(i, 1);
    }
    else {
        quest.modes.push(mode);
    }
    await quest.save();
    res.json(quest);
});
/* POST update quest expiration */
adminQuestsRouter.post('/:id/updateExpiration', async (req, res) => {
    const date = new Date(req.body.expiration);
    if (!(date instanceof Date && !isNaN(date.getTime()))) {
        return res.json({ error: 'Invalid date' });
    }
    await quest_1.QuestModel.findByIdAndUpdate(req.params.id, { expiration: date }).orFail();
    res.json(date);
});
/* POST update quest minParty */
adminQuestsRouter.post('/:id/updateMinParty', async (req, res) => {
    const minParty = parseInt(req.body.minParty, 10);
    if (isNaN(minParty)) {
        return res.json({ error: 'Invalid number' });
    }
    await quest_1.QuestModel.findByIdAndUpdate(req.params.id, { minParty }).orFail();
    res.json(minParty);
});
/* POST update quest maxParty */
adminQuestsRouter.post('/:id/updateMaxParty', async (req, res) => {
    const maxParty = parseInt(req.body.maxParty, 10);
    if (isNaN(maxParty)) {
        return res.json({ error: 'Invalid number' });
    }
    await quest_1.QuestModel.findByIdAndUpdate(req.params.id, { maxParty }).orFail();
    res.json(maxParty);
});
/* POST reset quest deadline */
adminQuestsRouter.post('/:id/reset', async (req, res) => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    const quest = await quest_1.QuestModel.findById(req.params.id).orFail();
    quest.deadline = date;
    await quest.save();
    res.json(date);
});
/* POST delete quest */
adminQuestsRouter.post('/:id/delete', async (req, res) => {
    const quest = await quest_1.QuestModel.findById(req.params.id).orFail();
    if (quest.status !== quest_2.QuestStatus.Open) {
        throw new Error(`Quest is ${quest.status}`);
    }
    await quest.remove();
    res.json({ success: 'ok' });
    log_1.LogModel.generate(req.session?.mongoId, `deleted quest "${quest.name}"`, log_2.LogCategory.Quest);
});
/* POST remove duplicate party members from all parties */
adminQuestsRouter.post('/removeDuplicatePartyMembers', async (req, res) => {
    const parties = await party_1.PartyModel
        .find({})
        .orFail();
    for (const party of parties) {
        const members = party.members.sort();
        for (let i = 1; i < members.length; i++) {
            if (members[i].toString() == members[i - 1].toString()) {
                await party_1.PartyModel.findByIdAndUpdate(party.id, { $pull: { members: members[i] } }); // removes all
                await party_1.PartyModel.findByIdAndUpdate(party.id, { $push: { members: members[i] } }); // adds 1
            }
        }
    }
    res.json(true);
});
exports.default = adminQuestsRouter;
