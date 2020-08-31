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
exports.calculateContestScores = void 0;
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../../helpers/middlewares");
const contest_1 = require("../../models/contest/contest");
const criteria_1 = require("../../models/contest/criteria");
function calculateContestScores(contest) {
    var _a, _b;
    const usersScores = [];
    const judgesCorrel = [];
    const judges = contest === null || contest === void 0 ? void 0 : contest.judges;
    const submissions = contest === null || contest === void 0 ? void 0 : contest.submissions;
    if (!contest || !(submissions === null || submissions === void 0 ? void 0 : submissions.length) || !(judges === null || judges === void 0 ? void 0 : judges.length)) {
        return {
            usersScores,
            judgesCorrel,
        };
    }
    for (const submission of submissions) {
        const userScore = {
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
                }
                else {
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
            for (const userScore of usersScores) {
                judgeSum += ((_a = userScore.judgingSum.find(j => j.judgeId === judgeId)) === null || _a === void 0 ? void 0 : _a.sum) || 0;
            }
            judgeAvg = judgeSum / usersScores.length;
            for (const userScore of usersScores) {
                const judgingSum = userScore.judgingSum.find(j => j.judgeId === judgeId);
                if (judgingSum) {
                    judgeSd += Math.pow(judgingSum.sum - judgeAvg, 2);
                }
            }
            judgeSd = Math.sqrt(judgeSd / usersScores.length);
            for (let i = 0; i < usersScores.length; i++) {
                const j = usersScores[i].judgingSum.findIndex(j => j.judgeId === judgeId);
                if (j !== -1) {
                    const stdScore = (usersScores[i].judgingSum[j].sum - judgeAvg) / judgeSd;
                    usersScores[i].standardizedFinalScore += stdScore;
                    usersScores[i].judgingSum[j].standardized = stdScore;
                    judgeStdSum += stdScore || 0;
                }
            }
            judgesCorrel.push({
                id: judgeId,
                rawAvg: judgeAvg,
                avg: judgeStdSum / usersScores.length,
                sd: judgeSd,
                correl: 0,
            });
        }
        const totalStdAvg = usersScores.reduce((acc, s) => acc + s.standardizedFinalScore, 0) / usersScores.length;
        for (const judgeId of judgesIds) {
            const i = judgesCorrel.findIndex(j => j.id === judgeId);
            const judgeAvg = ((_b = judgesCorrel === null || judgesCorrel === void 0 ? void 0 : judgesCorrel[i]) === null || _b === void 0 ? void 0 : _b.avg) || 0;
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
exports.calculateContestScores = calculateContestScores;
const adminJudgingRouter = express_1.default.Router();
adminJudgingRouter.use(middlewares_1.isLoggedIn);
adminJudgingRouter.use(middlewares_1.isSuperAdmin);
adminJudgingRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contest = yield contest_1.ContestModel
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
    const criterias = yield criteria_1.CriteriaModel.find({});
    const { usersScores, judgesCorrel } = calculateContestScores(contest);
    res.json({
        contest,
        criterias,
        usersScores,
        judgesCorrel,
    });
}));
exports.default = adminJudgingRouter;
