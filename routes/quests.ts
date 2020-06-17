import express from 'express';
import { isLoggedIn, isNotSpectator } from '../helpers/middlewares';
import { PartyService, Party } from '../models/party';
import { findCreateQuestPointsSpent } from '../helpers/points';
import { defaultErrorMessage, BasicError, canFail, BasicResponse } from '../helpers/helpers';
import { BeatmapService } from '../models/beatmap/beatmap';
import { BeatmapMode } from '../interfaces/beatmap/beatmap';
import { QuestService, Quest } from '../models/quest';
import { QuestStatus } from '../interfaces/quest';
import { LogService } from '../models/log';
import { LogCategory } from '../interfaces/log';
import { webhookPost, webhookColors } from '../helpers/discordApi';
import { UserService, User } from '../models/user';
import { InviteService } from '../models/invite';
import { ActionType } from '../interfaces/invite';
import { FeaturedArtistService } from '../models/featuredArtist';
import { SpentPointsService } from '../models/spentPoints';
import { SpentPointsCategory } from '../interfaces/spentPoints';
import { updateUserPoints } from '../helpers/points';

const questsRouter = express.Router();

questsRouter.use(isLoggedIn);

// default populations
const beatmapPopulate = [
    { path: 'tasks', populate: { path: 'mappers' } },
];

const pointsPopulate = [
    { path: 'members', select: 'osuId username rank easyPoints normalPoints hardPoints insanePoints expertPoints storyboardPoints questPoints modPoints hostPoints contestParticipantPoints contestJudgePoints contestVotePoints spentPoints' },
    { path: 'leader', select: 'osuId username' },
];

const cannotFindUserMessage = 'Cannot find user!';

//updating party rank and modes when leaving/kicking/joining
async function updatePartyInfo(id: Party['_id']): Promise<BasicResponse> {
    const p = await PartyService.queryById(id, {
        populate: [{ path: 'members', select: 'rank osuPoints taikoPoints catchPoints maniaPoints' }],
    });
    let rank = 0;
    const modes: Omit<BeatmapMode, BeatmapMode.Hybrid>[] = [];

    if (!p || PartyService.isError(p)) {
        return defaultErrorMessage;
    }

    p.members.forEach(user => {
        rank += user.rank;

        if (!modes.includes(user.mainMode)) {
            modes.push(user.mainMode);
        }
    });

    p.rank = Math.round(rank / p.members.length);
    p.modes = modes;
    await PartyService.saveOrFail(p);

    const updatedParty = await PartyService.queryById(id);

    if (!updatedParty || PartyService.isError(updatedParty)) {
        return defaultErrorMessage;
    }

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
    const openQuests = await QuestService.queryAll({
        query: { modes: res.locals.userRequest.mainMode, status: 'open', expiration: { $gt: new Date() } },
        useDefaults: true,
    });

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
    const urlQuest = await QuestService.queryById(req.params.id, { defaultPopulate: true });

    if (!urlQuest) {
        return res.json({ error: 'Quest ID does not exist!' });
    }

    res.json(urlQuest);
});

/* GET relevant quest info */
questsRouter.get('/search', async (req, res) => {
    let quests: BasicError | Quest[];

    if (req.query.mode != 'any') {
        quests = await QuestService.queryAll({
            query: { modes: req.query.mode, status: { $ne: 'hidden' } },
            useDefaults: true,
        });
    } else {
        quests = await QuestService.queryAll({
            query: { status: { $ne: 'hidden' } },
            useDefaults: true,
        });
    }

    res.json({ quests });
});

/* POST create party */
questsRouter.post('/createParty/:id', isNotSpectator, canFail(async (req, res) => {
    const p = await PartyService.createOrFail(req.session?.mongoId, res.locals.userRequest.mainMode);

    await updatePartyInfo(p._id);
    await QuestService.update(req.params.id, { $push: { parties: p._id } });

    const q = await QuestService.queryByIdOrFail(req.params.id, { defaultPopulate: true });
    res.json(q);

    LogService.create(req.session.mongoId, `created a party for ${q.name}`, LogCategory.Party);
}));

/* POST delete party */
questsRouter.post('/deleteParty/:partyId/:questId', isNotSpectator, canFail(async (req, res) => {
    const p = await PartyService.removeOrFail(req.params.partyId);
    await QuestService.updateOrFail(req.params.questId, { $pull: { parties: p._id } });
    const q = await QuestService.queryByIdOrFail(req.params.questId, { defaultPopulate: true });
    res.json(q);

    LogService.create(req.session.mongoId, `deleted a party for ${q.name}`, LogCategory.Party);
}));

/* POST toggle party lock */
questsRouter.post('/togglePartyLock/:partyId/:questId', isNotSpectator, canFail(async (req, res) => {
    await PartyService.updateOrFail(req.params.partyId, { lock: !req.body.lock });
    const q = await QuestService.queryByIdOrFail(req.params.questId, { defaultPopulate: true });
    res.json(q);

    LogService.create(req.session.mongoId, `toggled lock on party for ${q.name}`, LogCategory.Party);
}));

/* POST toggle party mode */
questsRouter.post('/togglePartyMode/:partyId/:questId', isNotSpectator, canFail(async (req, res) => {
    const p = await PartyService.queryByIdOrFail(req.params.partyId);

    if (p.modes.includes(req.body.mode)) {
        await PartyService.update(req.params.partyId, { $pull: { modes: req.body.mode } });
    } else {
        await PartyService.update(req.params.partyId, { $push: { modes: req.body.mode } });
    }

    const q = await QuestService.queryByIdOrFail(req.params.questId, { defaultPopulate: true });
    res.json(q);

    LogService.create(req.session.mongoId, `toggled "${req.body.mode}" mode on party for ${q.name}`, LogCategory.Party);
}));

/* POST join party */
questsRouter.post('/joinParty/:partyId/:questId', isNotSpectator, canFail(async (req, res) => {
    await PartyService.updateOrFail(req.params.partyId, { $push: { members: req.session?.mongoId } });

    await updatePartyInfo(req.params.partyId);

    const q = await QuestService.queryByIdOrFail(req.params.questId, { defaultPopulate: true });

    res.json(q);

    LogService.create(req.session.mongoId, `joined party for ${q.name}`, LogCategory.Party);
}));

/* POST leave party */
questsRouter.post('/leaveParty/:partyId/:questId', isNotSpectator, canFail(async (req, res) => {
    await PartyService.updateOrFail(req.params.partyId, { $pull: { members: req.session?.mongoId } });

    await updatePartyInfo(req.params.partyId);

    const q = await QuestService.queryByIdOrFail(req.params.questId, { defaultPopulate: true });

    res.json(q);

    LogService.create(req.session.mongoId, `left party for ${q.name}`, LogCategory.Party);

    if (q.associatedMaps) {
        for (let i = 0; i < q.associatedMaps.length; i++) {
            let valid = true;
            const b = await BeatmapService.queryByIdOrFail(q.associatedMaps[i]._id, { populate: beatmapPopulate });

            b.tasks.forEach(task => {
                task.mappers.forEach(mapper => {
                    if (mapper.id == req.session.mongoId) {
                        valid = false;
                    }
                });
            });

            if (!valid) {
                await BeatmapService.update(q.associatedMaps[i]._id, { quest: null });
            }
        }
    }

}));

/* POST invite to party */
questsRouter.post('/inviteToParty/:partyId/:questId', isNotSpectator, canFail(async (req, res) => {
    const inviteError = 'Invite not sent: ';
    let u: User;

    if (req.body.username.indexOf('[') >= 0 || req.body.username.indexOf(']') >= 0) {
        u = await UserService.queryOneOrFail({
            query: { username: new RegExp('^\\' + req.body.username + '$', 'i') },
        }, inviteError + cannotFindUserMessage);
    } else {
        u = await UserService.queryOneOrFail({
            query: { username: new RegExp('^' + req.body.username + '$', 'i') },
        }, inviteError + cannotFindUserMessage);
    }

    const q = await QuestService.queryByIdOrFail(req.params.questId, { defaultPopulate: true });
    const currentParties = await PartyService.queryAll({ query: { members: u._id } });

    if (!PartyService.isError(currentParties)) {
        const duplicate = q.parties.some(questParty => {
            return currentParties.some(userParty => questParty.id == userParty.id);
        });

        if (duplicate) {
            return res.json({ error: inviteError + 'User is already in a party for this quest!' });
        }
    }

    if (u.availablePoints < q.price) {
        return res.json( { error: inviteError + 'User does not have enough points to accept this quest!' });
    }

    res.json({ success: 'Invite sent!' });

    InviteService.createPartyInvite(
        u._id,
        req.session.mongoId,
        req.params.partyId,
        `wants you to join their party`,
        ActionType.Join,
        req.params.partyId,
        req.params.questId
    );
}));

/* POST transfer party leader */
questsRouter.post('/transferPartyLeader/:partyId/:questId', isNotSpectator, canFail(async (req, res) => {
    if (!req.body.userId.length) {
        return res.json({ error: cannotFindUserMessage });
    }

    const u = await UserService.queryByIdOrFail(req.body.userId, {}, cannotFindUserMessage);


    await PartyService.updateOrFail(req.params.partyId, { leader: u._id });
    const q = await QuestService.queryByIdOrFail(req.params.questId, { defaultPopulate: true });
    res.json(q);

    LogService.create(req.session.mongoId, `transferred party leader in party for ${q.name}`, LogCategory.Party);
}));

/* POST kick party member */
questsRouter.post('/kickPartyMember/:partyId/:questId', isNotSpectator, canFail(async (req, res) => {
    if (!req.body.userId.length) {
        return res.json({ error: cannotFindUserMessage });
    }

    const u = await UserService.queryByIdOrFail(req.body.userId, {}, cannotFindUserMessage);
    await PartyService.updateOrFail(req.params.partyId, { $pull: { members: u._id } });
    const q = await QuestService.queryByIdOrFail(req.params.questId, { defaultPopulate: true });

    res.json(q);

    LogService.create(req.session.mongoId, `kicked member from party for ${q.name}`, LogCategory.Party);

    if (q.associatedMaps) {
        for (let i = 0; i < q.associatedMaps.length; i++) {
            const b = await BeatmapService.queryById(q.associatedMaps[i]._id, { populate: beatmapPopulate });

            if (b && !BeatmapService.isError(b)) {
                let valid = true;

                b.tasks.forEach(task => {
                    task.mappers.forEach(mapper => {
                        if (mapper.id == u.id) {
                            valid = false;
                        }
                    });
                });

                if (!valid) {
                    await BeatmapService.update(q.associatedMaps[i]._id, { quest: null });
                }
            }
        }
    }
}));

/* POST accepts quest. */
questsRouter.post('/acceptQuest/:partyId/:questId', isNotSpectator, canFail(async (req, res) => {
    const p = await PartyService.queryByIdOrFail(req.params.partyId, { populate: pointsPopulate }, `Party doesn't exist!`);

    if (!p.modes.length) {
        return res.json({ error: 'Your party has no modes selected!' });
    }

    const q = await QuestService.queryByIdOrFail(req.params.questId, { defaultPopulate: true });

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
        const invalidQuest = await QuestService.queryOne({
            query: {
                name: q.name,
                modes: mode,
                $or: [
                    { status: QuestStatus.WIP },
                    { status: QuestStatus.Done },
                ],
            },
            defaultPopulate: true,
        });

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
        await QuestService.saveOrFail(q);
    } else {
        for (let i = 0; i < p.modes.length; i++) {
            const mode = p.modes[i];
            await QuestService.update(q._id, {
                $pull: { modes: mode },
            });
        }

        await QuestService.update(q._id, {
            $pull: { parties: p._id },
        });

        newQuest = await QuestService.create({
            creator: q.creator,
            name: q.name,
            price: q.price,
            descriptionMain: q.descriptionMain,
            timeframe: q.timeframe,
            minParty: q.minParty,
            maxParty: q.maxParty,
            minRank: q.minRank,
            art: q.art,
            isMbc: q.isMbc,
            modes: p.modes,
            accepted: new Date(),
            status: QuestStatus.WIP,
            deadline: new Date(new Date().getTime() + q.timeframe),
            currentParty: p._id,
            requiredMapsets: q.requiredMapsets,
        });
    }

    // spend points
    p.members.forEach(member => {
        SpentPointsService.create(SpentPointsCategory.AcceptQuest, member._id, q._id);
        updateUserPoints(member.id);
    });

    // load all quests
    const allQuests = await QuestService.queryAll({
        query: {},
        useDefaults: true,
    });

    res.json({ quests: allQuests, availablePoints: res.locals.userRequest.availablePoints - q.price });

    //logs
    let modeList = '';

    for (let i = 0; i < p.modes.length; i++) {
        modeList += p.modes[i];

        if (i != p.modes.length - 1) {
            modeList += ', ';
        }
    }

    LogService.create(req.session.mongoId, `party accepted quest "${q.name}" for mode${p.modes.length > 1 ? 's' : ''} "${modeList}"`, LogCategory.Quest );

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
}));

/* POST drop quest. */
questsRouter.post('/dropQuest/:partyId/:questId', isNotSpectator, canFail(async (req, res) => {
    const [p, q] = await Promise.all([
        PartyService.queryByIdOrFail(req.params.partyId, { defaultPopulate: true }, `Party doesn't exist!`),
        QuestService.queryByIdOrFail(req.params.questId, { defaultPopulate: true }),
    ]);

    if (!q.currentParty || q.currentParty.id != p.id) {
        return res.json({ error: 'Invalid request!' });
    }

    if (q.associatedMaps) {
        for (let i = 0; i < q.associatedMaps.length; i++) {
            await BeatmapService.update(q.associatedMaps[i]._id, { quest: null });
        }
    }

    const openQuest = await QuestService.queryOne({
        query: {
            name: q.name,
            status: QuestStatus.Open,
        },
    });

    if (openQuest && !QuestService.isError(openQuest)) {
        await Promise.all([
            QuestService.update(openQuest._id, {
                $push: { modes: q.modes },
            }),
            QuestService.update(req.params.questId, { status: 'hidden' }),
        ]);
    } else {
        await QuestService.update(req.params.questId, {
            status: QuestStatus.Open,
            currentParty: null,
        });
    }

    const allQuests = await QuestService.queryAll({ useDefaults: true });

    res.json(allQuests);

    //logs
    let modeList = '';

    for (let i = 0; i < q.modes.length; i++) {
        modeList += q.modes[i];

        if (i != q.modes.length - 1) {
            modeList += ', ';
        }
    }

    LogService.create(req.session.mongoId, `party dropped quest "${q.name}" for mode${q.modes.length > 1 ? 's' : ''} "${modeList}"`, LogCategory.Quest );

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
        description: `Dropped quest: [**${q.name}**](https://mappersguild.com/quests?id=${openQuest && !QuestService.isError(openQuest) ? openQuest.id : q.id}) [**${p.modes.join(', ')}**]`,
        thumbnail: {
            url,
        },
        fields: [{
            name: 'Party members',
            value: memberList,
        }],
    }]);

    PartyService.remove(req.params.partyId);
}));

/* POST reopen expired quest. */
questsRouter.post('/reopenQuest/:questId', isNotSpectator, canFail(async (req, res) => {
    const quest = await QuestService.queryByIdOrFail(req.params.questId, { defaultPopulate: true });

    if (res.locals.userRequest.availablePoints < (quest.price*0.5 + 25)) {
        return res.json({ error: `You don't have enough points to re-open this quest!` });
    }

    const openQuest = await QuestService.queryOne({
        query: {
            name: quest.name,
            status: QuestStatus.Open,
        },
    });

    const newExpiration = new Date();
    newExpiration.setDate(newExpiration.getDate() + 90);

    if (req.body.status == QuestStatus.Open) {
        if (openQuest && !QuestService.isError(openQuest) && !openQuest.isExpired) {
            await Promise.all([
                QuestService.update(openQuest._id, {
                    $push: { modes: quest.modes },
                    expiration: newExpiration,
                }),
                QuestService.update(req.params.questId, { status: 'hidden' }),
            ]);
        } else {
            await QuestService.update(req.params.questId, {
                expiration: newExpiration,
            });
        }
    }

    SpentPointsService.create(SpentPointsCategory.ReopenQuest, req.session.mongoId, quest._id);
    updateUserPoints(req.session.mongoId);

    const allQuests = await QuestService.queryAll({ useDefaults: true });

    res.json({ quests: allQuests, availablePoints: res.locals.userRequest.availablePoints });

    LogService.create(req.session.mongoId, `re-opened quest "${quest.name}"`, LogCategory.Quest );

    // webhook
    let url = `https://assets.ppy.sh/artists/${quest.art}/cover.jpg`;

    if (quest.isMbc) {
        url = 'https://mappersguild.com/images/mbc-icon.png';
    }

    webhookPost([{
        author: {
            name: req.session.username,
            url: `https://osu.ppy.sh/users/${req.session.osuId}`,
            icon_url: `https://a.ppy.sh/${req.session.osuId}`,
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
}));

/* POST extend deadline */
questsRouter.post('/extendDeadline/:partyId/:questId', isNotSpectator, canFail(async (req, res) => {
    const party = await PartyService.queryByIdOrFail(req.params.partyId, { populate: pointsPopulate }, `Party doesn't exist!`);
    let quest = await QuestService.queryByIdOrFail(req.params.questId, { defaultPopulate: true });

    const notEnoughPoints = party.members.some(m => m.availablePoints < 10);

    if (notEnoughPoints) {
        return res.json({ error: 'One or more of your party members do not have enough points to extend the deadline!' });
    }

    party.members.forEach(member => {
        SpentPointsService.create(SpentPointsCategory.ExtendDeadline, member.id, quest.id);
        updateUserPoints(member.id);
    });

    const deadline = new Date(quest.deadline);
    deadline.setDate(deadline.getDate() + 30);
    quest.deadline = deadline;
    await QuestService.saveOrFail(quest);

    quest = await QuestService.queryByIdOrFail(req.params.questId, { defaultPopulate: true });
    const user = await UserService.queryByIdOrFail(req.session.mongoId);

    res.json({ quest, availablePoints: user.availablePoints });

    LogService.create(req.session.mongoId, `extended deadline for ${quest.name}`, LogCategory.Party);
}));

/* POST add quest */
questsRouter.post('/submitQuest', isNotSpectator, canFail(async (req, res) => {
    //quest creation
    req.body.modes = [ BeatmapMode.Osu, BeatmapMode.Taiko, BeatmapMode.Catch, BeatmapMode.Mania ];
    req.body.minRank = 0;
    req.body.status = 'pending';
    req.body.creator = req?.session?.mongoId;
    const artist = await FeaturedArtistService.queryOne({ query: { osuId: req.body.art } });

    if (!artist || FeaturedArtistService.isError(artist)) {
        req.body.art = 0;
    }

    const quest = await QuestService.create(req.body);

    if (QuestService.isError(quest)) {
        return res.json({ error: 'Quest could not be created!' });
    }

    // points
    const points = findCreateQuestPointsSpent(quest.art, quest.requiredMapsets);

    const user = await UserService.queryByIdOrFail(req?.session?.mongoId, {}, cannotFindUserMessage);

    if (user.availablePoints < points) {
        QuestService.remove(quest.id);

        return res.json({ error: 'Not enough points to perform this action!' });
    }

    SpentPointsService.create(SpentPointsCategory.CreateQuest, req.session.mongoId, quest._id);
    updateUserPoints(req.session.mongoId);

    res.json(true);

    LogService.create(req.session?.mongoId, `submitted quest for approval`, LogCategory.Quest);
}));

export default questsRouter;
