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
const beatmap_1 = require("../interfaces/beatmap/beatmap");
const log_1 = require("../interfaces/log");
const invite_1 = require("../interfaces/invite");
const party_1 = require("../models/party");
const quest_1 = require("../models/quest");
const log_2 = require("../models/log");
const user_1 = require("../models/user");
const invite_2 = require("../models/invite");
const beatmap_2 = require("../models/beatmap/beatmap");
const quest_2 = require("../interfaces/quest");
const cannotFindUserMessage = 'Cannot find user!';
function hasRankedBeatmaps(questId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const beatmaps = yield beatmap_2.BeatmapModel
            .find({
            quest: questId,
            status: beatmap_1.BeatmapStatus.Ranked,
        })
            .defaultPopulate();
        return beatmaps.some(b => b.participated(userId));
    });
}
function isPartyLeader(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.params.id)
            return res.json({ error: 'Invalid' });
        const party = yield party_1.PartyModel.defaultFindByIdOrFail(req.params.id);
        if (party.leader.id != res.locals.userRequest.id && res.locals.userRequest.osuId !== 3178418) {
            return res.json({ error: 'Unauthorized' });
        }
        res.locals.party = party;
        next();
    });
}
const partiesRouter = express_1.default.Router();
partiesRouter.use(middlewares_1.isLoggedIn);
partiesRouter.use(middlewares_1.isNotSpectator);
partiesRouter.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const questId = req.body.questId;
    let quest = yield quest_1.QuestModel.defaultFindByIdOrFail(questId);
    const user = res.locals.userRequest;
    const party = new party_1.PartyModel();
    party.leader = user;
    party.members = [user];
    party.modes = [user.mainMode];
    party.quest = quest;
    party.setPartyRank();
    yield party.save();
    quest = yield quest_1.QuestModel.defaultFindByIdOrFail(questId);
    res.json(quest);
    log_2.LogModel.generate((_a = req.session) === null || _a === void 0 ? void 0 : _a.mongoId, `created a party for ${quest.name}`, log_1.LogCategory.Party);
}));
partiesRouter.post('/:id/join', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const party = yield party_1.PartyModel.defaultFindByIdOrFail(req.params.id);
    if (party.quest.status !== quest_2.QuestStatus.Open) {
        return res.json({ error: 'Can only join open quests directly' });
    }
    const user = res.locals.userRequest;
    yield party.addUser(user);
    res.json(party);
    log_2.LogModel.generate((_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId, `joined party for ${party.quest.name}`, log_1.LogCategory.Party);
}));
partiesRouter.post('/:id/leave', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const partyId = req.params.id;
    const userId = req.session.mongoId;
    const party = yield party_1.PartyModel.defaultFindByIdOrFail(partyId);
    const hasRanked = yield hasRankedBeatmaps(party.quest.id, userId);
    if (hasRanked)
        return res.json({ error: 'Cannot leave party when you have ranked maps for it!' });
    yield party.removeUser(userId);
    res.json(party);
    log_2.LogModel.generate(userId, `left party for ${party.quest.name}`, log_1.LogCategory.Party);
    yield party.quest.dissociateBeatmaps(userId);
}));
partiesRouter.post('/:id/delete', isPartyLeader, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const party = res.locals.party;
    if (party.quest.status !== quest_2.QuestStatus.Open) {
        throw new Error(`Cannot delete a party with a WIP quest`);
    }
    yield party.remove();
    const quest = yield quest_1.QuestModel.defaultFindByIdOrFail(party.quest._id);
    res.json(quest);
    log_2.LogModel.generate((_c = req.session) === null || _c === void 0 ? void 0 : _c.mongoId, `deleted a party for ${quest.name}`, log_1.LogCategory.Party);
}));
partiesRouter.post('/:id/toggleLock', isPartyLeader, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const party = res.locals.party;
    party.lock = !party.lock;
    yield party.save();
    res.json(party);
    log_2.LogModel.generate((_d = req.session) === null || _d === void 0 ? void 0 : _d.mongoId, `toggled lock on party for ${party.quest.name}`, log_1.LogCategory.Party);
}));
partiesRouter.post('/:id/toggleMode', isPartyLeader, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const mode = req.body.mode;
    const party = res.locals.party;
    const i = party.modes.findIndex(m => m === mode);
    if (i !== -1) {
        party.modes.splice(i, 1);
    }
    else {
        party.modes.push(mode);
    }
    yield party.save();
    res.json(party);
    log_2.LogModel.generate((_e = req.session) === null || _e === void 0 ? void 0 : _e.mongoId, `toggled "${mode}" mode on party for ${party.quest.name}`, log_1.LogCategory.Party);
}));
partiesRouter.post('/:id/invite', isPartyLeader, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    const inviteError = 'Invite not sent: ';
    const party = res.locals.party;
    const [user, quest] = yield Promise.all([
        user_1.UserModel
            .findOne()
            .byUsernameOrOsuId(req.body.username)
            .orFail(new Error(inviteError + cannotFindUserMessage)),
        quest_1.QuestModel
            .findById(party.quest.id)
            .defaultPopulate()
            .orFail(),
    ]);
    if (quest.parties.some(p => p.members.some(m => m.id == user.id))) {
        return res.json({ error: inviteError + 'User is already in a party for this quest!' });
    }
    if (user.availablePoints < quest.price) {
        return res.json({ error: inviteError + 'User does not have enough points to accept this quest!' });
    }
    invite_2.InviteModel.generatePartyInvite(user._id, (_f = req.session) === null || _f === void 0 ? void 0 : _f.mongoId, party._id, `wants you to join their party`, invite_1.ActionType.Join, party._id, party.quest._id);
    res.json({ success: 'Invite sent!' });
}));
partiesRouter.post('/:id/transferLeadership', isPartyLeader, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    const party = res.locals.party;
    const user = yield user_1.UserModel
        .findById(req.body.userId)
        .orFail(new Error(cannotFindUserMessage));
    party.leader = user;
    yield party.save();
    res.json(party);
    log_2.LogModel.generate((_g = req.session) === null || _g === void 0 ? void 0 : _g.mongoId, `transferred party leader in party for ${party.quest.name}`, log_1.LogCategory.Party);
}));
partiesRouter.post('/:id/kick', isPartyLeader, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    const party = res.locals.party;
    const user = yield user_1.UserModel
        .findById(req.body.userId)
        .orFail(new Error(cannotFindUserMessage));
    const hasRanked = yield hasRankedBeatmaps(party.quest.id, user.id);
    if (hasRanked)
        return res.json({ error: 'Cannot kick user when they have ranked maps for it!' });
    yield Promise.all([
        party.quest.dissociateBeatmaps(user.id),
        party.removeUser(user.id),
    ]);
    res.json(party);
    log_2.LogModel.generate((_h = req.session) === null || _h === void 0 ? void 0 : _h.mongoId, `kicked member from party for ${party.quest.name}`, log_1.LogCategory.Party);
}));
exports.default = partiesRouter;
