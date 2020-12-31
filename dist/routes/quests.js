"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../helpers/middlewares");
const points_1 = require("../helpers/points");
const helpers_1 = require("../helpers/helpers");
const beatmap_1 = require("../interfaces/beatmap/beatmap");
const quest_1 = require("../interfaces/quest");
const log_1 = require("../interfaces/log");
const discordApi_1 = require("../helpers/discordApi");
const spentPoints_1 = require("../interfaces/spentPoints");
const points_2 = require("../helpers/points");
const quest_2 = require("../models/quest");
const log_2 = require("../models/log");
const spentPoints_2 = require("../models/spentPoints");
const featuredArtist_1 = require("../models/featuredArtist");
const extras_1 = require("../interfaces/extras");
const user_1 = require("../models/user");
function isPartyLeader(req, res, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.params.id)
            return res.json({ error: 'Invalid' });
        const quest = yield quest_2.QuestModel.defaultFindByIdOrFail(req.params.id);
        if (((_a = quest.currentParty) === null || _a === void 0 ? void 0 : _a.leader.id) != res.locals.userRequest.id) {
            return res.json({ error: 'Unauthorized' });
        }
        res.locals.quest = quest;
        next();
    });
}
const questsRouter = express_1.default.Router();
questsRouter.use(middlewares_1.isLoggedIn);
questsRouter.get('/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    let query = {};
    const mode = (_a = req.query.mode) === null || _a === void 0 ? void 0 : _a.toString();
    const status = (_b = req.query.status) === null || _b === void 0 ? void 0 : _b.toString();
    const id = (_c = req.query.id) === null || _c === void 0 ? void 0 : _c.toString();
    if (mode !== extras_1.FilterMode.any)
        query.modes = mode;
    if (status === quest_1.QuestStatus.Open) {
        query.status = quest_1.QuestStatus.Open;
        query.expiration = { $gt: new Date() };
    }
    else {
        query.status = { $ne: quest_1.QuestStatus.Hidden };
    }
    if (id) {
        query = {
            $or: [
                query,
                { _id: id },
            ],
        };
    }
    const quests = yield quest_2.QuestModel
        .find(query)
        .defaultPopulate()
        .sortByLastest();
    res.json(quests);
}));
questsRouter.post('/:id/accept', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    let quest = yield quest_2.QuestModel
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
    if (party.members.some(m => m.availablePoints < quest.price)) {
        return res.json({ error: 'Someone in your party does not have enough points to accept the quest!' });
    }
    if (party.members.length < quest.minParty
        || party.members.length > quest.maxParty
        || party.rank < quest.minRank
        || quest.isExpired) {
        return res.json({ error: `Requirements weren't met` });
    }
    const remainingModes = quest.modes;
    for (const mode of party.modes) {
        const i = remainingModes.findIndex(m => m === mode);
        if (i === -1) {
            return res.json({ error: `Quest already exists for selected mode(s)! (${mode})` });
        }
        remainingModes.splice(i, 1);
    }
    if (quest.isMbc && party.modes.some(m => m != beatmap_1.BeatmapMode.Osu)) {
        return res.json({ error: 'MBC quests do not support modes other than osu!' });
    }
    for (const p of quest.parties) {
        if (p.id != party.id && party.modes.some(m => p.modes.includes(m))) {
            yield p.remove();
        }
    }
    const status = quest_1.QuestStatus.WIP;
    const accepted = new Date();
    const deadline = new Date(new Date().getTime() + quest.timeframe);
    if (party.modes.length === quest.modes.length) {
        quest.status = status;
        quest.accepted = accepted;
        quest.deadline = deadline;
    }
    else {
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
        yield newQuest.save();
        quest.modes = remainingModes;
        yield quest.save();
        party.quest = newQuest;
        yield party.save();
        quest = newQuest;
    }
    for (const member of party.members) {
        yield spentPoints_2.SpentPointsModel.generate(spentPoints_1.SpentPointsCategory.AcceptQuest, member._id, quest._id);
        yield points_2.updateUserPoints(member.id);
    }
    const allQuests = yield quest_2.QuestModel.findAll();
    res.json({
        quests: allQuests,
        availablePoints: res.locals.userRequest.availablePoints - quest.price,
    });
    const { modeList, memberList } = helpers_1.generateLists(party.modes, party.members);
    log_2.LogModel.generate((_d = req.session) === null || _d === void 0 ? void 0 : _d.mongoId, `party accepted quest "${quest.name}" for mode${party.modes.length > 1 ? 's' : ''} "${modeList}"`, log_1.LogCategory.Quest);
    discordApi_1.webhookPost([Object.assign(Object.assign(Object.assign(Object.assign({}, helpers_1.generateAuthorWebhook(party.leader)), { description: `Accepted quest: [**${quest.name}**](https://mappersguild.com/quests?id=${quest.id}) [**${party.modes.join(', ')}**]`, color: discordApi_1.webhookColors.green }), helpers_1.generateThumbnailUrl(quest)), { fields: [
                {
                    name: 'Party members',
                    value: memberList,
                },
            ] })]);
}));
questsRouter.post('/:id/drop', isPartyLeader, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const quest = res.locals.quest;
    if (quest.status !== quest_1.QuestStatus.WIP) {
        return res.json({ error: 'Invalid request!' });
    }
    const members = quest.currentParty.members;
    const leader = quest.currentParty.leader;
    yield quest.drop();
    const allQuests = yield quest_2.QuestModel.findAll();
    res.json(allQuests);
    const { modeList, memberList } = helpers_1.generateLists(quest.modes, members);
    log_2.LogModel.generate((_e = req.session) === null || _e === void 0 ? void 0 : _e.mongoId, `party dropped quest "${quest.name}" for mode${quest.modes.length > 1 ? 's' : ''} "${modeList}"`, log_1.LogCategory.Quest);
    discordApi_1.webhookPost([Object.assign(Object.assign(Object.assign(Object.assign({}, helpers_1.generateAuthorWebhook(leader)), { color: discordApi_1.webhookColors.red, description: `Dropped quest: [**${quest.name}**](https://mappersguild.com/quests?id=${quest.id}) [**${modeList}**]` }), helpers_1.generateThumbnailUrl(quest)), { fields: [{
                    name: 'Party members',
                    value: memberList,
                }] })]);
}));
questsRouter.post('/:id/extendDeadline', isPartyLeader, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f, _g;
    const quest = res.locals.quest;
    if (quest.currentParty.members.some(m => m.availablePoints < points_1.extendQuestPrice)) {
        return res.json({ error: 'One or more of your party members do not have enough points to extend the deadline!' });
    }
    for (const member of quest.currentParty.members) {
        spentPoints_2.SpentPointsModel.generate(spentPoints_1.SpentPointsCategory.ExtendDeadline, member.id, quest.id);
        points_2.updateUserPoints(member.id);
    }
    if (!quest.deadline)
        throw new Error();
    const deadline = new Date(quest.deadline);
    deadline.setDate(deadline.getDate() + 30);
    quest.deadline = deadline;
    yield quest.save();
    const user = yield user_1.UserModel.findById((_f = req.session) === null || _f === void 0 ? void 0 : _f.mongoId).orFail();
    res.json({
        quest,
        availablePoints: user.availablePoints,
    });
    log_2.LogModel.generate((_g = req.session) === null || _g === void 0 ? void 0 : _g.mongoId, `extended deadline for ${quest.name}`, log_1.LogCategory.Party);
}));
questsRouter.post('/:id/reopen', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _h, _j, _k;
    const questId = req.params.id;
    const user = res.locals.userRequest;
    const quest = yield quest_2.QuestModel
        .findById(questId)
        .defaultPopulate()
        .orFail();
    if (user.availablePoints < quest.reopenPrice) {
        return res.json({ error: `You don't have enough points to re-open this quest!` });
    }
    const newExpiration = new Date();
    newExpiration.setDate(newExpiration.getDate() + 90);
    yield quest_2.QuestModel.findByIdAndUpdate(questId, {
        expiration: newExpiration,
    });
    spentPoints_2.SpentPointsModel.generate(spentPoints_1.SpentPointsCategory.ReopenQuest, (_h = req.session) === null || _h === void 0 ? void 0 : _h.mongoId, quest._id);
    points_2.updateUserPoints((_j = req.session) === null || _j === void 0 ? void 0 : _j.mongoId);
    const allQuests = yield quest_2.QuestModel.findAll();
    res.json({ quests: allQuests, availablePoints: user.availablePoints });
    log_2.LogModel.generate((_k = req.session) === null || _k === void 0 ? void 0 : _k.mongoId, `re-opened quest "${quest.name}"`, log_1.LogCategory.Quest);
    discordApi_1.webhookPost([Object.assign(Object.assign(Object.assign(Object.assign({}, helpers_1.generateAuthorWebhook(user)), { color: discordApi_1.webhookColors.white, description: `Quest re-opened: [**${quest.name}**](https://mappersguild.com/quests?id=${quest.id})` }), helpers_1.generateThumbnailUrl(quest)), { fields: [{
                    name: 'Objective',
                    value: `${quest.descriptionMain}`,
                }] })]);
}));
questsRouter.post('/submit', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = res.locals.userRequest;
    const artist = yield featuredArtist_1.FeaturedArtistModel.findOne({ osuId: req.body.art });
    const quest = new quest_2.QuestModel();
    quest.name = req.body.name;
    quest.price = req.body.price;
    quest.descriptionMain = req.body.descriptionMain;
    quest.timeframe = req.body.timeframe;
    quest.minParty = req.body.minParty;
    quest.maxParty = req.body.maxParty;
    quest.requiredMapsets = req.body.requiredMapsets;
    quest.art = (artist === null || artist === void 0 ? void 0 : artist.osuId) || 0;
    quest.modes = [beatmap_1.BeatmapMode.Osu, beatmap_1.BeatmapMode.Taiko, beatmap_1.BeatmapMode.Catch, beatmap_1.BeatmapMode.Mania];
    quest.minRank = 0;
    quest.status = quest_1.QuestStatus.Pending;
    quest.creator = user._id;
    const points = points_1.findCreateQuestPointsSpent(quest.art, quest.requiredMapsets);
    if (user.availablePoints < points) {
        return res.json({ error: 'Not enough points to perform this action!' });
    }
    yield quest.save();
    res.json({ success: 'Quest submitted for approval' });
    spentPoints_2.SpentPointsModel.generate(spentPoints_1.SpentPointsCategory.CreateQuest, user._id, quest._id);
    points_2.updateUserPoints(user._id);
    log_2.LogModel.generate(user._id, `submitted quest for approval`, log_1.LogCategory.Quest);
}));
exports.default = questsRouter;
