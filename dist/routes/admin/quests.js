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
const middlewares_1 = require("../../helpers/middlewares");
const points_1 = require("../../helpers/points");
const quest_1 = require("../../models/quest");
const quest_2 = require("../../interfaces/quest");
const beatmap_1 = require("../../interfaces/beatmap/beatmap");
const log_1 = require("../../models/log");
const log_2 = require("../../interfaces/log");
const discordApi_1 = require("../../helpers/discordApi");
const party_1 = require("../../models/party");
const spentPoints_1 = require("../../models/spentPoints");
const helpers_1 = require("../../helpers/helpers");
const featuredArtist_1 = require("../../models/featuredArtist");
const helpers_2 = require("../../helpers/helpers");
const adminQuestsRouter = express_1.default.Router();
adminQuestsRouter.use(middlewares_1.isLoggedIn);
adminQuestsRouter.use(middlewares_1.isAdmin);
adminQuestsRouter.use(middlewares_1.isSuperAdmin);
adminQuestsRouter.get('/load', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const q = yield quest_1.QuestModel
        .find({})
        .defaultPopulate()
        .sort({ status: -1, name: 1 });
    res.json(q);
}));
adminQuestsRouter.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
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
        quest.creator = (_a = req === null || req === void 0 ? void 0 : req.session) === null || _a === void 0 ? void 0 : _a.mongoId;
        const newQuest = yield quest_1.QuestModel.create(quest);
        newQuests.push(newQuest);
        log_1.LogModel.generate((_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId, `created quest "${newQuest.name}"`, log_2.LogCategory.Quest);
    }
    const webhooks = [];
    for (const quest of newQuests) {
        const i = webhooks.findIndex(w => w.artist && w.artist == quest.art);
        if (i !== -1) {
            webhooks[i].quests.push(quest);
        }
        else {
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
            const artist = yield featuredArtist_1.FeaturedArtistModel.findOne({ osuId: webhook.artist }).orFail();
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
        discordApi_1.webhookPost([{
                color: discordApi_1.webhookColors.orange,
                title,
                description,
                thumbnail: {
                    url: webhook.url,
                },
            }]);
        yield helpers_1.sleep(1000);
    }
    const quests = yield quest_1.QuestModel.findAll();
    res.json({
        quests,
    });
}));
adminQuestsRouter.post('/:id/publish', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const quest = yield quest_1.QuestModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 90);
    quest.expiration = expiration;
    quest.status = quest_2.QuestStatus.Open;
    yield quest.save();
    log_1.LogModel.generate((_c = req.session) === null || _c === void 0 ? void 0 : _c.mongoId, `published quest "${quest.name}" by "${quest.creator.username}"`, log_2.LogCategory.Quest);
    discordApi_1.webhookPost([{
            author: {
                name: quest.creator.username,
                url: `https://osu.ppy.sh/users/${quest.creator.osuId}`,
                icon_url: `https://a.ppy.sh/${quest.creator.osuId}`,
            },
            color: discordApi_1.webhookColors.yellow,
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
}));
adminQuestsRouter.post('/:id/reject', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield quest_1.QuestModel.findByIdAndUpdate(req.params.id, { status: quest_2.QuestStatus.Rejected }).orFail();
    const quest = yield quest_1.QuestModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();
    points_1.updateUserPoints(quest.creator.id);
    const spentPoints = yield spentPoints_1.SpentPointsModel.findOne({ quest: quest._id }).orFail();
    yield spentPoints_1.SpentPointsModel.findByIdAndRemove(spentPoints.id);
    res.json(quest.status);
}));
adminQuestsRouter.post('/:id/updateArt', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const art = parseInt(req.body.art, 10);
    yield quest_1.QuestModel.findByIdAndUpdate(req.params.id, { art }).orFail();
    res.json(art);
}));
adminQuestsRouter.post('/:id/rename', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield quest_1.QuestModel.findByIdAndUpdate(req.params.id, { name: req.body.name }).orFail();
    res.json(req.body.name);
}));
adminQuestsRouter.post('/:id/updateDescription', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield quest_1.QuestModel.findByIdAndUpdate(req.params.id, { descriptionMain: req.body.description }).orFail();
    res.json(req.body.description);
}));
adminQuestsRouter.post('/:id/updatePrice', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const price = parseInt(req.body.price, 10);
    yield quest_1.QuestModel.findByIdAndUpdate(req.params.id, { price }).orFail();
    res.json(price);
}));
adminQuestsRouter.post('/:id/updateRequiredMapsets', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requiredMapsets = parseInt(req.body.requiredMapsets, 10);
    yield quest_1.QuestModel.findByIdAndUpdate(req.params.id, { requiredMapsets }).orFail();
    res.json(requiredMapsets);
}));
adminQuestsRouter.post('/:id/updateTimeframe', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const timeframe = parseInt(req.body.timeframe, 10);
    yield quest_1.QuestModel.findByIdAndUpdate(req.params.id, { timeframe: timeframe * (24 * 3600 * 1000) }).orFail();
    res.json(timeframe);
}));
adminQuestsRouter.post('/:id/updateMinParty', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const minParty = parseInt(req.body.minParty, 10);
    yield quest_1.QuestModel.findByIdAndUpdate(req.params.id, { minParty }).orFail();
    res.json(minParty);
}));
adminQuestsRouter.post('/:id/updateMaxParty', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const maxParty = parseInt(req.body.maxParty, 10);
    yield quest_1.QuestModel.findByIdAndUpdate(req.params.id, { maxParty }).orFail();
    res.json(maxParty);
}));
adminQuestsRouter.post('/:id/drop', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    let quest = yield quest_1.QuestModel.defaultFindByIdOrFail(req.params.id);
    quest = yield quest.drop();
    res.json(quest);
    const { memberList, modeList } = helpers_2.generateLists(quest.modes, quest.currentParty.members);
    discordApi_1.webhookPost([Object.assign(Object.assign(Object.assign(Object.assign({}, helpers_2.generateAuthorWebhook(quest.currentParty.leader)), { color: discordApi_1.webhookColors.red, description: `Dropped quest: [**${quest.name}**](https://mappersguild.com/quests?id=${quest.id}) [**${modeList}**]` }), helpers_2.generateThumbnailUrl(quest)), { fields: [{
                    name: 'Party members',
                    value: memberList,
                }] })]);
    log_1.LogModel.generate((_d = req.session) === null || _d === void 0 ? void 0 : _d.mongoId, `forced party to drop quest "${quest.name}"`, log_2.LogCategory.Quest);
}));
adminQuestsRouter.post('/:id/complete', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const quest = yield quest_1.QuestModel.defaultFindByIdOrFail(req.params.id);
    if (quest.status !== quest_2.QuestStatus.WIP) {
        throw new Error(`Quest is ${quest.status}`);
    }
    quest.completed = new Date();
    quest.status = quest_2.QuestStatus.Done;
    yield quest.save();
    for (const member of quest.currentParty.members) {
        points_1.updateUserPoints(member.id);
    }
    const { modeList, memberList } = helpers_2.generateLists(quest.modes, quest.currentParty.members);
    discordApi_1.webhookPost([Object.assign(Object.assign(Object.assign(Object.assign({}, helpers_2.generateAuthorWebhook(quest.currentParty.leader)), { color: discordApi_1.webhookColors.purple, description: `Completed quest: [**${quest.name}**](https://mappersguild.com/quests?id=${quest.id}) [**${modeList}**]` }), helpers_2.generateThumbnailUrl(quest)), { fields: [{
                    name: 'Members',
                    value: memberList,
                }] })]);
    res.json(quest);
    log_1.LogModel.generate((_e = req.session) === null || _e === void 0 ? void 0 : _e.mongoId, `marked quest "${quest.name}" as complete`, log_2.LogCategory.Quest);
}));
adminQuestsRouter.post('/:id/toggleMode', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const quest = yield quest_1.QuestModel.findById(req.params.id).orFail();
    const mode = req.body.mode;
    const i = quest.modes.findIndex(m => m === mode);
    if (i !== -1) {
        quest.modes.splice(i, 1);
    }
    else {
        quest.modes.push(mode);
    }
    yield quest.save();
    res.json(quest);
}));
adminQuestsRouter.post('/:id/updateExpiration', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const date = new Date(req.body.expiration);
    if (!(date instanceof Date && !isNaN(date.getTime()))) {
        return res.json({ error: 'Invalid date' });
    }
    yield quest_1.QuestModel.findByIdAndUpdate(req.params.id, { expiration: date }).orFail();
    res.json(date);
}));
adminQuestsRouter.post('/:id/updateMinParty', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const minParty = parseInt(req.body.minParty, 10);
    if (isNaN(minParty)) {
        return res.json({ error: 'Invalid number' });
    }
    yield quest_1.QuestModel.findByIdAndUpdate(req.params.id, { minParty }).orFail();
    res.json(minParty);
}));
adminQuestsRouter.post('/:id/updateMaxParty', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const maxParty = parseInt(req.body.maxParty, 10);
    if (isNaN(maxParty)) {
        return res.json({ error: 'Invalid number' });
    }
    yield quest_1.QuestModel.findByIdAndUpdate(req.params.id, { maxParty }).orFail();
    res.json(maxParty);
}));
adminQuestsRouter.post('/:id/reset', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    const quest = yield quest_1.QuestModel.findById(req.params.id).orFail();
    quest.deadline = date;
    yield quest.save();
    res.json(date);
}));
adminQuestsRouter.post('/:id/delete', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    const quest = yield quest_1.QuestModel.findById(req.params.id).orFail();
    if (quest.status !== quest_2.QuestStatus.Open) {
        throw new Error(`Quest is ${quest.status}`);
    }
    yield quest.remove();
    res.json({ success: 'ok' });
    log_1.LogModel.generate((_f = req.session) === null || _f === void 0 ? void 0 : _f.mongoId, `deleted quest "${quest.name}"`, log_2.LogCategory.Quest);
}));
adminQuestsRouter.post('/removeDuplicatePartyMembers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parties = yield party_1.PartyModel
        .find({})
        .orFail();
    for (const party of parties) {
        const members = party.members.sort();
        for (let i = 1; i < members.length; i++) {
            if (members[i].toString() == members[i - 1].toString()) {
                yield party_1.PartyModel.findByIdAndUpdate(party.id, { $pull: { members: members[i] } });
                yield party_1.PartyModel.findByIdAndUpdate(party.id, { $push: { members: members[i] } });
            }
        }
    }
    res.json(true);
}));
exports.default = adminQuestsRouter;
