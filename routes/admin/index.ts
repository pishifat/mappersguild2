import express from 'express';
import { isLoggedIn, isAdmin } from '../../helpers/middlewares';
import { QuestService, Quest } from '../../models/quest';
import { QuestStatus } from '../../interfaces/quest';
import { UserService, User } from '../../models/user';
import { BeatmapService, Beatmap } from '../../models/beatmap/beatmap';
import { BeatmapStatus } from '../../interfaces/beatmap/beatmap';
import { beatmapsetInfo, isOsuResponseError } from '../../helpers/osuApi';
import { canFail, findBeatmapsetId } from '../../helpers/helpers';

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

export default adminRouter;
