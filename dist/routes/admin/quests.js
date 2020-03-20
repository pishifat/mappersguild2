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
const quest_1 = require("../../models/quest");
const quest_2 = require("../../interfaces/quest");
const beatmap_1 = require("../../interfaces/beatmap/beatmap");
const log_1 = require("../../models/log");
const log_2 = require("../../interfaces/log");
const discordApi_1 = require("../../helpers/discordApi");
const beatmap_2 = require("../../models/beatmap/beatmap");
const party_1 = require("../../models/party");
const helpers_1 = require("../../helpers/helpers");
const adminQuestsRouter = express_1.default.Router();
adminQuestsRouter.use(middlewares_1.isLoggedIn);
adminQuestsRouter.use(middlewares_1.isAdmin);
adminQuestsRouter.use(middlewares_1.isSuperAdmin);
adminQuestsRouter.get('/', (req, res) => {
    var _a, _b;
    res.render('admin/quests', {
        title: 'Quests - Admin',
        script: 'adminQuests.js',
        loggedInAs: (_a = req.session) === null || _a === void 0 ? void 0 : _a.osuId,
        userMongoId: (_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});
adminQuestsRouter.get('/load', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const q = yield quest_1.QuestService.queryAll({
        defaultPopulate: true,
        sort: { status: -1, name: 1 },
    });
    res.json(q);
}));
adminQuestsRouter.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    req.body.modes = [beatmap_1.BeatmapMode.Osu, beatmap_1.BeatmapMode.Taiko, beatmap_1.BeatmapMode.Catch, beatmap_1.BeatmapMode.Mania];
    req.body.expiration = new Date();
    req.body.expiration.setDate(req.body.expiration.getDate() + 90);
    const quest = yield quest_1.QuestService.create(req.body);
    if (!quest_1.QuestService.isError(quest)) {
        log_1.LogService.create((_a = req.session) === null || _a === void 0 ? void 0 : _a.mongoId, `created quest "${quest.name}"`, log_2.LogCategory.Quest);
        discordApi_1.webhookPost([{
                author: {
                    name: `New Quest: ${quest.name}`,
                    url: `https://mappersguild.com/quests`,
                },
                thumbnail: {
                    url: `https://assets.ppy.sh/artists/${quest.art}/cover.jpg`,
                },
                color: 16734308,
                fields: [{
                        name: 'Objective',
                        value: `${quest.descriptionMain}`,
                    },
                    {
                        name: 'Party',
                        value: `${quest.minParty == quest.maxParty ? quest.maxParty : quest.minParty + '-' + quest.maxParty} member${quest.maxParty == 1 ? '' : 's'}`,
                    },
                    {
                        name: 'Price',
                        value: `${quest.price} points from each member`,
                    }],
            }]);
    }
    const allQuests = yield quest_1.QuestService.queryAll({ useDefaults: true });
    res.json(allQuests);
}));
adminQuestsRouter.post('/:id/rename', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield quest_1.QuestService.updateOrFail(req.params.id, { name: req.body.name });
    res.json(req.body.name);
})));
adminQuestsRouter.post('/:id/updatePrice', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const price = parseInt(req.body.price, 10);
    yield quest_1.QuestService.updateOrFail(req.params.id, { price });
    res.json(price);
})));
adminQuestsRouter.post('/:id/updateDescription', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield quest_1.QuestService.updateOrFail(req.params.id, { descriptionMain: req.body.description });
    res.json(req.body.description);
})));
adminQuestsRouter.post('/:id/drop', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    let q = yield quest_1.QuestService.queryByIdOrFail(req.params.id, { defaultPopulate: true });
    const openQuest = yield quest_1.QuestService.queryOne({
        query: {
            name: q.name,
            status: quest_2.QuestStatus.Open,
        },
    });
    if (openQuest && !quest_1.QuestService.isError(openQuest)) {
        yield Promise.all([
            quest_1.QuestService.update(openQuest._id, {
                $push: { modes: q.modes },
            }),
            quest_1.QuestService.remove(req.params.id),
        ]);
    }
    else {
        yield quest_1.QuestService.update(req.params.id, {
            status: quest_2.QuestStatus.Open,
            currentParty: null,
        });
    }
    const maps = yield beatmap_2.BeatmapService.queryAllOrFail({});
    for (let i = 0; i < maps.length; i++) {
        if (maps[i].quest && maps[i].quest.toString() == q.id) {
            beatmap_2.BeatmapService.updateOrFail(maps[i]._id, { quest: undefined });
        }
    }
    yield party_1.PartyService.remove(q.currentParty._id);
    if (openQuest && !quest_1.QuestService.isError(openQuest)) {
        res.json(q);
    }
    else {
        q = yield quest_1.QuestService.queryByIdOrFail(req.params.id, { defaultPopulate: true });
        res.json(q);
    }
    log_1.LogService.create((_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId, `forced party to drop quest "${q.name}"`, log_2.LogCategory.Quest);
})));
adminQuestsRouter.post('/:id/complete', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let quest = yield quest_1.QuestService.queryByIdOrFail(req.params.id, { defaultPopulate: true });
    if (quest.status == quest_2.QuestStatus.WIP) {
        const memberList = quest.currentParty.members
            .map(m => m.username)
            .join(', ');
        discordApi_1.webhookPost([{
                author: {
                    name: `Party completed quest: "${quest.name}"`,
                    url: `https://mappersguild.com/quests`,
                    icon_url: `https://a.ppy.sh/${quest.currentParty.leader.osuId}`,
                },
                color: 3138274,
                thumbnail: {
                    url: `https://assets.ppy.sh/artists/${quest.art}/cover.jpg`,
                },
                fields: [{
                        name: 'Members',
                        value: memberList,
                    }],
            }]);
        yield party_1.PartyService.remove(quest.currentParty._id);
        yield quest_1.QuestService.update(quest._id, {
            status: quest_2.QuestStatus.Done,
            currentParty: null,
            completedMembers: quest.currentParty.members,
            completed: new Date(),
        });
        quest = yield quest_1.QuestService.queryByIdOrFail(req.params.id, { defaultPopulate: true });
    }
    res.json(quest);
    log_1.LogService.create(req.session.mongoId, `marked quest "${quest.name}" as complete`, log_2.LogCategory.Quest);
})));
adminQuestsRouter.post('/:id/duplicate', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 90);
    const q = yield quest_1.QuestService.queryByIdOrFail(req.params.id);
    const body = {
        name: req.body.name,
        price: q.price,
        descriptionMain: q.descriptionMain,
        timeframe: q.timeframe,
        minParty: q.minParty,
        maxParty: q.maxParty,
        minRank: q.minRank,
        art: q.art,
        modes: [beatmap_1.BeatmapMode.Osu, beatmap_1.BeatmapMode.Taiko, beatmap_1.BeatmapMode.Catch, beatmap_1.BeatmapMode.Mania],
        expiration,
    };
    yield quest_1.QuestService.create(body);
    const allQuests = yield quest_1.QuestService.queryAll({ useDefaults: true });
    res.json(allQuests);
})));
adminQuestsRouter.post('/:id/reset', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    yield quest_1.QuestService.updateOrFail(req.params.id, { deadline: date });
    res.json(date);
})));
adminQuestsRouter.post('/:id/delete', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const q = yield quest_1.QuestService.queryByIdOrFail(req.params.id);
    if (q.status == quest_2.QuestStatus.Open) {
        yield quest_1.QuestService.removeOrFail(req.params.id);
        res.json({ success: 'ok' });
        log_1.LogService.create(req.session.mongoId, `deleted quest "${q.name}"`, log_2.LogCategory.Quest);
    }
    else {
        res.json({ success: 'ok' });
    }
})));
adminQuestsRouter.post('/:id/toggleMode', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let quest = yield quest_1.QuestService.queryByIdOrFail(req.params.id);
    if (quest.modes.includes(req.body.mode)) {
        yield quest_1.QuestService.update(req.params.id, { $pull: { modes: req.body.mode } });
    }
    else {
        yield quest_1.QuestService.update(req.params.id, { $push: { modes: req.body.mode } });
    }
    quest = yield quest_1.QuestService.queryByIdOrFail(req.params.id);
    res.json(quest);
})));
adminQuestsRouter.post('/:id/updateExpiration', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const date = new Date(req.body.expiration);
    if (!(date instanceof Date && !isNaN(date.getTime()))) {
        return res.json({ error: 'Invalid date' });
    }
    yield quest_1.QuestService.updateOrFail(req.params.id, { expiration: date });
    res.json(date);
})));
exports.default = adminQuestsRouter;
