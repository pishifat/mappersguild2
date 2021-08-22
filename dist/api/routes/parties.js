"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../helpers/middlewares");
const beatmap_1 = require("../../interfaces/beatmap/beatmap");
const user_1 = require("../../interfaces/user");
const log_1 = require("../../interfaces/log");
const invite_1 = require("../../interfaces/invite");
const party_1 = require("../models/party");
const quest_1 = require("../models/quest");
const log_2 = require("../models/log");
const user_2 = require("../models/user");
const invite_2 = require("../models/invite");
const beatmap_2 = require("../models/beatmap/beatmap");
const quest_2 = require("../../interfaces/quest");
const cannotFindUserMessage = 'Cannot find user!';
async function hasRankedBeatmaps(questId, userId) {
    const beatmaps = await beatmap_2.BeatmapModel // find ranked associatedMaps
        .find({
        quest: questId,
        status: beatmap_1.BeatmapStatus.Ranked,
    })
        .defaultPopulate();
    // disallow kick for users with ranked associatedMaps
    return beatmaps.some(b => b.participated(userId));
}
async function isPartyLeader(req, res, next) {
    if (!req.params.id)
        return res.json({ error: 'Invalid' });
    const party = await party_1.PartyModel.defaultFindByIdOrFail(req.params.id);
    // pishi is lord of all parties
    if (party.leader.id != res.locals.userRequest.id && res.locals.userRequest.osuId !== 3178418) {
        return res.json({ error: 'Unauthorized' });
    }
    res.locals.party = party;
    next();
}
const partiesRouter = express_1.default.Router();
partiesRouter.use(middlewares_1.isLoggedIn);
/* POST create party */
partiesRouter.post('/create', middlewares_1.isNotSpectator, async (req, res) => {
    const questId = req.body.questId;
    let quest = await quest_1.QuestModel.defaultFindByIdOrFail(questId);
    const user = res.locals.userRequest;
    const party = new party_1.PartyModel();
    party.leader = user;
    party.members = [user];
    party.modes = [user.mainMode];
    party.quest = quest;
    party.setPartyRank();
    await party.save();
    quest = await quest_1.QuestModel.defaultFindByIdOrFail(questId);
    res.json(quest);
    log_2.LogModel.generate(req.session?.mongoId, `created a party for ${quest.name}`, log_1.LogCategory.Party);
});
/* POST join party */
partiesRouter.post('/:id/join', middlewares_1.isNotSpectator, async (req, res) => {
    const party = await party_1.PartyModel.defaultFindByIdOrFail(req.params.id);
    if (party.quest.status !== quest_2.QuestStatus.Open) {
        return res.json({ error: 'Can only join open quests directly' });
    }
    const user = res.locals.userRequest;
    await party.addUser(user);
    res.json(party);
    log_2.LogModel.generate(req.session?.mongoId, `joined party for ${party.quest.name}`, log_1.LogCategory.Party);
});
/* POST leave party */
partiesRouter.post('/:id/leave', async (req, res) => {
    const partyId = req.params.id;
    const userId = req.session.mongoId;
    const party = await party_1.PartyModel.defaultFindByIdOrFail(partyId);
    const hasRanked = await hasRankedBeatmaps(party.quest.id, userId);
    if (hasRanked)
        return res.json({ error: 'Cannot leave party when you have ranked maps for it!' });
    await party.removeUser(userId);
    res.json(party);
    log_2.LogModel.generate(userId, `left party for ${party.quest.name}`, log_1.LogCategory.Party);
    await party.quest.dissociateBeatmaps(userId);
});
/* POST delete party */
partiesRouter.post('/:id/delete', isPartyLeader, async (req, res) => {
    const party = res.locals.party;
    if (party.quest.status !== quest_2.QuestStatus.Open) {
        throw new Error(`Cannot delete a party with a WIP quest`);
    }
    await party.remove();
    const quest = await quest_1.QuestModel.defaultFindByIdOrFail(party.quest._id);
    res.json(quest);
    log_2.LogModel.generate(req.session?.mongoId, `deleted a party for ${quest.name}`, log_1.LogCategory.Party);
});
/* POST toggle party lock */
partiesRouter.post('/:id/toggleLock', isPartyLeader, async (req, res) => {
    const party = res.locals.party;
    party.lock = !party.lock;
    await party.save();
    res.json(party);
    log_2.LogModel.generate(req.session?.mongoId, `toggled lock on party for ${party.quest.name}`, log_1.LogCategory.Party);
});
/* POST toggle party mode */
partiesRouter.post('/:id/toggleMode', isPartyLeader, async (req, res) => {
    const mode = req.body.mode;
    const party = res.locals.party;
    const i = party.modes.findIndex(m => m === mode);
    if (i !== -1) {
        party.modes.splice(i, 1);
    }
    else {
        party.modes.push(mode);
    }
    await party.save();
    res.json(party);
    log_2.LogModel.generate(req.session?.mongoId, `toggled "${mode}" mode on party for ${party.quest.name}`, log_1.LogCategory.Party);
});
/* POST invite to party */
partiesRouter.post('/:id/invite', isPartyLeader, async (req, res) => {
    const inviteError = 'Invite not sent: ';
    const party = res.locals.party;
    const [user, quest] = await Promise.all([
        user_2.UserModel
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
    invite_2.InviteModel.generatePartyInvite(user._id, req.session?.mongoId, party._id, `wants you to join their party`, invite_1.ActionType.Join, party._id, party.quest._id);
    res.json({ success: 'Invite sent!' });
});
/* POST transfer party leader */
partiesRouter.post('/:id/transferLeadership', isPartyLeader, async (req, res) => {
    const party = res.locals.party;
    const user = await user_2.UserModel
        .findById(req.body.userId)
        .orFail(new Error(cannotFindUserMessage));
    if (user.group == user_1.UserGroup.Spectator) {
        return res.json({ error: 'Only members with 3+ ranked maps can lead a party!' });
    }
    party.leader = user;
    await party.save();
    res.json(party);
    log_2.LogModel.generate(req.session?.mongoId, `transferred party leader in party for ${party.quest.name}`, log_1.LogCategory.Party);
});
/* POST kick party member */
partiesRouter.post('/:id/kick', isPartyLeader, async (req, res) => {
    const party = res.locals.party;
    const user = await user_2.UserModel
        .findById(req.body.userId)
        .orFail(new Error(cannotFindUserMessage));
    const hasRanked = await hasRankedBeatmaps(party.quest.id, user.id);
    if (hasRanked)
        return res.json({ error: 'Cannot kick user when they have ranked maps for it!' });
    await Promise.all([
        party.quest.dissociateBeatmaps(user.id),
        party.removeUser(user.id),
    ]);
    res.json(party);
    log_2.LogModel.generate(req.session?.mongoId, `kicked member from party for ${party.quest.name}`, log_1.LogCategory.Party);
});
exports.default = partiesRouter;
