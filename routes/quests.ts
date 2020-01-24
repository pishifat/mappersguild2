import express from 'express';
import { isLoggedIn, isNotSpectator } from '../helpers/middlewares';
import { PartyService, Party } from '../models/party';
import { defaultErrorMessage, BasicError, canFail, BasicResponse } from '../helpers/helpers';
import { BeatmapMode, BeatmapService } from '../models/beatmap/beatmap';
import { QuestService, Quest, QuestStatus } from '../models/quest';
import { LogService, LogCategory } from '../models/log';
import { webhookPost } from '../helpers/discordApi';
import { UserService, User } from '../models/user';
import { InviteService, ActionType } from '../models/invite';

const questsRouter = express.Router();

questsRouter.use(isLoggedIn);

// default populations
const beatmapPopulate = [
    { path: 'tasks', populate: { path: 'mappers' } },
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

    const updatedParty = await PartyService.update(id, { rank: Math.round(rank / p.members.length), modes });

    if (!updatedParty || PartyService.isError(updatedParty)) {
        return defaultErrorMessage;
    }

    return { success: 'ok' };
}

/* GET quests page */
questsRouter.get('/', (req, res) => {
    res.render('quests', {
        title: 'Quests',
        script: '../javascripts/quests.js',
        isQuests: true,
        loggedInAs: req.session?.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});

/* GET relevant quest info */
questsRouter.get('/relevantInfo', async (req, res) => {
    const openQuests = await QuestService.queryAll({
        query: { modes: res.locals.userRequest.mainMode, status: 'open' },
        useDefaults: true,
    });

    res.json({
        openQuests,
        userMongoId: req.session?.mongoId,
        group: res.locals.userRequest.group,
        mainMode: res.locals.userRequest.mainMode,
    });
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

    LogService.create(req.session.mongoId, `created a party for ${q.name}`, p._id, LogCategory.Party);
}));

/* POST delete party */
questsRouter.post('/deleteParty/:partyId/:questId', isNotSpectator, canFail(async (req, res) => {
    const p = await PartyService.removeOrFail(req.params.partyId);
    await QuestService.updateOrFail(req.params.questId, { $pull: { parties: p._id } });
    const q = await QuestService.queryByIdOrFail(req.params.questId, { defaultPopulate: true });
    res.json(q);

    LogService.create(req.session.mongoId, `deleted a party for ${q.name}`, p._id, LogCategory.Party);
}));

/* POST toggle party lock */
questsRouter.post('/togglePartyLock/:partyId/:questId', isNotSpectator, canFail(async (req, res) => {
    const p = await PartyService.updateOrFail(req.params.partyId, { lock: !req.body.lock });
    const q = await QuestService.queryByIdOrFail(req.params.questId, { defaultPopulate: true });
    res.json(q);

    LogService.create(req.session.mongoId, `toggled lock on party for ${q.name}`, p._id, LogCategory.Party);
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

    LogService.create(req.session.mongoId, `toggled "${req.body.mode}" mode on party for ${q.name}`, p._id, LogCategory.Party);
}));

/* POST join party */
questsRouter.post('/joinParty/:partyId/:questId', isNotSpectator, canFail(async (req, res) => {
    const p = await PartyService.updateOrFail(req.params.partyId, { $push: { members: req.session?.mongoId } });

    await updatePartyInfo(req.params.partyId);

    const q = await QuestService.queryByIdOrFail(req.params.questId, { defaultPopulate: true });

    res.json(q);

    LogService.create(req.session.mongoId, `joined party for ${q.name}`, p._id, LogCategory.Party);
}));

/* POST leave party */
questsRouter.post('/leaveParty/:partyId/:questId', isNotSpectator, canFail(async (req, res) => {
    const p = await PartyService.updateOrFail(req.params.partyId, { $pull: { members: req.session?.mongoId } });

    await updatePartyInfo(req.params.partyId);

    const q = await QuestService.queryByIdOrFail(req.params.questId, { defaultPopulate: true });

    res.json(q);

    LogService.create(req.session.mongoId, `left party for ${q.name}`, p._id, LogCategory.Party);

    if (q.status == QuestStatus.WIP && q.overLimit) {
        const u = await UserService.queryByIdOrFail(req.session.mongoId);
        UserService.update(u._id, { penaltyPoints: (u.penaltyPoints + q.reward) });
    }

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

    if (!u.invites) {
        return res.json({ error: inviteError + 'User has invites disabled!' });
    }

    const pendingInvite = await InviteService.queryOne({
        query: { recipient: u._id, sender: req.session.mongoId, visible: true },
    });

    if (pendingInvite && !InviteService.isError(pendingInvite)) {
        return res.json({ error: inviteError + 'Wait for the user to reply to your previous invite before sending another!' });
    }

    const q = await QuestService.queryById(req.params.questId, { defaultPopulate: true });
    const currentParties = await PartyService.queryAll({ query: { members: u._id } });

    // no idea if it should continue at all ?
    if (q && !QuestService.isError(q) && !PartyService.isError(currentParties)) {
        let duplicate = false;

        q.parties.forEach(questParty => {
            currentParties.forEach(userParty => {
                if (questParty.id == userParty.id) {
                    duplicate = true;
                }
            });
        });

        if (duplicate) {
            return res.json({ error: inviteError + 'User is already in a party for this quest!' });
        }

        if (q.status == QuestStatus.WIP && q.overLimit) {
            return res.json({ error: inviteError + 'Your party has been running a quest for too long to add new members!' });
        }
    }

    res.json({ success: 'Invite sent!' });

    InviteService.createPartyInvite(
        u.id,
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


    const p = await PartyService.updateOrFail(req.params.partyId, { leader: u._id });
    const q = await QuestService.queryByIdOrFail(req.params.questId, { defaultPopulate: true });
    res.json(q);

    LogService.create(req.session.mongoId, `transferred party leader in party for ${q.name}`, p._id, LogCategory.Party);
}));

/* POST kick party member */
questsRouter.post('/kickPartyMember/:partyId/:questId', isNotSpectator, canFail(async (req, res) => {
    if (!req.body.userId.length) {
        return res.json({ error: cannotFindUserMessage });
    }

    const u = await UserService.queryByIdOrFail(req.body.userId, {}, cannotFindUserMessage);
    const p = await PartyService.updateOrFail(req.params.partyId, { $pull: { members: u._id } });
    const q = await QuestService.queryByIdOrFail(req.params.questId, { defaultPopulate: true });

    res.json(q);

    LogService.create(req.session.mongoId, `kicked member from party for ${q.name}`, p._id, LogCategory.Party);

    if (q.status == QuestStatus.WIP && q.overLimit) {
        await UserService.update(u._id, { penaltyPoints: (u.penaltyPoints + q.reward) });
    }

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
    const p = await PartyService.queryByIdOrFail(req.params.partyId, { defaultPopulate: true }, `Party doesn't exist!`);

    if (!p.modes.length) {
        return res.json({ error: 'Your party has no modes selected!' });
    }

    const q = await QuestService.queryByIdOrFail(req.params.questId, { defaultPopulate: true });

    if (p.members.length <= q.minParty
        || p.members.length >= q.maxParty
        || p.rank <= q.minRank
    ) {
        return res.json({ error: 'Something went wrong!' });
    }

    for (let i = 0; i < p.modes.length; i++) {
        const mode = p.modes[i];
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
    }

    if (q.modes.length == p.modes.length) {
        await QuestService.update(q._id, {
            accepted: new Date().getTime(),
            status: QuestStatus.WIP,
            deadline: new Date().getTime() + q.timeframe,
            parties: [],
            currentParty: p._id,
        });
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

        await QuestService.create({
            name: q.name,
            reward: q.reward,
            descriptionMain: q.descriptionMain,
            timeframe: q.timeframe,
            minParty: q.minParty,
            maxParty: q.maxParty,
            minRank: q.minRank,
            art: q.art,
            color: q.color,
            modes: p.modes,
            accepted: new Date(),
            status: QuestStatus.WIP,
            deadline: new Date(new Date().getTime() + q.timeframe),
            currentParty: p._id,
        });

        // ???
        // await QuestService.update(newQuest._id, {
        //     accepted: new Date().getTime(),
        //     status: QuestStatus.WIP,
        //     deadline: new Date().getTime() + newQuest.timeframe,
        //     currentParty: p._id,
        // });
    }

    const allQuests = await QuestService.queryAll({
        query: {},
        useDefaults: true,
    });

    res.json(allQuests);

    //logs
    let modeList = '';

    for (let i = 0; i < p.modes.length; i++) {
        modeList += p.modes[i];

        if (i != p.modes.length - 1) {
            modeList += ', ';
        }
    }

    LogService.create(req.session.mongoId, `party accepted quest "${q.name}" for mode${p.modes.length > 1 ? 's' : ''} "${modeList}"`, q._id, LogCategory.Quest );

    //webhook
    let memberList = '';

    for (let i = 0; i < p.members.length; i++) {
        memberList += p.members[i].username;

        if (i != p.members.length - 1) {
            memberList += ', ';
        }
    }

    webhookPost([{
        author: {
            name: `Quest accepted: "${q.name}"`,
            url: `https://mappersguild.com/quests`,
            icon_url: `https://a.ppy.sh/${p.leader.osuId}`,
        },
        color: 11403103,
        thumbnail: {
            url: `https://assets.ppy.sh/artists/${q.art}/cover.jpg`,
        },
        fields: [
            {
                name: 'Party members',
                value: memberList,
            },
            {
                name: 'Modes',
                value: modeList,
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

    if (q.overLimit) {
        for (let i = 0; i < p.members.length; i++) {
            const u = await UserService.queryById(p.members[i].id);

            if (u && !UserService.isError(u)) {
                await UserService.update(p.members[i]._id, {
                    penaltyPoints: (u.penaltyPoints + q.reward),
                });
            }
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
            QuestService.remove(req.params.questId),
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

    LogService.create(req.session.mongoId, `party dropped quest "${q.name}" for mode${q.modes.length > 1 ? 's' : ''} "${modeList}"`, q._id, LogCategory.Quest );

    //webhook
    let memberList = '';

    for (let i = 0; i < p.members.length; i++) {
        memberList += p.members[i].username;

        if (i != p.members.length - 1) {
            memberList += ', ';
        }
    }

    webhookPost([{
        author: {
            name: `Quest dropped: "${q.name}"`,
            url: `https://mappersguild.com/quests`,
            icon_url: `https://a.ppy.sh/${p.leader.osuId}`,
        },
        color: 13710390,
        thumbnail: {
            url: `https://assets.ppy.sh/artists/${q.art}/cover.jpg`,
        },
        fields: [{
            name: 'Party members',
            value: memberList,
        },{
            name: 'Modes',
            value: modeList,
        }],
    }]);

    PartyService.remove(req.params.partyId);
}));

export default questsRouter;
