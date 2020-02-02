import express from 'express';
import { isLoggedIn, isAdmin } from '../../helpers/middlewares';
import { QuestService, Quest, QuestStatus } from '../../models/quest';
import { UserService, User } from '../../models/user';
import { BeatmapService, Beatmap, BeatmapStatus } from '../../models/beatmap/beatmap';
import { LogService } from '../../models/log';
import { beatmapsetInfo, isOsuReponseError } from '../../helpers/osuApi';

const adminRouter = express.Router();

adminRouter.use(isLoggedIn);
adminRouter.use(isAdmin);

/* GET admin page */
adminRouter.get('/', (req, res) => {
    res.render('admin', {
        title: 'Admin',
        script: '../javascripts/admin.js',
        loggedInAs: req.session?.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});

/* GET relevant info for page load */
adminRouter.get('/relevantInfo/', async (req, res) => {
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

                    if (!isOsuReponseError(bmInfo)) {
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
                            await BeatmapService.update(bm.id, { status: 'Qualified' });
                        } else if (status == 'Done' && bm.status == 'Qualified') {
                            await BeatmapService.update(bm.id, { status: 'Done' });
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
                (q.status as string) = 'wip: all Ranked';
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
});

/* GET news info */
adminRouter.get('/loadNewsInfo/:date', async (req, res) => {
    if (isNaN(Date.parse(req.params.date))) {
        return res.json( { error: 'Invalid date' } );
    }

    const date = new Date(req.params.date);

    const [b, q] = await Promise.all([
        BeatmapService.queryAll({
            query: {
                updatedAt: { $gte: date },
                status: BeatmapStatus.Ranked,
                $or: [
                    { quest: { $exists: false } },
                    { quest: { $eq: null } },
                ],
            },
            defaultPopulate: true,
            sort: { mode: 1, createdAt: -1 },
        }),
        QuestService.queryAll({
            query: { completed: { $gte: date } },
            defaultPopulate: true,
            sort: { name: 1 },
        }),
    ]);

    res.json({ beatmaps: b, quests: q });
});

/* GET errors */
adminRouter.get('/loadErrors/', async (req, res) => {
    const e = await LogService.queryAll({
        query: { category: 'error' },
        populate: [{ path: 'user', select: 'username' }],
        sort: { createdAt: -1 },
        limit: 100,
    });

    res.json({ e });
});

export default adminRouter;
