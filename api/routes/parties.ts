import express from 'express';
import { isLoggedIn, isValidUser } from '../helpers/middlewares';
import { BeatmapStatus } from '../../interfaces/beatmap/beatmap';
import { User, UserGroup } from '../../interfaces/user';
import { LogCategory } from '../../interfaces/log';
import { PartyModel } from '../models/party';
import { QuestModel } from '../models/quest';
import { LogModel } from '../models/log';
import { UserModel } from '../models/user';
import { BeatmapModel } from '../models/beatmap/beatmap';
import { QuestStatus } from '../../interfaces/quest';
import { Party } from '../../interfaces/party';

const cannotFindUserMessage = 'Cannot find user!';

async function hasRankedBeatmaps(questId: any, userId: any): Promise<boolean> {
    const beatmaps = await BeatmapModel // find ranked associatedMaps
        .find({
            quest: questId,
            status: BeatmapStatus.Ranked,
        })
        .defaultPopulate();

    // disallow kick for users with ranked associatedMaps
    return beatmaps.some(b => b.participated(userId));
}

async function isPartyLeader (req, res, next): Promise<void> {
    if (!req.params.id) return res.json({ error: 'Invalid' });

    const party = await PartyModel.defaultFindByIdOrFail(req.params.id);

    // pishi is lord of all parties
    if (party.leader.id != res.locals.userRequest.id && res.locals.userRequest.osuId !== 3178418) {
        return res.json({ error: 'Unauthorized' });
    }

    res.locals.party = party;
    next();
}

const partiesRouter = express.Router();

partiesRouter.use(isLoggedIn);

/* POST create party */
partiesRouter.post('/create', async (req, res) => {
    const questId = req.body.questId;
    let quest = await QuestModel.defaultFindByIdOrFail(questId);

    const user: User = res.locals.userRequest;
    const party = new PartyModel();
    party.leader = user;
    party.members = [user];
    party.modes = [user.mainMode];
    party.quest = quest;
    party.setPartyRank();
    await party.save();

    quest = await QuestModel.defaultFindByIdOrFail(questId);

    res.json(quest);

    LogModel.generate(req.session?.mongoId, `created a party for ${quest.name}`, LogCategory.Party);
});

/* POST add user to party */
partiesRouter.post('/:id/add', isValidUser, async (req, res) => {
    const party = await PartyModel.defaultFindByIdOrFail(req.params.id);
    const isNotSelf: boolean = req.body.user && req.body.user.length;
    const isLeader: boolean = party.leader.id == res.locals.userRequest.id || res.locals.userRequest.osuId == 3178418;
    const user: User = isNotSelf ? res.locals.user : res.locals.userRequest;

    await party.addUser(user, isNotSelf, isLeader);

    res.json(party);

    LogModel.generate(user.id, `joined party for ${party.quest.name}`, LogCategory.Party);
});

/* POST leave party */
partiesRouter.post('/:id/leave', async (req, res) => {
    const partyId: Party['_id'] = req.params.id;
    const userId = req.session.mongoId;

    const party = await PartyModel.defaultFindByIdOrFail(partyId);

    const hasRanked = await hasRankedBeatmaps(party.quest.id, userId);
    if (hasRanked) return res.json({ error: 'Cannot leave party when you have ranked maps for it!' });

    await party.removeUser(userId);

    res.json(party);

    LogModel.generate(userId, `left party for ${party.quest.name}`, LogCategory.Party);

    await party.quest.dissociateBeatmaps(userId);
});

/* POST remove user from pending members */
partiesRouter.post('/:id/removeFromPendingMembers', isPartyLeader, async (req, res) => {
    const party = await PartyModel
        .findByIdAndUpdate(req.params.id, { $pull: { pendingMembers: req.body.userId } })
        .defaultPopulate()
        .orFail();

    res.json(party);

    LogModel.generate(req.session?.mongoId, `removed from pending members of party`, LogCategory.Party);
});

/* POST delete party */
partiesRouter.post('/:id/delete', isPartyLeader, async (req, res) => {
    const party: Party = res.locals.party;

    if (party.quest.status !== QuestStatus.Open) {
        throw new Error(`Cannot delete a party with a WIP quest`);
    }

    await party.remove();

    const quest = await QuestModel.defaultFindByIdOrFail(party.quest._id);

    res.json(quest);

    LogModel.generate(req.session?.mongoId, `deleted a party for ${quest.name}`, LogCategory.Party);
});

/* POST toggle party lock */
partiesRouter.post('/:id/toggleLock', isPartyLeader, async (req, res) => {
    const party: Party = res.locals.party;
    party.lock = !party.lock;
    await party.save();

    res.json(party);

    LogModel.generate(req.session?.mongoId, `toggled lock on party for ${party.quest.name}`, LogCategory.Party);
});

/* POST toggle party mode */
partiesRouter.post('/:id/toggleMode', isPartyLeader, async (req, res) => {
    const mode: string = req.body.mode;
    const party: Party = res.locals.party;
    const i = party.modes.findIndex(m => m === mode);

    if (i !== -1) {
        party.modes.splice(i, 1);
    } else {
        party.modes.push(mode);
    }

    await party.save();

    res.json(party);

    LogModel.generate(req.session?.mongoId, `toggled "${mode}" mode on party for ${party.quest.name}`, LogCategory.Party);
});

/* POST transfer party leader */
partiesRouter.post('/:id/transferLeadership', isPartyLeader, async (req, res) => {
    const party: Party = res.locals.party;

    const user = await UserModel
        .findById(req.body.userId)
        .orFail(new Error(cannotFindUserMessage));

    party.leader = user;
    await party.save();

    res.json(party);

    LogModel.generate(req.session?.mongoId, `transferred party leader in party for ${party.quest.name}`, LogCategory.Party);
});

/* POST kick party member */
partiesRouter.post('/:id/kick', isPartyLeader, async (req, res) => {
    const party: Party = res.locals.party;
    const user = await UserModel
        .findById(req.body.userId)
        .orFail(new Error(cannotFindUserMessage));

    const hasRanked = await hasRankedBeatmaps(party.quest.id, user.id);
    if (hasRanked) return res.json({ error: 'Cannot kick user when they have ranked maps for it!' });

    await Promise.all([
        party.quest.dissociateBeatmaps(user.id),
        party.removeUser(user.id),
    ]);

    res.json(party);

    LogModel.generate(req.session?.mongoId, `kicked member from party for ${party.quest.name}`, LogCategory.Party);
});


export default partiesRouter;
