import express from 'express';
import { isLoggedIn, isAdmin } from '../../helpers/middlewares';
import { QuestModel } from '../../models/quest';
import { QuestStatus } from '../../interfaces/quest';
import { UserModel } from '../../models/user';
import { BeatmapModel, Beatmap } from '../../models/beatmap/beatmap';
import { BeatmapStatus } from '../../interfaces/beatmap/beatmap';
import { beatmapsetInfo, isOsuResponseError } from '../../helpers/osuApi';
import { findBeatmapsetId, defaultErrorMessage } from '../../helpers/helpers';
import { SpentPointsCategory } from '../../interfaces/spentPoints';
import { SpentPointsModel } from '../../models/spentPoints';

const adminRouter = express.Router();

adminRouter.use(isLoggedIn);
adminRouter.use(isAdmin);

/* GET beatmaps in need of action */
adminRouter.get('/loadActionBeatmaps/:queryWip', async (req, res) => {
    const queryWip = req.params.queryWip == 'true'; // poor man's boolean

    const statusQuery = [
        { status: { $ne: BeatmapStatus.Ranked } },
        { status: { $ne: BeatmapStatus.Secret } },
    ];

    if (!queryWip) {
        statusQuery.push({ status: { $ne: BeatmapStatus.WIP } });
    }

    const allBeatmaps = await BeatmapModel
        .find({
            url: { $exists: true },
            $and: statusQuery,
        })
        .defaultPopulate()
        .sort({ status: 1, mode: 1 });

    const actionBeatmaps: Beatmap[] = [];

    for (const bm of allBeatmaps) {
        if (bm.url.indexOf('osu.ppy.sh/beatmapsets/') == -1) {
            (bm.status as string) = `${bm.status} (invalid link)`;
            actionBeatmaps.push(bm);
        } else {
            const osuId = findBeatmapsetId(bm.url);

            const bmInfo = await beatmapsetInfo(osuId);
            let status = '';

            if (!isOsuResponseError(bmInfo)) {
                switch (bmInfo.approved) {
                    case 4:
                        status = 'Loved';
                        break;
                    case 3:
                        status = BeatmapStatus.Qualified;
                        break;
                    case 2:
                        status = 'Approved';
                        break;
                    case 1:
                        status = BeatmapStatus.Ranked;
                        break;
                    default:
                        status = BeatmapStatus.Done;
                        break;
                }
            }

            if (queryWip) {
                if (bm.status == BeatmapStatus.WIP && status == BeatmapStatus.Ranked) {
                    (bm.status as string) = `${bm.status} (osu: ${status})`;
                    actionBeatmaps.push(bm);
                }
            } else if (bm.status != status) {
                if (status == BeatmapStatus.Qualified && bm.status == BeatmapStatus.Done) {
                    bm.status = BeatmapStatus.Qualified;
                    await bm.save();
                } else if (status == BeatmapStatus.Done && bm.status == BeatmapStatus.Qualified) {
                    bm.status = BeatmapStatus.Done;
                    await bm.save();
                } else {
                    (bm.status as string) = `${bm.status} (osu: ${status})`;
                    actionBeatmaps.push(bm);
                }

            }
        }
    }

    res.json(actionBeatmaps);
});

/* GET quests in need of action */
adminRouter.get('/loadActionQuests/', async (req, res) => {
    let quests = await QuestModel
        .find({ status: QuestStatus.WIP })
        .defaultPopulate();

    quests = quests.filter(q =>
        q.associatedMaps.length >= q.requiredMapsets &&
        q.associatedMaps.some(b => b.status === BeatmapStatus.Ranked)
    );

    const pendingQuests = await QuestModel
        .find({ status: QuestStatus.Pending })
        .defaultPopulate();

    res.json({
        quests,
        pendingQuests,
    });
});

/* GET users in need of action */
adminRouter.get('/loadActionUsers/', async (req, res) => {
    const allUsers = await UserModel.find({});
    const actionUsers = allUsers.filter(u => u.badge !== u.rank);

    res.json(actionUsers);
});

/* POST update user points */
adminRouter.post('/saveSpentPointsEvent', async (req, res) => {
    let category;
    if (req.body.category == 'acceptQuest') category = SpentPointsCategory.AcceptQuest;
    else if (req.body.category == 'reopenQuest') category = SpentPointsCategory.ReopenQuest;
    else if (req.body.category == 'createQuest') category = SpentPointsCategory.CreateQuest;
    else if (req.body.category == 'extendDeadline') category = SpentPointsCategory.ExtendDeadline;
    else return res.json(defaultErrorMessage);

    const user = await UserModel
        .findOne()
        .byUsernameOrOsuId(req.body.username)
        .orFail(new Error('user changed name probably'));

    const quest = await QuestModel.findById(req.body.questId).orFail();

    SpentPointsModel.generate(category, user._id, quest._id);

    res.json('user points updated');
});

export default adminRouter;
