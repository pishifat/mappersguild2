import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';
import { QuestStatus } from '../../interfaces/quest';
import { UserService } from '../../models/user';
import { BeatmapService } from '../../models/beatmap/beatmap';
import { BeatmapStatus } from '../../interfaces/beatmap/beatmap';
import { canFail, defaultErrorMessage } from '../../helpers/helpers';
import { LogService } from '../../models/log';
import { LogCategory } from '../../interfaces/log';
import { TaskName } from '../../interfaces/beatmap/task';

const adminUsersRouter = express.Router();

adminUsersRouter.use(isLoggedIn);
adminUsersRouter.use(isAdmin);
adminUsersRouter.use(isSuperAdmin);

/* GET users - admin page */
adminUsersRouter.get('/', (req, res) => {
    res.render('admin/users', {
        title: 'Users - Admin',
        script: 'adminUsers.js',
        loggedInAs: req.session?.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});

/* GET users */
adminUsersRouter.get('/load', async (req, res) => {
    const users = await UserService.queryAll({ sort: { username: 1 } });

    res.json(users);
});

/* POST update user penatly points */
adminUsersRouter.post('/:id/updatePenaltyPoints', canFail(async (req, res) => {
    const user = await UserService.updateOrFail(req.params.id, { penaltyPoints: req.body.penaltyPoints });

    res.json(parseInt(req.body.penaltyPoints));

    LogService.create(req.session.mongoId, `edited penalty points of "${user.username}" to ${req.body.penaltyPoints}`, LogCategory.User);
}));

/* POST update user badge */
adminUsersRouter.post('/:id/updateBadge', canFail(async (req, res) => {
    await UserService.updateOrFail(req.params.id, { badge: req.body.badge });

    res.json(parseInt(req.body.badge));
}));

interface PointsValues {
    num: number;
    total: number;
}

interface Points {
    Easy: PointsValues;
    Normal: PointsValues;
    Hard: PointsValues;
    Insane: PointsValues;
    Expert: PointsValues;
    Storyboard: PointsValues;
    Mod: PointsValues;
    Host: PointsValues;
    QuestReward: PointsValues;
    Rank: { value: number };
    osu: { total: number };
    taiko: { total: number };
    catch: { total: number };
    mania: { total: number };
    Quests: {
        list: string[];
    };
}

/* POST update user points */
adminUsersRouter.post('/updatePoints', canFail(async (req, res) => {
    const u = await UserService.queryAllOrFail({});

    const maps = await BeatmapService.queryAll({
        query: { status: BeatmapStatus.Ranked },
        populate: [
            { path: 'host',  select: '_id osuId username' },
            { path: 'modders',  select: '_id osuId username' },
            { path: 'quest',  select: '_id name status reward completed deadline' },
            { path: 'tasks',  populate: { path: 'mappers' } },
        ],
    });

    if (BeatmapService.isError(maps)) {
        return res.json(defaultErrorMessage);
    }

    u.forEach(user => {
        console.log(user.username);
        const pointsObject: Points = {
            Easy: { num: 5, total: 0 },
            Normal: { num: 6, total: 0 },
            Hard: { num: 7, total: 0 },
            Insane: { num: 8, total: 0 },
            Expert: { num: 8, total: 0 },
            Storyboard: { num: 10, total: 0 },
            Mod: { num: 1, total: 0 },
            Host: { num: 5, total: 0 },
            QuestReward: { num: 0, total: 0 },
            Rank: { value: 0 },
            osu: { total: 0 },
            taiko: { total: 0 },
            catch: { total: 0 },
            mania: { total: 0 },
            Quests: {
                list: [],
            },
        };
        maps.forEach(map => {
            let questParticipation = false;
            let length;

            if (map.length <= 90) {
                length = map.length;
            } else if (map.length <= 150) {
                length = ((map.length - 90) / 2) + 90;
            } else if (map.length <= 210) {
                length = ((map.length - 150) / 3) + 120;
            } else if (map.length <= 270) {
                length = ((map.length - 210) / 4) + 140;
            } else {
                length = ((map.length - 270) / 5) + 155;
            }

            const lengthNerf = 124.666; //130=3:00, 120=2:30, 124.666=median of all ranked mg maps (2:43)

            //task points
            map.tasks.forEach(task => {
                task.mappers.forEach(mapper => {
                    if (mapper.id == user.id) {
                        if (task.name != TaskName.Storyboard) {
                            let questBonus = 0;

                            if (map.quest) {
                                questBonus = 2;
                                questBonus *= (length/lengthNerf);
                                questParticipation = true;
                            }

                            let taskPoints = pointsObject[task.name]['num'];
                            taskPoints *= (length/lengthNerf);
                            pointsObject[task.name]['total'] += (taskPoints + questBonus) / task.mappers.length;
                            pointsObject[task.mode]['total'] += (taskPoints + questBonus) / task.mappers.length;
                        } else {
                            if (task.sbQuality) {
                                if (task.sbQuality == 2) {
                                    pointsObject[task.name]['total'] += 7.5 / task.mappers.length;
                                } else {
                                    pointsObject[task.name]['total'] += (task.sbQuality * task.sbQuality + 1) / task.mappers.length; //sb worth 2 or 10
                                }

                            }

                        }

                    }
                });
            });

            //mod points
            map.modders.forEach(modder => {
                if (modder.id == user.id) {
                    pointsObject['Mod']['total'] += pointsObject['Mod']['num'];
                }
            });

            //host points
            if (map.host.id == user.id) {
                pointsObject['Host']['total'] += pointsObject['Host']['num'];
            }

            //quest reward points
            if (questParticipation) {
                if (pointsObject['Quests']['list'].indexOf(map.quest._id) < 0 && map.quest.status == QuestStatus.Done) {
                    pointsObject['Quests']['list'].push(map.quest._id);

                    if (+map.quest.deadline - +map.quest.completed > 0) {
                        pointsObject['QuestReward']['total'] += map.quest.reward;
                    }
                }
            }
        });

        //set rank
        const totalPoints = pointsObject['Easy']['total'] +
            pointsObject['Normal']['total'] +
            pointsObject['Hard']['total'] +
            pointsObject['Insane']['total'] +
            pointsObject['Expert']['total'] +
            pointsObject['Storyboard']['total'] +
            pointsObject['Mod']['total'] +
            pointsObject['Host']['total'] +
            pointsObject['QuestReward']['total'] +
            user.legacyPoints - user.penaltyPoints;

        if (totalPoints < 100) {
            pointsObject['Rank']['value'] = 0;
        } else if (totalPoints < 250) {
            pointsObject['Rank']['value'] = 1;
        } else if (totalPoints < 500) {
            pointsObject['Rank']['value'] = 2;
        } else {
            pointsObject['Rank']['value'] = 3;
        }

        UserService.update(user._id, {
            easyPoints: pointsObject['Easy']['total'],
            normalPoints: pointsObject['Normal']['total'],
            hardPoints: pointsObject['Hard']['total'],
            insanePoints: pointsObject['Insane']['total'],
            expertPoints: pointsObject['Expert']['total'],
            storyboardPoints: pointsObject['Storyboard']['total'],
            modPoints: pointsObject['Mod']['total'],
            hostPoints: pointsObject['Host']['total'],
            questPoints: pointsObject['QuestReward']['total'],
            rank: pointsObject['Rank']['value'],
            osuPoints: pointsObject['osu']['total'],
            taikoPoints: pointsObject['taiko']['total'],
            catchPoints: pointsObject['catch']['total'],
            maniaPoints: pointsObject['mania']['total'],
            completedQuests: pointsObject['Quests']['list'],
        });
    });

    res.json('user points updated');
}));

export default adminUsersRouter;
