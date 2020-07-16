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
const beatmap_1 = require("../interfaces/beatmap/beatmap");
const quest_1 = require("../interfaces/quest");
const log_1 = require("../interfaces/log");
const discordApi_1 = require("../helpers/discordApi");
const invite_1 = require("../interfaces/invite");
const spentPoints_1 = require("../interfaces/spentPoints");
const points_2 = require("../helpers/points");
const party_1 = require("../models/party");
const quest_2 = require("../models/quest");
const log_2 = require("../models/log");
const user_1 = require("../models/user");
const invite_2 = require("../models/invite");
const beatmap_2 = require("../models/beatmap/beatmap");
const spentPoints_2 = require("../models/spentPoints");
const featuredArtist_1 = require("../models/featuredArtist");
const questsRouter = express_1.default.Router();
questsRouter.use(middlewares_1.isLoggedIn);
const beatmapPopulate = [
    { path: 'tasks', populate: { path: 'mappers' } },
];
const pointsPopulate = [
    { path: 'members', select: user_1.populatePointsVirtuals + ' spentPoints' },
    { path: 'leader', select: 'osuId username' },
];
const cannotFindUserMessage = 'Cannot find user!';
function updatePartyInfo(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const party = yield party_1.PartyModel
            .findById(id)
            .populate({
            path: 'members',
            select: 'rank osuPoints taikoPoints catchPoints maniaPoints',
        })
            .orFail();
        let rank = 0;
        const modes = [];
        party.members.forEach(user => {
            rank += user.rank;
            if (!modes.includes(user.mainMode)) {
                modes.push(user.mainMode);
            }
        });
        party.rank = Math.round(rank / party.members.length);
        party.modes = modes;
        yield party.save();
        return { success: 'ok' };
    });
}
questsRouter.get('/', (req, res) => {
    var _a, _b;
    res.render('quests', {
        title: 'Quests',
        script: 'quests.js',
        isQuests: true,
        loggedInAs: (_a = req.session) === null || _a === void 0 ? void 0 : _a.osuId,
        userMongoId: (_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId,
        pointsInfo: res.locals.userRequest.pointsInfo,
    });
});
questsRouter.get('/relevantInfo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const openQuests = yield quest_2.QuestModel
        .find({
        modes: res.locals.userRequest.mainMode,
        status: quest_1.QuestStatus.Open,
        expiration: { $gt: new Date() },
    })
        .defaultPopulate()
        .sortByLastest();
    res.json({
        openQuests,
        userMongoId: (_a = req.session) === null || _a === void 0 ? void 0 : _a.mongoId,
        group: res.locals.userRequest.group,
        rank: res.locals.userRequest.rank,
        mainMode: res.locals.userRequest.mainMode,
        availablePoints: res.locals.userRequest.availablePoints,
    });
}));
questsRouter.get('/searchOnLoad/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const quest = yield quest_2.QuestModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();
    res.json(quest);
}));
questsRouter.get('/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let quests;
    if (req.query.mode && req.query.mode != 'any') {
        quests = yield quest_2.QuestModel
            .find({
            modes: req.query.mode,
            status: { $ne: quest_1.QuestStatus.Hidden },
        })
            .defaultPopulate()
            .sortByLastest();
    }
    else {
        quests = yield quest_2.QuestModel
            .find({
            status: { $ne: quest_1.QuestStatus.Hidden },
        })
            .defaultPopulate()
            .sortByLastest();
    }
    res.json({ quests });
}));
questsRouter.post('/createParty/:id', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const userId = (_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId;
    const mode = res.locals.userRequest.mainMode;
    const party = new party_1.PartyModel();
    party.leader = userId;
    party.members = userId;
    party.modes = [mode];
    yield party.save();
    yield updatePartyInfo(party._id);
    yield quest_2.QuestModel
        .findByIdAndUpdate(req.params.id, { $push: { parties: party._id } })
        .defaultPopulate();
    const quest = yield quest_2.QuestModel
        .findById(req.params.id)
        .sortByLastest()
        .defaultPopulate()
        .orFail();
    res.json(quest);
    log_2.LogModel.generate((_c = req.session) === null || _c === void 0 ? void 0 : _c.mongoId, `created a party for ${quest.name}`, log_1.LogCategory.Party);
}));
questsRouter.post('/deleteParty/:partyId/:questId', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const p = yield party_1.PartyModel
        .findByIdAndRemove({ _id: req.params.partyId })
        .orFail();
    yield quest_2.QuestModel
        .findByIdAndUpdate(req.params.questId, { $pull: { parties: p._id } })
        .orFail();
    const q = yield quest_2.QuestModel
        .findById(req.params.questId)
        .defaultPopulate()
        .orFail();
    res.json(q);
    log_2.LogModel.generate((_d = req.session) === null || _d === void 0 ? void 0 : _d.mongoId, `deleted a party for ${q.name}`, log_1.LogCategory.Party);
}));
questsRouter.post('/togglePartyLock/:partyId/:questId', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    yield party_1.PartyModel
        .findByIdAndUpdate(req.params.partyId, { lock: !req.body.lock })
        .orFail();
    const q = yield quest_2.QuestModel
        .findById(req.params.questId)
        .defaultPopulate()
        .orFail();
    res.json(q);
    log_2.LogModel.generate((_e = req.session) === null || _e === void 0 ? void 0 : _e.mongoId, `toggled lock on party for ${q.name}`, log_1.LogCategory.Party);
}));
questsRouter.post('/togglePartyMode/:partyId/:questId', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    const p = yield party_1.PartyModel
        .findById(req.params.partyId)
        .orFail();
    if (p.modes.includes(req.body.mode)) {
        yield party_1.PartyModel.findByIdAndUpdate(req.params.partyId, { $pull: { modes: req.body.mode } });
    }
    else {
        yield party_1.PartyModel.findByIdAndUpdate(req.params.partyId, { $push: { modes: req.body.mode } });
    }
    const q = yield quest_2.QuestModel
        .findById(req.params.questId)
        .defaultPopulate()
        .orFail();
    res.json(q);
    log_2.LogModel.generate((_f = req.session) === null || _f === void 0 ? void 0 : _f.mongoId, `toggled "${req.body.mode}" mode on party for ${q.name}`, log_1.LogCategory.Party);
}));
questsRouter.post('/joinParty/:partyId/:questId', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h;
    yield party_1.PartyModel
        .findByIdAndUpdate(req.params.partyId, { $push: { members: (_g = req.session) === null || _g === void 0 ? void 0 : _g.mongoId } })
        .orFail();
    yield updatePartyInfo(req.params.partyId);
    const q = yield quest_2.QuestModel
        .findById(req.params.questId)
        .defaultPopulate()
        .orFail();
    res.json(q);
    log_2.LogModel.generate((_h = req.session) === null || _h === void 0 ? void 0 : _h.mongoId, `joined party for ${q.name}`, log_1.LogCategory.Party);
}));
questsRouter.post('/leaveParty/:partyId/:questId', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _k;
    yield party_1.PartyModel
        .findByIdAndUpdate(req.params.partyId, { $pull: { members: (_j = req.session) === null || _j === void 0 ? void 0 : _j.mongoId } })
        .orFail();
    yield updatePartyInfo(req.params.partyId);
    const q = yield quest_2.QuestModel
        .findById(req.params.questId)
        .defaultPopulate()
        .orFail();
    res.json(q);
    log_2.LogModel.generate((_k = req.session) === null || _k === void 0 ? void 0 : _k.mongoId, `left party for ${q.name}`, log_1.LogCategory.Party);
    if (q.associatedMaps) {
        for (let i = 0; i < q.associatedMaps.length; i++) {
            let valid = true;
            const b = yield beatmap_2.BeatmapModel
                .findById(q.associatedMaps[i]._id)
                .populate(beatmapPopulate)
                .orFail();
            b.tasks.forEach(task => {
                task.mappers.forEach(mapper => {
                    var _a;
                    if (mapper.id == ((_a = req.session) === null || _a === void 0 ? void 0 : _a.mongoId)) {
                        valid = false;
                    }
                });
            });
            if (!valid) {
                yield beatmap_2.BeatmapModel.findByIdAndUpdate(q.associatedMaps[i]._id, { quest: undefined });
            }
        }
    }
}));
questsRouter.post('/inviteToParty/:partyId/:questId', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _l;
    const inviteError = 'Invite not sent: ';
    let regexp;
    if (req.body.username.indexOf('[') >= 0 || req.body.username.indexOf(']') >= 0) {
        regexp = new RegExp('^\\' + req.body.username + '$', 'i');
    }
    else {
        regexp = new RegExp('^' + req.body.username + '$', 'i');
    }
    const u = yield user_1.UserModel
        .findOne({ username: regexp })
        .orFail(new Error(inviteError + cannotFindUserMessage));
    const q = yield quest_2.QuestModel
        .findById(req.params.questId)
        .defaultPopulate()
        .orFail();
    const currentParties = yield party_1.PartyModel.find({ members: u._id });
    const duplicate = q.parties.some(questParty => {
        return currentParties.some(userParty => questParty.id == userParty.id);
    });
    if (duplicate) {
        return res.json({ error: inviteError + 'User is already in a party for this quest!' });
    }
    if (u.availablePoints < q.price) {
        return res.json({ error: inviteError + 'User does not have enough points to accept this quest!' });
    }
    res.json({ success: 'Invite sent!' });
    invite_2.InviteModel.generatePartyInvite(u._id, (_l = req.session) === null || _l === void 0 ? void 0 : _l.mongoId, req.params.partyId, `wants you to join their party`, invite_1.ActionType.Join, req.params.partyId, req.params.questId);
}));
questsRouter.post('/transferPartyLeader/:partyId/:questId', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _m;
    if (!req.body.userId.length) {
        return res.json({ error: cannotFindUserMessage });
    }
    const u = yield user_1.UserModel
        .findById(req.body.userId)
        .orFail(new Error(cannotFindUserMessage));
    yield party_1.PartyModel
        .findByIdAndUpdate(req.params.partyId, { leader: u._id })
        .orFail();
    const q = yield quest_2.QuestModel
        .findById(req.params.questId)
        .defaultPopulate()
        .orFail();
    res.json(q);
    log_2.LogModel.generate((_m = req.session) === null || _m === void 0 ? void 0 : _m.mongoId, `transferred party leader in party for ${q.name}`, log_1.LogCategory.Party);
}));
questsRouter.post('/kickPartyMember/:partyId/:questId', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _o;
    if (!req.body.userId.length) {
        return res.json({ error: cannotFindUserMessage });
    }
    const u = yield user_1.UserModel
        .findById(req.body.userId)
        .orFail(new Error(cannotFindUserMessage));
    yield party_1.PartyModel
        .findByIdAndUpdate(req.params.partyId, { $pull: { members: u._id } })
        .orFail();
    const q = yield quest_2.QuestModel
        .findById(req.params.questId)
        .defaultPopulate()
        .orFail();
    res.json(q);
    log_2.LogModel.generate((_o = req.session) === null || _o === void 0 ? void 0 : _o.mongoId, `kicked member from party for ${q.name}`, log_1.LogCategory.Party);
    if (q.associatedMaps) {
        for (let i = 0; i < q.associatedMaps.length; i++) {
            const b = yield beatmap_2.BeatmapModel
                .findById(q.associatedMaps[i]._id)
                .populate(beatmapPopulate);
            if (b) {
                let valid = true;
                b.tasks.forEach(task => {
                    task.mappers.forEach(mapper => {
                        if (mapper.id == u.id) {
                            valid = false;
                        }
                    });
                });
                if (!valid) {
                    yield beatmap_2.BeatmapModel.findByIdAndUpdate(q.associatedMaps[i]._id, { quest: undefined });
                }
            }
        }
    }
}));
questsRouter.post('/acceptQuest/:partyId/:questId', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _p;
    const p = yield party_1.PartyModel
        .findById(req.params.partyId)
        .populate(pointsPopulate)
        .orFail(new Error(`Party doesn't exist!`));
    if (!p.modes.length) {
        return res.json({ error: 'Your party has no modes selected!' });
    }
    const q = yield quest_2.QuestModel
        .findById(req.params.questId)
        .defaultPopulate()
        .orFail();
    p.members.forEach(member => {
        if (member.availablePoints < q.price) {
            return res.json({ error: 'Someone in your party does not have enough points to accept the quest!' });
        }
    });
    if (p.members.length < q.minParty
        || p.members.length > q.maxParty
        || p.rank < q.minRank
        || q.isExpired) {
        return res.json({ error: 'Something went wrong!' });
    }
    for (let i = 0; i < p.modes.length; i++) {
        const mode = p.modes[i];
        const invalidQuest = yield quest_2.QuestModel
            .findOne({
            name: q.name,
            modes: mode,
            $or: [
                { status: quest_1.QuestStatus.WIP },
                { status: quest_1.QuestStatus.Done },
            ],
        })
            .defaultPopulate();
        if (invalidQuest) {
            return res.json({ error: 'Quest already exists for selected mode(s)!' });
        }
        if (q.isMbc && mode != 'osu') {
            return res.json({ error: 'MBC quests do not support modes other than osu!' });
        }
    }
    let newQuest;
    if (q.modes.length == p.modes.length) {
        q.accepted = new Date();
        q.status = quest_1.QuestStatus.WIP;
        q.deadline = new Date(new Date().getTime() + q.timeframe);
        q.parties = [];
        q.currentParty = p._id;
        yield q.save();
    }
    else {
        for (let i = 0; i < p.modes.length; i++) {
            const mode = p.modes[i];
            yield quest_2.QuestModel.findByIdAndUpdate(q._id, {
                $pull: { modes: mode },
            });
        }
        yield quest_2.QuestModel.findByIdAndUpdate(q._id, {
            $pull: { parties: p._id },
        });
        newQuest = new quest_2.QuestModel();
        newQuest.creator = q.creator;
        newQuest.name = q.name;
        newQuest.price = q.price;
        newQuest.descriptionMain = q.descriptionMain;
        newQuest.timeframe = q.timeframe;
        newQuest.minParty = q.minParty;
        newQuest.maxParty = q.maxParty;
        newQuest.minRank = q.minRank;
        newQuest.art = q.art;
        newQuest.isMbc = q.isMbc;
        newQuest.modes = p.modes;
        newQuest.accepted = new Date();
        newQuest.status = quest_1.QuestStatus.WIP;
        newQuest.deadline = new Date(new Date().getTime() + q.timeframe);
        newQuest.currentParty = p._id;
        newQuest.requiredMapsets = q.requiredMapsets;
        yield newQuest.save();
    }
    p.members.forEach(member => {
        spentPoints_2.SpentPointsModel.generate(spentPoints_1.SpentPointsCategory.AcceptQuest, member._id, q._id);
        points_2.updateUserPoints(member.id);
    });
    const allQuests = yield quest_2.QuestModel
        .find({})
        .defaultPopulate()
        .sortByLastest();
    res.json({ quests: allQuests, availablePoints: res.locals.userRequest.availablePoints - q.price });
    let modeList = '';
    for (let i = 0; i < p.modes.length; i++) {
        modeList += p.modes[i];
        if (i != p.modes.length - 1) {
            modeList += ', ';
        }
    }
    log_2.LogModel.generate((_p = req.session) === null || _p === void 0 ? void 0 : _p.mongoId, `party accepted quest "${q.name}" for mode${p.modes.length > 1 ? 's' : ''} "${modeList}"`, log_1.LogCategory.Quest);
    let memberList = '';
    for (let i = 0; i < p.members.length; i++) {
        const user = p.members[i];
        memberList += `[**${user.username}**](https://osu.ppy.sh/users/${user.osuId})`;
        if (i + 1 < p.members.length) {
            memberList += ', ';
        }
    }
    let url = `https://assets.ppy.sh/artists/${q.art}/cover.jpg`;
    if (q.isMbc) {
        url = 'https://mappersguild.com/images/mbc-icon.png';
    }
    discordApi_1.webhookPost([{
            author: {
                name: `${p.leader.username}'s party`,
                url: `https://osu.ppy.sh/users/${p.leader.osuId}`,
                icon_url: `https://a.ppy.sh/${p.leader.osuId}`,
            },
            description: `Accepted quest: [**${q.name}**](https://mappersguild.com/quests?id=${newQuest ? newQuest.id : q.id}) [**${p.modes.join(', ')}**]`,
            color: discordApi_1.webhookColors.green,
            thumbnail: {
                url,
            },
            fields: [
                {
                    name: 'Party members',
                    value: memberList,
                },
            ],
        }]);
}));
questsRouter.post('/dropQuest/:partyId/:questId', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _q;
    const [p, q] = yield Promise.all([
        party_1.PartyModel
            .findById(req.params.partyId)
            .defaultPopulate()
            .orFail(new Error(`Party doesn't exist!`)),
        quest_2.QuestModel
            .findById(req.params.questId)
            .defaultPopulate()
            .orFail(),
    ]);
    if (!q.currentParty || q.currentParty.id != p.id) {
        return res.json({ error: 'Invalid request!' });
    }
    if (q.associatedMaps) {
        for (let i = 0; i < q.associatedMaps.length; i++) {
            yield beatmap_2.BeatmapModel.findByIdAndUpdate(q.associatedMaps[i]._id, { quest: undefined });
        }
    }
    const openQuest = yield quest_2.QuestModel.findOne({
        name: q.name,
        status: quest_1.QuestStatus.Open,
    });
    if (openQuest) {
        yield Promise.all([
            quest_2.QuestModel.findByIdAndUpdate(openQuest._id, {
                $push: { modes: q.modes },
            }),
            quest_2.QuestModel.findByIdAndUpdate(req.params.questId, { status: quest_1.QuestStatus.Hidden }),
        ]);
    }
    else {
        yield quest_2.QuestModel.findByIdAndUpdate(req.params.questId, {
            status: quest_1.QuestStatus.Open,
            currentParty: undefined,
        });
    }
    const allQuests = yield quest_2.QuestModel
        .find({})
        .defaultPopulate()
        .sortByLastest();
    res.json(allQuests);
    let modeList = '';
    for (let i = 0; i < q.modes.length; i++) {
        modeList += q.modes[i];
        if (i != q.modes.length - 1) {
            modeList += ', ';
        }
    }
    log_2.LogModel.generate((_q = req.session) === null || _q === void 0 ? void 0 : _q.mongoId, `party dropped quest "${q.name}" for mode${q.modes.length > 1 ? 's' : ''} "${modeList}"`, log_1.LogCategory.Quest);
    let memberList = '';
    for (let i = 0; i < p.members.length; i++) {
        const user = p.members[i];
        memberList += `[**${user.username}**](https://osu.ppy.sh/users/${user.osuId})`;
        if (i + 1 < p.members.length) {
            memberList += ', ';
        }
    }
    let url = `https://assets.ppy.sh/artists/${q.art}/cover.jpg`;
    if (q.isMbc) {
        url = 'https://mappersguild.com/images/mbc-icon.png';
    }
    discordApi_1.webhookPost([{
            author: {
                name: `${p.leader.username}'s party`,
                url: `https://osu.ppy.sh/users/${p.leader.osuId}`,
                icon_url: `https://a.ppy.sh/${p.leader.osuId}`,
            },
            color: discordApi_1.webhookColors.red,
            description: `Dropped quest: [**${q.name}**](https://mappersguild.com/quests?id=${openQuest ? openQuest.id : q.id}) [**${p.modes.join(', ')}**]`,
            thumbnail: {
                url,
            },
            fields: [{
                    name: 'Party members',
                    value: memberList,
                }],
        }]);
    party_1.PartyModel.findByIdAndRemove(req.params.partyId);
}));
questsRouter.post('/reopenQuest/:questId', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _r, _s, _t, _u, _v, _w;
    const quest = yield quest_2.QuestModel
        .findById(req.params.questId)
        .defaultPopulate()
        .orFail();
    if (res.locals.userRequest.availablePoints < (quest.price * 0.5 + 25)) {
        return res.json({ error: `You don't have enough points to re-open this quest!` });
    }
    const openQuest = yield quest_2.QuestModel.findOne({
        name: quest.name,
        status: quest_1.QuestStatus.Open,
    });
    const newExpiration = new Date();
    newExpiration.setDate(newExpiration.getDate() + 90);
    if (req.body.status == quest_1.QuestStatus.Open) {
        if (openQuest && !openQuest.isExpired) {
            yield Promise.all([
                quest_2.QuestModel.findByIdAndUpdate(openQuest._id, {
                    $push: { modes: quest.modes },
                    expiration: newExpiration,
                }),
                quest_2.QuestModel.findByIdAndUpdate(req.params.questId, { status: quest_1.QuestStatus.Hidden }),
            ]);
        }
        else {
            yield quest_2.QuestModel.findByIdAndUpdate(req.params.questId, {
                expiration: newExpiration,
            });
        }
    }
    spentPoints_2.SpentPointsModel.generate(spentPoints_1.SpentPointsCategory.ReopenQuest, (_r = req.session) === null || _r === void 0 ? void 0 : _r.mongoId, quest._id);
    points_2.updateUserPoints((_s = req.session) === null || _s === void 0 ? void 0 : _s.mongoId);
    const allQuests = yield quest_2.QuestModel
        .find({})
        .defaultPopulate()
        .sortByLastest();
    res.json({ quests: allQuests, availablePoints: res.locals.userRequest.availablePoints });
    log_2.LogModel.generate((_t = req.session) === null || _t === void 0 ? void 0 : _t.mongoId, `re-opened quest "${quest.name}"`, log_1.LogCategory.Quest);
    let url = `https://assets.ppy.sh/artists/${quest.art}/cover.jpg`;
    if (quest.isMbc) {
        url = 'https://mappersguild.com/images/mbc-icon.png';
    }
    discordApi_1.webhookPost([{
            author: {
                name: (_u = req.session) === null || _u === void 0 ? void 0 : _u.username,
                url: `https://osu.ppy.sh/users/${(_v = req.session) === null || _v === void 0 ? void 0 : _v.osuId}`,
                icon_url: `https://a.ppy.sh/${(_w = req.session) === null || _w === void 0 ? void 0 : _w.osuId}`,
            },
            color: discordApi_1.webhookColors.white,
            description: `Quest re-opened: [**${quest.name}**](https://mappersguild.com/quests?id=${quest.id})`,
            thumbnail: {
                url,
            },
            fields: [{
                    name: 'Objective',
                    value: `${quest.descriptionMain}`,
                }],
        }]);
}));
questsRouter.post('/extendDeadline/:partyId/:questId', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _x, _y;
    const [party, quest] = yield Promise.all([
        party_1.PartyModel
            .findById(req.params.partyId)
            .populate(pointsPopulate)
            .orFail(new Error(`Party doesn't exist!`)),
        quest_2.QuestModel
            .findById(req.params.questId)
            .defaultPopulate()
            .orFail(),
    ]);
    const notEnoughPoints = party.members.some(m => m.availablePoints < 10);
    if (notEnoughPoints) {
        return res.json({ error: 'One or more of your party members do not have enough points to extend the deadline!' });
    }
    party.members.forEach(member => {
        spentPoints_2.SpentPointsModel.generate(spentPoints_1.SpentPointsCategory.ExtendDeadline, member.id, quest.id);
        points_2.updateUserPoints(member.id);
    });
    const deadline = new Date(quest.deadline);
    deadline.setDate(deadline.getDate() + 30);
    quest.deadline = deadline;
    yield quest.save();
    const updatedQuest = yield quest_2.QuestModel
        .findById(req.params.questId)
        .defaultPopulate()
        .orFail();
    const user = yield user_1.UserModel.findById((_x = req.session) === null || _x === void 0 ? void 0 : _x.mongoId).orFail();
    res.json({
        quest: updatedQuest,
        availablePoints: user.availablePoints,
    });
    log_2.LogModel.generate((_y = req.session) === null || _y === void 0 ? void 0 : _y.mongoId, `extended deadline for ${updatedQuest.name}`, log_1.LogCategory.Party);
}));
questsRouter.post('/submitQuest', middlewares_1.isNotSpectator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _z, _0, _1, _2, _3;
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
    quest.creator = (_z = req.session) === null || _z === void 0 ? void 0 : _z.mongoId;
    const points = points_1.findCreateQuestPointsSpent(quest.art, quest.requiredMapsets);
    const user = yield user_1.UserModel
        .findById((_0 = req === null || req === void 0 ? void 0 : req.session) === null || _0 === void 0 ? void 0 : _0.mongoId)
        .orFail(new Error(cannotFindUserMessage));
    if (user.availablePoints < points) {
        return res.json({ error: 'Not enough points to perform this action!' });
    }
    yield quest.save();
    res.json(true);
    spentPoints_2.SpentPointsModel.generate(spentPoints_1.SpentPointsCategory.CreateQuest, (_1 = req.session) === null || _1 === void 0 ? void 0 : _1.mongoId, quest._id);
    points_2.updateUserPoints((_2 = req.session) === null || _2 === void 0 ? void 0 : _2.mongoId);
    log_2.LogModel.generate((_3 = req.session) === null || _3 === void 0 ? void 0 : _3.mongoId, `submitted quest for approval`, log_1.LogCategory.Quest);
}));
exports.default = questsRouter;
