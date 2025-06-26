import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';
import { updateUserPoints } from '../../helpers/points';
import { QuestModel } from '../../models/quest';
import { Quest, QuestStatus } from '../../../interfaces/quest';
import { LogModel } from '../../models/log';
import { LogCategory } from '../../../interfaces/log';
import { webhookPost, webhookColors } from '../../helpers/discordApi';
import { SpentPointsModel } from '../../models/spentPoints';
import { generateAuthorWebhook, generateLists, generateThumbnailUrl } from '../../helpers/helpers';

const adminQuestsRouter = express.Router();

adminQuestsRouter.use(isLoggedIn);
adminQuestsRouter.use(isAdmin);
adminQuestsRouter.use(isSuperAdmin);

/* GET quests */
adminQuestsRouter.get('/load', async (req, res) => {
    const q = await QuestModel
        .find({})
        .defaultPopulate()
        .sort({ status: -1, name: 1 });

    res.json(q);
});

/* POST add quest */
adminQuestsRouter.post('/create', async (req, res) => {
    const newQuests: Quest[] = [];

    for (const quest of req.body.quests) {
        quest.expiration = new Date();
        quest.expiration.setDate(quest.expiration.getDate() + 90);
        quest.creator = req?.session?.mongoId;
        quest.status = QuestStatus.Scheduled;

        const newQuest = await QuestModel.create(quest);
        newQuests.push(newQuest);

        LogModel.generate(req.session?.mongoId, `created quest "${newQuest.name}"`, LogCategory.Quest);
    }

    const quests = await QuestModel.findAll(10000);

    res.json({
        quests,
    });
});

/* POST schedule quest */
adminQuestsRouter.post('/:id/schedule', async (req, res) => {
    const quest = await QuestModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();

    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 90);
    quest.expiration = expiration;

    quest.status = QuestStatus.Scheduled;

    await quest.save();

    LogModel.generate(req.session?.mongoId, `scheduled quest "${quest.name}" by "${quest.creator.username}"`, LogCategory.Quest);

    res.json(quest.status);
});

/* POST reject quest */
adminQuestsRouter.post('/:id/reject', async (req, res) => {
    await QuestModel.findByIdAndUpdate(req.params.id, { status: QuestStatus.Rejected }).orFail();

    const quest = await QuestModel
        .findById(req.params.id)
        .defaultPopulate()
        .orFail();

    updateUserPoints(quest.creator.id);

    const spentPoints = await SpentPointsModel.findOne({ quest: quest._id }).orFail();
    await SpentPointsModel.findByIdAndRemove(spentPoints.id);

    res.json(quest.status);
});

/* POST update quest objective */
adminQuestsRouter.post('/:id/updateArt', async (req, res) => {
    const art = parseInt(req.body.art, 10);
    await QuestModel.findByIdAndUpdate(req.params.id, { art }).orFail();

    res.json(art);
});

/* POST rename quest */
adminQuestsRouter.post('/:id/rename', async (req, res) => {
    await QuestModel.findByIdAndUpdate(req.params.id, { name: req.body.name }).orFail();

    res.json(req.body.name);
});

/* POST update quest objective */
adminQuestsRouter.post('/:id/updateDescription', async (req, res) => {
    await QuestModel.findByIdAndUpdate(req.params.id, { descriptionMain: req.body.description }).orFail();

    res.json(req.body.description);
});

/* POST update price */
adminQuestsRouter.post('/:id/updatePrice', async (req, res) => {
    const price = parseInt(req.body.price, 10);
    await QuestModel.findByIdAndUpdate(req.params.id, { price }).orFail();

    res.json(price);
});

/* POST update required mapsets */
adminQuestsRouter.post('/:id/updateRequiredMapsets', async (req, res) => {
    const requiredMapsets = parseInt(req.body.requiredMapsets, 10);
    await QuestModel.findByIdAndUpdate(req.params.id, { requiredMapsets }).orFail();

    res.json(requiredMapsets);
});

/* POST update timeframe */
adminQuestsRouter.post('/:id/updateTimeframe', async (req, res) => {
    const timeframe = parseInt(req.body.timeframe, 10);
    await QuestModel.findByIdAndUpdate(req.params.id, { timeframe: timeframe * (24*3600*1000) }).orFail();

    res.json(timeframe);
});

/* POST update minimum party size */
adminQuestsRouter.post('/:id/updateMinParty', async (req, res) => {
    const minParty = parseInt(req.body.minParty, 10);
    await QuestModel.findByIdAndUpdate(req.params.id, { minParty }).orFail();

    res.json(minParty);
});

/* POST update maximum party size */
adminQuestsRouter.post('/:id/updateMaxParty', async (req, res) => {
    const maxParty = parseInt(req.body.maxParty, 10);
    await QuestModel.findByIdAndUpdate(req.params.id, { maxParty }).orFail();

    res.json(maxParty);
});


/* POST drop a WIP quest */
adminQuestsRouter.post('/:id/drop', async (req, res) => {
    let quest = await QuestModel.defaultFindByIdOrFail(req.params.id);
    quest = await quest.drop();

    res.json(quest);

    //webhook
    const { memberList, modeList } = generateLists(quest.modes, quest.currentParty.members);
    webhookPost([{
        ...generateAuthorWebhook(quest.currentParty.leader),
        color: webhookColors.red,
        description: `Dropped quest: [**${quest.name}**](https://mappersguild.com/quests?id=${quest.id}) [**${modeList}**]`,
        ...generateThumbnailUrl(quest),
        fields: [{
            name: 'Party members',
            value: memberList,
        }],
    }]);

    // logs
    LogModel.generate(req.session?.mongoId, `forced party to drop quest "${quest.name}"`, LogCategory.Quest);
});

/* POST schedule quest for completion */
adminQuestsRouter.post('/:id/scheduleForCompletion', async (req, res) => {
    const quest = await QuestModel.defaultFindByIdOrFail(req.params.id);

    if (quest.status !== QuestStatus.WIP) {
        throw new Error(`Quest is ${quest.status}`);
    }

    quest.queuedForCompletion = req.body.queuedForCompletion;
    await quest.save();

    res.json(req.body.queuedForCompletion);

    LogModel.generate(req.session?.mongoId, `marked quest "${quest.name}" as complete`, LogCategory.Quest);
});

/* POST toggle quest mode */
adminQuestsRouter.post('/:id/toggleMode', async (req, res) => {
    const quest = await QuestModel.findById(req.params.id).orFail();
    const mode = req.body.mode;
    const i = quest.modes.findIndex(m => m === mode);

    if (i !== -1) {
        quest.modes.splice(i, 1);
    } else {
        quest.modes.push(mode);
    }

    await quest.save();

    res.json(quest);
});

/* POST update quest expiration */
adminQuestsRouter.post('/:id/updateExpiration', async (req, res) => {
    const date = new Date(req.body.expiration);

    if (!(date instanceof Date && !isNaN(date.getTime()))) {
        return res.json({ error: 'Invalid date' });
    }

    await QuestModel.findByIdAndUpdate(req.params.id, { expiration: date }).orFail();

    res.json(date);
});

/* POST update quest minParty */
adminQuestsRouter.post('/:id/updateMinParty', async (req, res) => {
    const minParty = parseInt(req.body.minParty, 10);

    if (isNaN(minParty)) {
        return res.json({ error: 'Invalid number' });
    }

    await QuestModel.findByIdAndUpdate(req.params.id, { minParty }).orFail();

    res.json(minParty);
});

/* POST update quest maxParty */
adminQuestsRouter.post('/:id/updateMaxParty', async (req, res) => {
    const maxParty = parseInt(req.body.maxParty, 10);

    if (isNaN(maxParty)) {
        return res.json({ error: 'Invalid number' });
    }

    await QuestModel.findByIdAndUpdate(req.params.id, { maxParty }).orFail();

    res.json(maxParty);
});

/* POST reset quest deadline */
adminQuestsRouter.post('/:id/reset', async (req, res) => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    const quest = await QuestModel.findById(req.params.id).orFail();
    quest.deadline = date;
    await quest.save();

    res.json(date);
});

/* POST delete quest */
adminQuestsRouter.post('/:id/delete', async (req, res) => {
    const quest = await QuestModel.findById(req.params.id).orFail();

    if (quest.status !== QuestStatus.Open) {
        throw new Error(`Quest is ${quest.status}`);
    }

    await quest.remove();
    res.json({ success: 'ok' });

    LogModel.generate(req.session?.mongoId, `deleted quest "${quest.name}"`, LogCategory.Quest);
});

export default adminQuestsRouter;
