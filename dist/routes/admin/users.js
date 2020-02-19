"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../../helpers/middlewares");
const quest_1 = require("../../interfaces/quest");
const user_1 = require("../../models/user");
const beatmap_1 = require("../../models/beatmap/beatmap");
const beatmap_2 = require("../../interfaces/beatmap/beatmap");
const helpers_1 = require("../../helpers/helpers");
const log_1 = require("../../models/log");
const log_2 = require("../../interfaces/log");
const task_1 = require("../../interfaces/beatmap/task");
const adminUsersRouter = express_1.default.Router();
adminUsersRouter.use(middlewares_1.isLoggedIn);
adminUsersRouter.use(middlewares_1.isAdmin);
adminUsersRouter.use(middlewares_1.isSuperAdmin);
adminUsersRouter.get('/', (req, res) => {
    var _a;
    res.render('admin/users', {
        title: 'Users - Admin',
        script: 'adminUsers.js',
        loggedInAs: (_a = req.session) === null || _a === void 0 ? void 0 : _a.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});
adminUsersRouter.get('/load', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_1.UserService.queryAll({ sort: { username: 1 } });
    res.json(users);
}));
adminUsersRouter.post('/:id/updatePenaltyPoints', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.UserService.updateOrFail(req.params.id, { penaltyPoints: req.body.penaltyPoints });
    res.json(parseInt(req.body.penaltyPoints, 10));
    log_1.LogService.create(req.session.mongoId, `edited penalty points of "${user.username}" to ${req.body.penaltyPoints}`, log_2.LogCategory.User);
})));
adminUsersRouter.post('/:id/updateBadge', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield user_1.UserService.updateOrFail(req.params.id, { badge: req.body.badge });
    res.json(parseInt(req.body.badge, 10));
})));
adminUsersRouter.post('/updatePoints', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const u = yield user_1.UserService.queryAllOrFail({});
    const maps = yield beatmap_1.BeatmapService.queryAll({
        query: { status: beatmap_2.BeatmapStatus.Ranked },
        populate: [
            { path: 'host', select: '_id osuId username' },
            { path: 'modders', select: '_id osuId username' },
            { path: 'quest', select: '_id name status reward completed deadline' },
            { path: 'tasks', populate: { path: 'mappers' } },
        ],
    });
    if (beatmap_1.BeatmapService.isError(maps)) {
        return res.json(helpers_1.defaultErrorMessage);
    }
    u.forEach(user => {
        const pointsObject = {
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
            }
            else if (map.length <= 150) {
                length = ((map.length - 90) / 2) + 90;
            }
            else if (map.length <= 210) {
                length = ((map.length - 150) / 3) + 120;
            }
            else if (map.length <= 270) {
                length = ((map.length - 210) / 4) + 140;
            }
            else {
                length = ((map.length - 270) / 5) + 155;
            }
            const lengthNerf = 124.666;
            map.tasks.forEach(task => {
                task.mappers.forEach(mapper => {
                    if (mapper.id == user.id) {
                        if (task.name != task_1.TaskName.Storyboard) {
                            let questBonus = 0;
                            if (map.quest) {
                                questBonus = 2;
                                questBonus *= (length / lengthNerf);
                                questParticipation = true;
                            }
                            let taskPoints = pointsObject[task.name]['num'];
                            taskPoints *= (length / lengthNerf);
                            pointsObject[task.name]['total'] += (taskPoints + questBonus) / task.mappers.length;
                            pointsObject[task.mode]['total'] += (taskPoints + questBonus) / task.mappers.length;
                        }
                        else {
                            if (task.sbQuality) {
                                if (task.sbQuality == 2) {
                                    pointsObject[task.name]['total'] += 7.5 / task.mappers.length;
                                }
                                else {
                                    pointsObject[task.name]['total'] += (task.sbQuality * task.sbQuality + 1) / task.mappers.length;
                                }
                            }
                        }
                    }
                });
            });
            map.modders.forEach(modder => {
                if (modder.id == user.id) {
                    pointsObject['Mod']['total'] += pointsObject['Mod']['num'];
                }
            });
            if (map.host.id == user.id) {
                pointsObject['Host']['total'] += pointsObject['Host']['num'];
            }
            if (questParticipation) {
                if (pointsObject['Quests']['list'].indexOf(map.quest._id) < 0 && map.quest.status == quest_1.QuestStatus.Done) {
                    pointsObject['Quests']['list'].push(map.quest._id);
                    if (+map.quest.deadline - +map.quest.completed > 0) {
                        pointsObject['QuestReward']['total'] += map.quest.reward;
                    }
                }
            }
        });
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
        }
        else if (totalPoints < 250) {
            pointsObject['Rank']['value'] = 1;
        }
        else if (totalPoints < 500) {
            pointsObject['Rank']['value'] = 2;
        }
        else {
            pointsObject['Rank']['value'] = 3;
        }
        user_1.UserService.update(user._id, {
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
})));
exports.default = adminUsersRouter;
