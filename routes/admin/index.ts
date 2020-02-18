import express from 'express';
import { isLoggedIn, isAdmin } from '../../helpers/middlewares';
import { QuestService, Quest } from '../../models/quest';
import { QuestStatus } from '../../interfaces/quest';
import { UserService, User } from '../../models/user';
import { BeatmapService, Beatmap } from '../../models/beatmap/beatmap';
import { BeatmapStatus } from '../../interfaces/beatmap/beatmap';
import { beatmapsetInfo, isOsuResponseError } from '../../helpers/osuApi';
import { canFail } from '../../helpers/helpers';

const adminRouter = express.Router();

adminRouter.use(isLoggedIn);
adminRouter.use(isAdmin);

/* GET admin page */
adminRouter.get('/', (req, res) => {
    res.render('admin', {
        title: 'Admin',
        script: 'admin.js',
        loggedInAs: req.session?.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
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
                    const indexStart = bm.url.indexOf('beatmapsets/') + 'beatmapsets/'.length;
                    const indexEnd = bm.url.indexOf('#');
                    let bmId;

                    if (indexEnd !== -1) {
                        bmId = bm.url.slice(indexStart, indexEnd);
                    } else {
                        bmId = bm.url.slice(indexStart);
                    }

                    const bmInfo = await beatmapsetInfo(bmId);
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
    const actionQuests: Quest[] = [];

    if (!QuestService.isError(allQuests)) {
        for (let i = 0; i < allQuests.length; i++) {
            const q = allQuests[i];
            let valid = true;

            if (!q.associatedMaps.length) {
                valid = false;
            } else {
                q.associatedMaps.forEach(b => {
                    if (b.status != BeatmapStatus.Ranked) {
                        valid = false;
                    }
                });
            }

            if (valid) {
                actionQuests.push(q);
            }
        }
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
