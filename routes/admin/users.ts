import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';
import { QuestStatus } from '../../interfaces/quest';
import { Points } from '../../interfaces/extras';
import { UserService } from '../../models/user';
import { User } from '../../interfaces/user';
import { BeatmapService } from '../../models/beatmap/beatmap';
import { BeatmapStatus } from '../../interfaces/beatmap/beatmap';
import { canFail, defaultErrorMessage, findLengthNerf, findDifficultyPoints, findQuestBonus, findStoryboardPoints, findQuestPoints } from '../../helpers/helpers';
import { LogService } from '../../models/log';
import { LogCategory } from '../../interfaces/log';
import { TaskName } from '../../interfaces/beatmap/task';
import { ContestService } from '../../models/contest/contest';
import { webhookPost, webhookColors } from '../../helpers/discordApi';

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
        userMongoId: req.session?.mongoId,
        pointsInfo: res.locals.userRequest.pointsInfo,
    });
});

/* GET users */
adminUsersRouter.get('/load', async (req, res) => {
    const users = await UserService.queryAll({ sort: { username: 1 } });

    res.json(users);
});

/* POST update user spent points */
adminUsersRouter.post('/:id/updateSpentPoints', canFail(async (req, res) => {
    const user = await UserService.updateOrFail(req.params.id, { spentPoints: req.body.spentPoints });

    res.json(parseInt(req.body.spentPoints, 10));

    LogService.create(req.session.mongoId, `edited spent points of "${user.username}" to ${req.body.spentPoints}`, LogCategory.User);
}));

/* POST update user badge */
adminUsersRouter.post('/:id/updateBadge', canFail(async (req, res) => {
    const badge = parseInt(req.body.badge, 10);
    const user = await UserService.updateOrFail(req.params.id, { badge });

    res.json(badge);

    let rankColor = webhookColors.white;

    if (badge == 1) {
        rankColor = webhookColors.brown;
    } else if (badge == 2) {
        rankColor = webhookColors.gray;
    } else if (badge == 3) {
        rankColor = webhookColors.lightYellow;
    }

    webhookPost([{
        author: {
            name: user.username,
            icon_url: `https://a.ppy.sh/${user.osuId}`,
            url: `https://osu.ppy.sh/u/${user.osuId}`,
        },
        color: rankColor,
        description: `**Reached rank ${badge}** with ${user.totalPoints} total points`,
    }]);
}));

/* POST update user points */
adminUsersRouter.post('/updatePoints', canFail(async (req, res) => {
    const u = await UserService.queryAllOrFail({});

    const maps = await BeatmapService.queryAll({
        query: { status: BeatmapStatus.Ranked },
        populate: [
            { path: 'host',  select: '_id osuId username' },
            { path: 'modders',  select: '_id osuId username' },
            { path: 'quest',  select: '_id name status price completed deadline' },
            { path: 'tasks',  populate: { path: 'mappers' } },
        ],
    });

    const contests = await ContestService.queryAll({
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

    if (BeatmapService.isError(maps) || ContestService.isError(contests)) {
        return res.json(defaultErrorMessage);
    }

    // contest prep
    const contestParticipantIds: User['id'][] = [];
    const contestJudgeIds: User['id'][] = [];
    const contestVoteIds: User['id'][] = [];

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

    // process each user
    u.forEach(user => {
        const pointsObject: Points = {
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

        // process each map for each user (yes, this means it loops through every map hundreds of times and is terrible)
        maps.forEach(map => {
            let questParticipation = false;
            const lengthNerf = findLengthNerf(map.length);

            //task points
            map.tasks.forEach(task => {
                task.mappers.forEach(mapper => {
                    if (mapper.id == user.id) {
                        if (task.name != TaskName.Storyboard) {
                            const taskPoints = findDifficultyPoints(task.name, task.mappers.length);
                            let questBonus = 0;

                            if (map.quest) {
                                questBonus = findQuestBonus(map.quest.status, map.quest.deadline, map.rankedDate, task.mappers.length);

                                if (questBonus) {
                                    questParticipation = true;
                                }
                            }

                            const finalPoints = ((taskPoints + questBonus)*lengthNerf);

                            pointsObject[task.name] += finalPoints;
                            pointsObject[task.mode] += finalPoints;
                        } else {
                            const taskPoints = findStoryboardPoints(task.sbQuality);
                            pointsObject[task.name] += taskPoints;
                        }
                    }
                });
            });

            //mod points
            map.modders.forEach(modder => {
                if (modder.id == user.id) {
                    pointsObject['Mod'] += 1;
                }
            });

            //host points
            if (map.host.id == user.id) {
                pointsObject['Host'] += 5;
            }

            //quest reward points
            if (questParticipation) {
                if (pointsObject['Quests'].indexOf(map.quest._id) < 0 && map.quest.status == QuestStatus.Done) {
                    pointsObject['Quests'].push(map.quest._id);
                    const questPoints = findQuestPoints(map.quest.deadline, map.quest.completed, map.rankedDate);

                    pointsObject['QuestReward'] += questPoints;
                }
            }
        });

        //contest
        contests.forEach(contest => {
            //participation
            if (contestParticipantIds.includes(user.id)) {
                contest.submissions.forEach(submission => {
                    if (submission.creator.id == user.id && user.osuId != 3178418) {
                        pointsObject['ContestParticipant'] += 5;
                    }
                });
            }

            //judge
            if (contestJudgeIds.includes(user.id)) {
                contest.judges.forEach(judge => {
                    if (judge.id == user.id) {
                        pointsObject['ContestJudge'] += 1;
                    }
                });
            }

            //vote
            if (contestVoteIds.includes(user.id)) {
                contest.voters.forEach(voter => {
                    if (voter.id == user.id) {
                        pointsObject['ContestVote'] += 1;
                    }
                });
            }
        });

        //set rank
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
        } else if (totalPoints < 250) {
            pointsObject['Rank'] = 1;
        } else if (totalPoints < 500) {
            pointsObject['Rank'] = 2;
        } else {
            pointsObject['Rank'] = 3;
        }

        UserService.update(user._id, {
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
}));

export default adminUsersRouter;
