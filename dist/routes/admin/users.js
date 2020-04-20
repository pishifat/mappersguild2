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
const contest_1 = require("../../models/contest/contest");
const discordApi_1 = require("../../helpers/discordApi");
const adminUsersRouter = express_1.default.Router();
adminUsersRouter.use(middlewares_1.isLoggedIn);
adminUsersRouter.use(middlewares_1.isAdmin);
adminUsersRouter.use(middlewares_1.isSuperAdmin);
adminUsersRouter.get('/', (req, res) => {
    var _a, _b;
    res.render('admin/users', {
        title: 'Users - Admin',
        script: 'adminUsers.js',
        loggedInAs: (_a = req.session) === null || _a === void 0 ? void 0 : _a.osuId,
        userMongoId: (_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId,
        pointsInfo: res.locals.userRequest.pointsInfo,
    });
});
adminUsersRouter.get('/load', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_1.UserService.queryAll({ sort: { username: 1 } });
    res.json(users);
}));
adminUsersRouter.post('/:id/updateSpentPoints', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.UserService.updateOrFail(req.params.id, { spentPoints: req.body.spentPoints });
    res.json(parseInt(req.body.spentPoints, 10));
    log_1.LogService.create(req.session.mongoId, `edited spent points of "${user.username}" to ${req.body.spentPoints}`, log_2.LogCategory.User);
})));
adminUsersRouter.post('/:id/updateBadge', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const badge = parseInt(req.body.badge, 10);
    const user = yield user_1.UserService.updateOrFail(req.params.id, { badge });
    res.json(badge);
    let rankColor = discordApi_1.webhookColors.white;
    if (badge == 1) {
        rankColor = discordApi_1.webhookColors.brown;
    }
    else if (badge == 2) {
        rankColor = discordApi_1.webhookColors.gray;
    }
    else if (badge == 3) {
        rankColor = discordApi_1.webhookColors.lightYellow;
    }
    discordApi_1.webhookPost([{
            author: {
                name: user.username,
                icon_url: `https://a.ppy.sh/${user.osuId}`,
                url: `https://osu.ppy.sh/u/${user.osuId}`,
            },
            color: rankColor,
            description: `**Reached rank ${badge}** with ${user.totalPoints} total points`,
        }]);
})));
adminUsersRouter.post('/updatePoints', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const u = yield user_1.UserService.queryAllOrFail({});
    const maps = yield beatmap_1.BeatmapService.queryAll({
        query: { status: beatmap_2.BeatmapStatus.Ranked },
        populate: [
            { path: 'host', select: '_id osuId username' },
            { path: 'modders', select: '_id osuId username' },
            { path: 'quest', select: '_id name status price completed deadline' },
            { path: 'tasks', populate: { path: 'mappers' } },
        ],
    });
    const contests = yield contest_1.ContestService.queryAll({
        populate: [
            {
                path: 'submissions',
                populate: [
                    {
                        path: 'creator',
                        select: '_id osuId username',
                    },
                ],
            },
            {
                path: 'judges',
            },
            {
                path: 'voters',
            },
        ],
        defaultSort: true,
    });
    if (beatmap_1.BeatmapService.isError(maps) || contest_1.ContestService.isError(contests)) {
        return res.json(helpers_1.defaultErrorMessage);
    }
    const contestParticipantIds = [];
    const contestJudgeIds = [];
    const contestVoteIds = [];
    contests.forEach(contest => {
        contest.submissions.forEach(submission => {
            if (submission.creator.osuId != 3178418) {
                contestParticipantIds.push(submission.creator.id);
            }
        });
        contest.judges.forEach(judge => {
            if (judge.osuId != 3178418) {
                contestJudgeIds.push(judge.id);
            }
        });
        contest.voters.forEach(voter => {
            contestVoteIds.push(voter.id);
        });
    });
    u.forEach(user => {
        const pointsObject = {
            Easy: 0,
            Normal: 0,
            Hard: 0,
            Insane: 0,
            Expert: 0,
            Storyboard: 0,
            Mod: 0,
            Host: 0,
            QuestReward: 0,
            Rank: 0,
            osu: 0,
            taiko: 0,
            catch: 0,
            mania: 0,
            ContestParticipant: 0,
            ContestJudge: 0,
            ContestVote: 0,
            Quests: [],
        };
        maps.forEach(map => {
            let questParticipation = false;
            const lengthNerf = helpers_1.findLengthNerf(map.length);
            map.tasks.forEach(task => {
                task.mappers.forEach(mapper => {
                    if (mapper.id == user.id) {
                        if (task.name != task_1.TaskName.Storyboard) {
                            const taskPoints = helpers_1.findDifficultyPoints(task.name, task.mappers.length);
                            let questBonus = 0;
                            if (map.quest) {
                                questBonus = helpers_1.findQuestBonus(map.quest.status, map.quest.deadline, map.rankedDate, task.mappers.length);
                                if (questBonus) {
                                    questParticipation = true;
                                }
                            }
                            const finalPoints = ((taskPoints + questBonus) * lengthNerf);
                            pointsObject[task.name] += finalPoints;
                            pointsObject[task.mode] += finalPoints;
                        }
                        else {
                            const taskPoints = helpers_1.findStoryboardPoints(task.sbQuality);
                            pointsObject[task.name] += taskPoints;
                        }
                    }
                });
            });
            map.modders.forEach(modder => {
                if (modder.id == user.id) {
                    pointsObject['Mod'] += 1;
                }
            });
            if (map.host.id == user.id) {
                pointsObject['Host'] += 5;
            }
            if (questParticipation) {
                if (pointsObject['Quests'].indexOf(map.quest._id) < 0 && map.quest.status == quest_1.QuestStatus.Done) {
                    pointsObject['Quests'].push(map.quest._id);
                    const questPoints = helpers_1.findQuestPoints(map.quest.deadline, map.quest.completed, map.rankedDate);
                    pointsObject['QuestReward'] += questPoints;
                }
            }
        });
        contests.forEach(contest => {
            if (contestParticipantIds.includes(user.id)) {
                contest.submissions.forEach(submission => {
                    if (submission.creator.id == user.id && user.osuId != 3178418) {
                        pointsObject['ContestParticipant'] += 5;
                    }
                });
            }
            if (contestJudgeIds.includes(user.id)) {
                contest.judges.forEach(judge => {
                    if (judge.id == user.id) {
                        pointsObject['ContestJudge'] += 1;
                    }
                });
            }
            if (contestVoteIds.includes(user.id)) {
                contest.voters.forEach(voter => {
                    if (voter.id == user.id) {
                        pointsObject['ContestVote'] += 1;
                    }
                });
            }
        });
        const totalPoints = pointsObject['Easy'] +
            pointsObject['Normal'] +
            pointsObject['Hard'] +
            pointsObject['Insane'] +
            pointsObject['Expert'] +
            pointsObject['Storyboard'] +
            pointsObject['Mod'] +
            pointsObject['Host'] +
            pointsObject['QuestReward'] +
            pointsObject['ContestParticipant'] +
            pointsObject['ContestJudge'] +
            pointsObject['ContestVote'];
        if (totalPoints < 100) {
            pointsObject['Rank'] = 0;
        }
        else if (totalPoints < 250) {
            pointsObject['Rank'] = 1;
        }
        else if (totalPoints < 500) {
            pointsObject['Rank'] = 2;
        }
        else {
            pointsObject['Rank'] = 3;
        }
        user_1.UserService.update(user._id, {
            easyPoints: pointsObject['Easy'],
            normalPoints: pointsObject['Normal'],
            hardPoints: pointsObject['Hard'],
            insanePoints: pointsObject['Insane'],
            expertPoints: pointsObject['Expert'],
            storyboardPoints: pointsObject['Storyboard'],
            modPoints: pointsObject['Mod'],
            hostPoints: pointsObject['Host'],
            questPoints: pointsObject['QuestReward'],
            rank: pointsObject['Rank'],
            osuPoints: pointsObject['osu'],
            taikoPoints: pointsObject['taiko'],
            catchPoints: pointsObject['catch'],
            maniaPoints: pointsObject['mania'],
            contestParticipantPoints: pointsObject['ContestParticipant'],
            contestJudgePoints: pointsObject['ContestJudge'],
            contestVotePoints: pointsObject['ContestVote'],
            completedQuests: pointsObject['Quests'],
        });
    });
    console.log('done');
    res.json('user points updated');
})));
exports.default = adminUsersRouter;
