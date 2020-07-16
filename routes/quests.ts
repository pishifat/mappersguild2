import express from 'express';
import { isLoggedIn, isNotSpectator } from '../helpers/middlewares';
import { findCreateQuestPointsSpent } from '../helpers/points';
import { BasicError, BasicResponse } from '../helpers/helpers';
import { BeatmapMode } from '../interfaces/beatmap/beatmap';
import { QuestStatus } from '../interfaces/quest';
import { LogCategory } from '../interfaces/log';
import { webhookPost, webhookColors } from '../helpers/discordApi';
import { ActionType } from '../interfaces/invite';
import { SpentPointsCategory } from '../interfaces/spentPoints';
import { updateUserPoints } from '../helpers/points';
import { Party, PartyModel } from '../models/party';
import { QuestModel, Quest } from '../models/quest';
import { LogModel } from '../models/log';
import { UserModel, populatePointsVirtuals } from '../models/user';
import { InviteModel } from '../models/invite';
import { BeatmapModel } from '../models/beatmap/beatmap';
import { SpentPointsModel } from '../models/spentPoints';
import { FeaturedArtistModel } from '../models/featuredArtist';

const questsRouter = express.Router();

questsRouter.use(isLoggedIn);

// default populations
const beatmapPopulate = [
    { path: 'tasks', populate: { path: 'mappers' } },
];

const pointsPopulate = [
    { path: 'members', select: populatePointsVirtuals + ' spentPoints' },
    { path: 'leader', select: 'osuId username' },
];

const cannotFindUserMessage = 'Cannot find user!';

//updating party rank and modes when leaving/kicking/joining
async function updatePartyInfo(id: Party['_id']): Promise<BasicResponse> {
    const party = await PartyModel
        .findById(id)
        .populate({
            path: 'members',
            select: 'rank osuPoints taikoPoints catchPoints maniaPoints',
        })
        .orFail();

    let rank = 0;
    const modes: Omit<BeatmapMode, BeatmapMode.Hybrid>[] = [];

    party.members.forEach(user => {
        rank += user.rank;

        if (!modes.includes(user.mainMode)) {
            modes.push(user.mainMode);
        }
    });

    party.rank = Math.round(rank / party.members.length);
    party.modes = modes;
    await party.save();

    return { success: 'ok' };
}

/* GET quests page */
questsRouter.get('/', (req, res) => {
    res.render('quests', {
        title: 'Quests',
        script: 'quests.js',
        isQuests: true,
        loggedInAs: req.session?.osuId,
        userMongoId: req.session?.mongoId,
        pointsInfo: res.locals.userRequest.pointsInfo,
    });
});

/* GET relevant quest info */
questsRouter.get('/relevantInfo', async (req, res) => {
    const openQuests = await QuestModel
        .find({
            modes: res.locals.userRequest.mainMode,
            status: QuestStatus.Open,
            expiration: { $gt: new Date() },
        })
        .defaultPopulate()
        .sortByLastest();

    res.json({
        openQuests,
        userMongoId: req.session?.mongoId,
        group: res.locals.userRequest.group,
        rank: res.locals.userRequest.rank,
        mainMode: res.locals.userRequest.mainMode,
        availablePoints: res.locals.userRequest.availablePoints,
    });
});


/* GET map load from URL */
questsRouter.get('/searchOnLoad/:id', async (req, res) => {
    const quest = await QuestModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();

    res.json(quest);
});

/* GET relevant quest info */
questsRouter.get('/search', async (req, res) => {
    let quests: BasicError | Quest[];

    if (req.query.mode && req.query.mode != 'any') {
        quests = await QuestModel
            .find({
                modes: req.query.mode as any,
                status: { $ne: QuestStatus.Hidden },
            })
            .defaultPopulate()
            .sortByLastest();
    } else {
        quests = await QuestModel
            .find({
                status: { $ne: QuestStatus.Hidden },
            })
            .defaultPopulate()
            .sortByLastest();
    }

    res.json({ quests });
});

/* POST create party */
questsRouter.post('/createParty/:id', isNotSpectator, async (req, res) => {
    const userId = req.session?.mongoId;
    const mode = res.locals.userRequest.mainMode;

    const party = new PartyModel();
    party.leader = userId;
    party.members = userId;
    party.modes = [mode];
    await party.save();

    await updatePartyInfo(party._id);
    await QuestModel
        .findByIdAndUpdate(req.params.id, { $push: { parties: party._id } })
        .defaultPopulate();

    const quest = await QuestModel
        .findById(req.params.id)
        .sortByLastest()
        .defaultPopulate()
        .orFail();
    res.json(quest);

    LogModel.generate(req.session?.mongoId, `created a party for ${quest.name}`, LogCategory.Party);
});

/* POST delete party */
questsRouter.post('/deleteParty/:partyId/:questId', isNotSpectator, async (req, res) => {
    const p = await PartyModel
        .findByIdAndRemove({ _id: req.params.partyId })
        .orFail();

    await QuestModel
        .findByIdAndUpdate(req.params.questId, { $pull: { parties: p._id } })
        .orFail();

    const q = await QuestModel
        .findById(req.params.questId)
        .defaultPopulate()
        .orFail();

    res.json(q);

    LogModel.generate(req.session?.mongoId, `deleted a party for ${q.name}`, LogCategory.Party);
});

/* POST toggle party lock */
questsRouter.post('/togglePartyLock/:partyId/:questId', isNotSpectator, async (req, res) => {
    await PartyModel
        .findByIdAndUpdate(req.params.partyId, { lock: !req.body.lock })
        .orFail();

    const q = await QuestModel
        .findById(req.params.questId)
        .defaultPopulate()
        .orFail();

    res.json(q);

    LogModel.generate(req.session?.mongoId, `toggled lock on party for ${q.name}`, LogCategory.Party);
});

/* POST toggle party mode */
questsRouter.post('/togglePartyMode/:partyId/:questId', isNotSpectator, async (req, res) => {
    const p = await PartyModel
        .findById(req.params.partyId)
        .orFail();

    if (p.modes.includes(req.body.mode)) {
        await PartyModel.findByIdAndUpdate(req.params.partyId, { $pull: { modes: req.body.mode } });
    } else {
        await PartyModel.findByIdAndUpdate(req.params.partyId, { $push: { modes: req.body.mode } });
    }

    const q = await QuestModel
        .findById(req.params.questId)
        .defaultPopulate()
        .orFail();

    res.json(q);

    LogModel.generate(req.session?.mongoId, `toggled "${req.body.mode}" mode on party for ${q.name}`, LogCategory.Party);
});

/* POST join party */
questsRouter.post('/joinParty/:partyId/:questId', isNotSpectator, async (req, res) => {
    await PartyModel
        .findByIdAndUpdate(req.params.partyId, { $push: { members: req.session?.mongoId } })
        .orFail();

    await updatePartyInfo(req.params.partyId);

    const q = await QuestModel
        .findById(req.params.questId)
        .defaultPopulate()
        .orFail();

    res.json(q);

    LogModel.generate(req.session?.mongoId, `joined party for ${q.name}`, LogCategory.Party);
});

/* POST leave party */
questsRouter.post('/leaveParty/:partyId/:questId', isNotSpectator, async (req, res) => {
    await PartyModel
        .findByIdAndUpdate(req.params.partyId, { $pull: { members: req.session?.mongoId } })
        .orFail();

    await updatePartyInfo(req.params.partyId);

    const q = await QuestModel
        .findById(req.params.questId)
        .defaultPopulate()
        .orFail();

    res.json(q);

    LogModel.generate(req.session?.mongoId, `left party for ${q.name}`, LogCategory.Party);

    if (q.associatedMaps) {
        for (let i = 0; i < q.associatedMaps.length; i++) {
            let valid = true;
            const b = await BeatmapModel
                .findById(q.associatedMaps[i]._id)
                .populate(beatmapPopulate)
                .orFail();

            b.tasks.forEach(task => {
                task.mappers.forEach(mapper => {
                    if (mapper.id == req.session?.mongoId) {
                        valid = false;
                    }
                });
            });

            if (!valid) {
                await BeatmapModel.findByIdAndUpdate(q.associatedMaps[i]._id, { quest: undefined });
            }
        }
    }
});

/* POST invite to party */
questsRouter.post('/inviteToParty/:partyId/:questId', isNotSpectator, async (req, res) => {
    const inviteError = 'Invite not sent: ';
    let regexp;

    if (req.body.username.indexOf('[') >= 0 || req.body.username.indexOf(']') >= 0) {
        regexp = new RegExp('^\\' + req.body.username + '$', 'i');
    } else {
        regexp = new RegExp('^' + req.body.username + '$', 'i');
    }

    const u = await UserModel
        .findOne({ username: regexp })
        .orFail(new Error(inviteError + cannotFindUserMessage));

    const q = await QuestModel
        .findById(req.params.questId)
        .defaultPopulate()
        .orFail();

    const currentParties = await PartyModel.find({ members: u._id });

    const duplicate = q.parties.some(questParty => {
        return currentParties.some(userParty => questParty.id == userParty.id);
    });

    if (duplicate) {
        return res.json({ error: inviteError + 'User is already in a party for this quest!' });
    }

    if (u.availablePoints < q.price) {
        return res.json( { error: inviteError + 'User does not have enough points to accept this quest!' });
    }

    res.json({ success: 'Invite sent!' });

    InviteModel.generatePartyInvite(
        u._id,
        req.session?.mongoId,
        req.params.partyId,
        `wants you to join their party`,
        ActionType.Join,
        req.params.partyId as any,
        req.params.questId as any
    );
});

/* POST transfer party leader */
questsRouter.post('/transferPartyLeader/:partyId/:questId', isNotSpectator, async (req, res) => {
    if (!req.body.userId.length) {
        return res.json({ error: cannotFindUserMessage });
    }

    const u = await UserModel
        .findById(req.body.userId)
        .orFail(new Error(cannotFindUserMessage));


    await PartyModel
        .findByIdAndUpdate(req.params.partyId, { leader: u._id })
        .orFail();

    const q = await QuestModel
        .findById(req.params.questId)
        .defaultPopulate()
        .orFail();

    res.json(q);

    LogModel.generate(req.session?.mongoId, `transferred party leader in party for ${q.name}`, LogCategory.Party);
});

/* POST kick party member */
questsRouter.post('/kickPartyMember/:partyId/:questId', isNotSpectator, async (req, res) => {
    if (!req.body.userId.length) {
        return res.json({ error: cannotFindUserMessage });
    }

    const u = await UserModel
        .findById(req.body.userId)
        .orFail(new Error(cannotFindUserMessage));

    await PartyModel
        .findByIdAndUpdate(req.params.partyId, { $pull: { members: u._id } })
        .orFail();

    const q = await QuestModel
        .findById(req.params.questId)
        .defaultPopulate()
        .orFail();

    res.json(q);

    LogModel.generate(req.session?.mongoId, `kicked member from party for ${q.name}`, LogCategory.Party);

    if (q.associatedMaps) {
        for (let i = 0; i < q.associatedMaps.length; i++) {
            const b = await BeatmapModel
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
                    await BeatmapModel.findByIdAndUpdate(q.associatedMaps[i]._id, { quest: undefined });
                }
            }
        }
    }
});

/* POST accepts quest. */
questsRouter.post('/acceptQuest/:partyId/:questId', isNotSpectator, async (req, res) => {
    const p = await PartyModel
        .findById(req.params.partyId)
        .populate(pointsPopulate)
        .orFail(new Error(`Party doesn't exist!`));

    if (!p.modes.length) {
        return res.json({ error: 'Your party has no modes selected!' });
    }

    const q = await QuestModel
        .findById(req.params.questId)
        .defaultPopulate()
        .orFail();

    // check if all party members can afford quest
    p.members.forEach(member => {
        if (member.availablePoints < q.price) {
            return res.json({ error: 'Someone in your party does not have enough points to accept the quest!' });
        }
    });

    // check if quest is valid to accept
    if (p.members.length < q.minParty
        || p.members.length > q.maxParty
        || p.rank < q.minRank
        || q.isExpired
    ) {
        return res.json({ error: 'Something went wrong!' });
    }


    for (let i = 0; i < p.modes.length; i++) {
        const mode = p.modes[i];

        // check if quest exists for selected modes
        const invalidQuest = await QuestModel
            .findOne({
                name: q.name,
                modes: mode,
                $or: [
                    { status: QuestStatus.WIP },
                    { status: QuestStatus.Done },
                ],
            })
            .defaultPopulate();

        if (invalidQuest) {
            return res.json({ error: 'Quest already exists for selected mode(s)!' });
        }

        // check if MBC quest with non-osu! modes selected
        if (q.isMbc && mode != 'osu') {
            return res.json({ error: 'MBC quests do not support modes other than osu!' });
        }
    }

    let newQuest;

    // process quest changes
    if (q.modes.length == p.modes.length) {
        q.accepted = new Date();
        q.status = QuestStatus.WIP;
        q.deadline = new Date(new Date().getTime() + q.timeframe);
        q.parties = [];
        q.currentParty = p._id;
        await q.save();
    } else {
        for (let i = 0; i < p.modes.length; i++) {
            const mode = p.modes[i];
            await QuestModel.findByIdAndUpdate(q._id, {
                $pull: { modes: mode },
            });
        }

        await QuestModel.findByIdAndUpdate(q._id, {
            $pull: { parties: p._id },
        });

        newQuest = new QuestModel();
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
        newQuest.status = QuestStatus.WIP;
        newQuest.deadline = new Date(new Date().getTime() + q.timeframe);
        newQuest.currentParty = p._id;
        newQuest.requiredMapsets = q.requiredMapsets;
        await newQuest.save();
    }

    // spend points
    p.members.forEach(member => {
        SpentPointsModel.generate(SpentPointsCategory.AcceptQuest, member._id, q._id);
        updateUserPoints(member.id);
    });

    // load all quests
    const allQuests = await QuestModel
        .find({})
        .defaultPopulate()
        .sortByLastest();

    res.json({ quests: allQuests, availablePoints: res.locals.userRequest.availablePoints - q.price });

    //logs
    let modeList = '';

    for (let i = 0; i < p.modes.length; i++) {
        modeList += p.modes[i];

        if (i != p.modes.length - 1) {
            modeList += ', ';
        }
    }

    LogModel.generate(req.session?.mongoId, `party accepted quest "${q.name}" for mode${p.modes.length > 1 ? 's' : ''} "${modeList}"`, LogCategory.Quest );

    //webhook
    let memberList = '';

    for (let i = 0; i < p.members.length; i++) {
        const user = p.members[i];
        memberList += `[**${user.username}**](https://osu.ppy.sh/users/${user.osuId})`;

        if (i+1 < p.members.length) {
            memberList += ', ';
        }
    }

    let url = `https://assets.ppy.sh/artists/${q.art}/cover.jpg`;

    if (q.isMbc) {
        url = 'https://mappersguild.com/images/mbc-icon.png';
    }

    webhookPost([{
        author: {
            name: `${p.leader.username}'s party`,
            url: `https://osu.ppy.sh/users/${p.leader.osuId}`,
            icon_url: `https://a.ppy.sh/${p.leader.osuId}`,
        },
        description: `Accepted quest: [**${q.name}**](https://mappersguild.com/quests?id=${newQuest ? newQuest.id : q.id}) [**${p.modes.join(', ')}**]`,
        color: webhookColors.green,
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
});

/* POST drop quest. */
questsRouter.post('/dropQuest/:partyId/:questId', isNotSpectator, async (req, res) => {
    const [p, q] = await Promise.all([
        PartyModel
            .findById(req.params.partyId)
            .defaultPopulate()
            .orFail(new Error(`Party doesn't exist!`)),

        QuestModel
            .findById(req.params.questId)
            .defaultPopulate()
            .orFail(),
    ]);

    if (!q.currentParty || q.currentParty.id != p.id) {
        return res.json({ error: 'Invalid request!' });
    }

    if (q.associatedMaps) {
        for (let i = 0; i < q.associatedMaps.length; i++) {
            await BeatmapModel.findByIdAndUpdate(q.associatedMaps[i]._id, { quest: undefined });
        }
    }

    const openQuest = await QuestModel.findOne({
        name: q.name,
        status: QuestStatus.Open,
    });

    if (openQuest) {
        await Promise.all([
            QuestModel.findByIdAndUpdate(openQuest._id, {
                $push: { modes: q.modes as any },
            }),
            QuestModel.findByIdAndUpdate(req.params.questId, { status: QuestStatus.Hidden }),
        ]);
    } else {
        await QuestModel.findByIdAndUpdate(req.params.questId, {
            status: QuestStatus.Open,
            currentParty: undefined,
        });
    }

    const allQuests = await QuestModel
        .find({})
        .defaultPopulate()
        .sortByLastest();

    res.json(allQuests);

    //logs
    let modeList = '';

    for (let i = 0; i < q.modes.length; i++) {
        modeList += q.modes[i];

        if (i != q.modes.length - 1) {
            modeList += ', ';
        }
    }

    LogModel.generate(req.session?.mongoId, `party dropped quest "${q.name}" for mode${q.modes.length > 1 ? 's' : ''} "${modeList}"`, LogCategory.Quest );

    //webhook
    let memberList = '';

    for (let i = 0; i < p.members.length; i++) {
        const user = p.members[i];
        memberList += `[**${user.username}**](https://osu.ppy.sh/users/${user.osuId})`;

        if (i+1 < p.members.length) {
            memberList += ', ';
        }
    }

    let url = `https://assets.ppy.sh/artists/${q.art}/cover.jpg`;

    if (q.isMbc) {
        url = 'https://mappersguild.com/images/mbc-icon.png';
    }

    webhookPost([{
        author: {
            name: `${p.leader.username}'s party`,
            url: `https://osu.ppy.sh/users/${p.leader.osuId}`,
            icon_url: `https://a.ppy.sh/${p.leader.osuId}`,
        },
        color: webhookColors.red,
        description: `Dropped quest: [**${q.name}**](https://mappersguild.com/quests?id=${openQuest ? openQuest.id : q.id}) [**${p.modes.join(', ')}**]`,
        thumbnail: {
            url,
        },
        fields: [{
            name: 'Party members',
            value: memberList,
        }],
    }]);

    PartyModel.findByIdAndRemove(req.params.partyId);
});

/* POST reopen expired quest. */
questsRouter.post('/reopenQuest/:questId', isNotSpectator, async (req, res) => {
    const quest = await QuestModel
        .findById(req.params.questId)
        .defaultPopulate()
        .orFail();

    if (res.locals.userRequest.availablePoints < (quest.price*0.5 + 25)) {
        return res.json({ error: `You don't have enough points to re-open this quest!` });
    }

    const openQuest = await QuestModel.findOne({
        name: quest.name,
        status: QuestStatus.Open,
    });

    const newExpiration = new Date();
    newExpiration.setDate(newExpiration.getDate() + 90);

    if (req.body.status == QuestStatus.Open) {
        if (openQuest && !openQuest.isExpired) {
            await Promise.all([
                QuestModel.findByIdAndUpdate(openQuest._id, {
                    $push: { modes: quest.modes as any },
                    expiration: newExpiration,
                }),
                QuestModel.findByIdAndUpdate(req.params.questId, { status: QuestStatus.Hidden }),
            ]);
        } else {
            await QuestModel.findByIdAndUpdate(req.params.questId, {
                expiration: newExpiration,
            });
        }
    }

    SpentPointsModel.generate(SpentPointsCategory.ReopenQuest, req.session?.mongoId, quest._id);
    updateUserPoints(req.session?.mongoId);

    const allQuests = await QuestModel
        .find({})
        .defaultPopulate()
        .sortByLastest();

    res.json({ quests: allQuests, availablePoints: res.locals.userRequest.availablePoints });

    LogModel.generate(req.session?.mongoId, `re-opened quest "${quest.name}"`, LogCategory.Quest );

    // webhook
    let url = `https://assets.ppy.sh/artists/${quest.art}/cover.jpg`;

    if (quest.isMbc) {
        url = 'https://mappersguild.com/images/mbc-icon.png';
    }

    webhookPost([{
        author: {
            name: req.session?.username,
            url: `https://osu.ppy.sh/users/${req.session?.osuId}`,
            icon_url: `https://a.ppy.sh/${req.session?.osuId}`,
        },
        color: webhookColors.white,
        description: `Quest re-opened: [**${quest.name}**](https://mappersguild.com/quests?id=${quest.id})`,
        thumbnail: {
            url,
        },
        fields: [{
            name: 'Objective',
            value: `${quest.descriptionMain}`,
        }],
    }]);
});

/* POST extend deadline */
questsRouter.post('/extendDeadline/:partyId/:questId', isNotSpectator, async (req, res) => {
    const [party, quest] = await Promise.all([
        PartyModel
            .findById(req.params.partyId)
            .populate(pointsPopulate)
            .orFail(new Error(`Party doesn't exist!`)),

        QuestModel
            .findById(req.params.questId)
            .defaultPopulate()
            .orFail(),
    ]);

    const notEnoughPoints = party.members.some(m => m.availablePoints < 10);

    if (notEnoughPoints) {
        return res.json({ error: 'One or more of your party members do not have enough points to extend the deadline!' });
    }

    party.members.forEach(member => {
        SpentPointsModel.generate(SpentPointsCategory.ExtendDeadline, member.id, quest.id);
        updateUserPoints(member.id);
    });

    const deadline = new Date(quest.deadline);
    deadline.setDate(deadline.getDate() + 30);
    quest.deadline = deadline;
    await quest.save();

    const updatedQuest = await QuestModel
        .findById(req.params.questId)
        .defaultPopulate()
        .orFail();

    const user = await UserModel.findById(req.session?.mongoId).orFail();

    res.json({
        quest: updatedQuest,
        availablePoints: user.availablePoints,
    });

    LogModel.generate(req.session?.mongoId, `extended deadline for ${updatedQuest.name}`, LogCategory.Party);
});

/* POST add quest */
questsRouter.post('/submitQuest', isNotSpectator, async (req, res) => {
    //quest creation
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
    quest.creator = req.session?.mongoId;

    // points
    const points = findCreateQuestPointsSpent(quest.art, quest.requiredMapsets);

    const user = await UserModel
        .findById(req?.session?.mongoId)
        .orFail(new Error(cannotFindUserMessage));

    if (user.availablePoints < points) {
        return res.json({ error: 'Not enough points to perform this action!' });
    }

    await quest.save();

    res.json(true);

    SpentPointsModel.generate(SpentPointsCategory.CreateQuest, req.session?.mongoId, quest._id);
    updateUserPoints(req.session?.mongoId);
    LogModel.generate(req.session?.mongoId, `submitted quest for approval`, LogCategory.Quest);
});

export default questsRouter;
