import express from 'express';
import { isLoggedIn, isSuperAdmin } from '../../helpers/middlewares';
import { ContestModel, Contest } from '../../models/contest/contest';
import { CriteriaModel } from '../../models/contest/criteria';
import { UserScore, JudgeCorrel } from '../../interfaces/contest/judging';

export function calculateContestScores(contest?: Contest): { usersScores: UserScore[]; judgesCorrel: JudgeCorrel[] } {
    const usersScores: UserScore[] = [];
    const judgesCorrel: JudgeCorrel[] = [];
    const judges = contest?.judges;
    const submissions = contest?.submissions;

    if (!contest || !submissions?.length || !judges?.length) {
        return {
            usersScores,
            judgesCorrel,
        };
    }

    for (const submission of submissions) {
        const userScore: UserScore = {
            creator: submission.creator,
            criteriaSum: [],
            judgingSum: [],
            rawFinalScore: 0,
            standardizedFinalScore: 0,
        };

        for (const judging of submission.judgings) {
            let judgeSum = 0;

            for (const judgingScore of judging.judgingScores) {
                judgeSum += judgingScore.score;
                const i = userScore.criteriaSum.findIndex(j => j.criteriaId === judgingScore.criteria.id);

                if (i !== -1) {
                    userScore.criteriaSum[i].sum += judgingScore.score;
                } else {
                    userScore.criteriaSum.push({
                        criteriaId: judgingScore.criteria.id,
                        sum: judgingScore.score,
                        name: judgingScore.criteria.name,
                    });
                }
            }

            userScore.judgingSum.push({
                judgeId: judging.judge.id,
                sum: judgeSum,
                standardized: 0,
            });
        }

        userScore.rawFinalScore = userScore.criteriaSum.reduce((acc, c) => acc + c.sum, 0);
        usersScores.push(userScore);
    }

    if (usersScores.length) {
        const judgesIds = judges.map(j => j.id);

        for (const judgeId of judgesIds) {
            let judgeSum = 0;
            let judgeAvg = 0;
            let judgeSd = 0;
            let judgeStdSum = 0;

            // Get score avg for the current judge
            for (const userScore of usersScores) {
                judgeSum += userScore.judgingSum.find(j => j.judgeId === judgeId)?.sum || 0;
            }

            judgeAvg = judgeSum / usersScores.length;

            // Get SD for the current judge
            for (const userScore of usersScores) {
                const judgingSum = userScore.judgingSum.find(j => j.judgeId === judgeId);

                if (judgingSum) {
                    judgeSd += Math.pow(judgingSum.sum - judgeAvg, 2);
                }
            }

            judgeSd = Math.sqrt(judgeSd / usersScores.length);

            // Set standard score for each entry for the current judge
            for (let i = 0; i < usersScores.length; i++) {
                const j = usersScores[i].judgingSum.findIndex(j => j.judgeId === judgeId);

                if (j !== -1) {
                    // S* = S - S(avg) / SD
                    const stdScore = (usersScores[i].judgingSum[j].sum - judgeAvg) / judgeSd;
                    usersScores[i].standardizedFinalScore += stdScore;
                    usersScores[i].judgingSum[j].standardized = stdScore;
                    judgeStdSum += stdScore || 0;
                }
            }

            // Set standard score average for the current judge
            judgesCorrel.push({
                id: judgeId,
                rawAvg: judgeAvg,
                avg: judgeStdSum / usersScores.length,
                sd: judgeSd,
                correl: 0,
            });
        }

        // Get final standard scores average
        const totalStdAvg = usersScores.reduce((acc, s) => acc + s.standardizedFinalScore, 0) / usersScores.length;

        // Set correlation coefficient per judge
        for (const judgeId of judgesIds) {
            const i = judgesCorrel.findIndex(j => j.id === judgeId);
            const judgeAvg = judgesCorrel?.[i]?.avg || 0;

            let sum1 = 0;
            let sum2 = 0;
            let sum3 = 0;

            for (const teamScore of usersScores) {
                const judgingSum = teamScore.judgingSum.find(j => j.judgeId === judgeId);

                if (judgingSum) {
                    const x = (judgingSum.standardized - judgeAvg);
                    const y = (teamScore.standardizedFinalScore - totalStdAvg);
                    sum1 += x * y;
                    sum2 += Math.pow(x, 2);
                    sum3 += Math.pow(y, 2);
                }
            }

            judgesCorrel[i].correl = sum1 / (Math.sqrt(sum2 * sum3));
        }
    }

    usersScores.sort((a, b) => b.standardizedFinalScore - a.standardizedFinalScore);

    return {
        usersScores,
        judgesCorrel,
    };
}

const adminJudgingRouter = express.Router();

adminJudgingRouter.use(isLoggedIn);
adminJudgingRouter.use(isSuperAdmin);

/* GET contest - admin page */
adminJudgingRouter.get('/:id', async (req, res) => {
    // TODO filter top X from screening
    const contest = await ContestModel
        .findById(req.params.id)
        .populate([
            {
                path: 'submissions',
                populate: {
                    path: 'judgings creator evaluations',
                    populate: {
                        path: 'judgingScores judge',
                        populate: {
                            path: 'criteria',
                        },
                    },
                },
            },
            { path: 'judges' },
        ])
        .orFail();

    const filteredSubmissions = [...contest.submissions].filter(submission => {
        let total = 0;

        submission.evaluations.forEach(e => {
            total += e.vote;
        });

        return total >= contest.judgingThreshold;
    });

    contest.submissions = filteredSubmissions;

    const criterias = await CriteriaModel.find({});
    const { usersScores, judgesCorrel } = calculateContestScores(contest);

    res.json({
        contest,
        criterias,
        usersScores,
        judgesCorrel,
    });
});

export default adminJudgingRouter;
