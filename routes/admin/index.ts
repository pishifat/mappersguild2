import express from 'express';
import { isLoggedIn, isAdmin } from '../../helpers/middlewares';
import { QuestService, Quest } from '../../models/quest';
import { QuestStatus } from '../../interfaces/quest';
import { UserService, User } from '../../models/user';
import { BeatmapService, Beatmap } from '../../models/beatmap/beatmap';
import { BeatmapStatus } from '../../interfaces/beatmap/beatmap';
import { beatmapsetInfo, isOsuResponseError } from '../../helpers/osuApi';
import { canFail, findBeatmapsetId, defaultErrorMessage } from '../../helpers/helpers';
import { SpentPointsCategory } from '../../interfaces/spentPoints';
import { SpentPointsService } from '../../models/spentPoints';

const adminRouter = express.Router();

adminRouter.use(isLoggedIn);
adminRouter.use(isAdmin);

/* GET admin page */
adminRouter.get('/', (req, res) => {
    res.render('admin', {
        title: 'Admin',
        script: 'admin.js',
        loggedInAs: req.session?.osuId,
        userMongoId: req.session?.mongoId,
        pointsInfo: res.locals.userRequest.pointsInfo,
    });
});

/* GET relevant info for page load */
adminRouter.get('/relevantInfo/', canFail(async (req, res) => {
    const allBeatmaps = await BeatmapService.queryAll({
        defaultPopulate: true,
        sort: { status: 1, mode: 1 },
    });
    const actionBeatmaps: Beatmap[] = [];

    if (!BeatmapService.isError(allBeatmaps)) {
        for (let i = 0; i < allBeatmaps.length; i++) {
            const bm = allBeatmaps[i];

            if ((bm.status == BeatmapStatus.Done || bm.status == BeatmapStatus.Qualified) && bm.url) {
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

                    if (bm.status != status) {
                        if (status == 'Qualified' && bm.status == 'Done') {
                            bm.status = BeatmapStatus.Qualified;
                            await BeatmapService.saveOrFail(bm);
                        } else if (status == 'Done' && bm.status == 'Qualified') {
                            bm.status = BeatmapStatus.Done;
                            await BeatmapService.saveOrFail(bm);
                        } else {
                            (bm.status as string) = `${bm.status} (osu: ${status})`;
                            actionBeatmaps.push(bm);
                        }

                    }
                }
            }
        }

    }

    const allQuests = await QuestService.queryAll({
        query: { status: QuestStatus.WIP },
        defaultPopulate: true,
    });
    let actionQuests: Quest[] = [];

    if (!QuestService.isError(allQuests)) {
        for (let i = 0; i < allQuests.length; i++) {
            const q = allQuests[i];
            let valid = true;

            // if no associated maps or not enough associated maps
            if (!q.associatedMaps.length ||
                q.associatedMaps.length < q.requiredMapsets ||
                q.associatedMaps.some(b => b.status != BeatmapStatus.Ranked)) {
                valid = false;
            }

            if (valid) {
                actionQuests.push(q);
            }
        }
    }

    const pendingQuests = await QuestService.queryAll({
        query: { status: QuestStatus.Pending },
        defaultPopulate: true,
    });

    if (!QuestService.isError(pendingQuests)) {
        actionQuests = actionQuests.concat(pendingQuests);
    }

    const allUsers = await UserService.queryAll({});
    const actionUsers: User[] = [];

    if (!UserService.isError(allUsers)) {
        for (let i = 0; i < allUsers.length; i++) {
            const u = allUsers[i];

            if (u.badge != u.rank) {
                actionUsers.push(u);
            }
        }
    }

    res.json({ actionBeatmaps, actionQuests, actionUsers });
}));

/* GET beatmaps in need of action */
adminRouter.get('/loadActionBeatmaps/', canFail(async (req, res) => {
    const allBeatmaps = await BeatmapService.queryAll({
        defaultPopulate: true,
        sort: { status: 1, mode: 1 },
    });
    const actionBeatmaps: Beatmap[] = [];

    if (!BeatmapService.isError(allBeatmaps)) {
        for (let i = 0; i < allBeatmaps.length; i++) {
            const bm = allBeatmaps[i];

            if ((bm.status == BeatmapStatus.Done || bm.status == BeatmapStatus.Qualified) && bm.url) {
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

                    if (bm.status != status) {
                        if (status == 'Qualified' && bm.status == 'Done') {
                            bm.status = BeatmapStatus.Qualified;
                            await BeatmapService.saveOrFail(bm);
                        } else if (status == 'Done' && bm.status == 'Qualified') {
                            bm.status = BeatmapStatus.Done;
                            await BeatmapService.saveOrFail(bm);
                        } else {
                            (bm.status as string) = `${bm.status} (osu: ${status})`;
                            actionBeatmaps.push(bm);
                        }

                    }
                }
            }
        }
    }

    res.json(actionBeatmaps);
}));

/* GET quests in need of action */
adminRouter.get('/loadActionQuests/', canFail(async (req, res) => {
    const allQuests = await QuestService.queryAll({
        query: { status: QuestStatus.WIP },
        defaultPopulate: true,
    });
    let actionQuests: Quest[] = [];

    if (!QuestService.isError(allQuests)) {
        for (let i = 0; i < allQuests.length; i++) {
            const q = allQuests[i];
            let valid = true;

            // if no associated maps or not enough associated maps
            if (!q.associatedMaps.length ||
                q.associatedMaps.length < q.requiredMapsets ||
                q.associatedMaps.some(b => b.status != BeatmapStatus.Ranked)) {
                valid = false;
            }

            if (valid) {
                actionQuests.push(q);
            }
        }
    }

    const pendingQuests = await QuestService.queryAll({
        query: { status: QuestStatus.Pending },
        defaultPopulate: true,
    });

    if (!QuestService.isError(pendingQuests)) {
        actionQuests = actionQuests.concat(pendingQuests);
    }

    res.json(actionQuests);
}));

/* GET users in need of action */
adminRouter.get('/loadActionUsers/', canFail(async (req, res) => {
    const allUsers = await UserService.queryAll({});
    const actionUsers: User[] = [];

    if (!UserService.isError(allUsers)) {
        for (let i = 0; i < allUsers.length; i++) {
            const u = allUsers[i];

            if (u.badge != u.rank) {
                actionUsers.push(u);
            }
        }
    }

    res.json(actionUsers);
}));

/* POST update user points */
adminRouter.post('/saveSpentPointsEvent', canFail(async (req, res) => {
    let category;
    if (req.body.category == 'acceptQuest') category = SpentPointsCategory.AcceptQuest;
    else if (req.body.category == 'reopenQuest') category = SpentPointsCategory.ReopenQuest;
    else if (req.body.category == 'createQuest') category = SpentPointsCategory.CreateQuest;
    else if (req.body.category == 'extendDeadline') category = SpentPointsCategory.ExtendDeadline;
    else return res.json(defaultErrorMessage);

    let rexExp;

    if (req.body.username.indexOf('[') >= 0 || req.body.username.indexOf(']') >= 0) {
        rexExp = new RegExp('^\\' + req.body.username + '$', 'i');
    } else {
        rexExp = new RegExp('^' + req.body.username + '$', 'i');
    }

    const user = await UserService.queryOneOrFail({ query: { username: rexExp } });

    if (!user || UserService.isError(user)) {
        return res.json({ error: 'user changed name probably' });
    }

    const quest = await QuestService.queryByIdOrFail(req.body.questId);

    SpentPointsService.create(category, user._id, quest._id);

    res.json('user points updated');
}));

export default adminRouter;
