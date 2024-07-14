"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../../helpers/middlewares");
const contest_1 = require("../../models/contest/contest");
const submission_1 = require("../../models/contest/submission");
const criteria_1 = require("../../models/contest/criteria");
const judgingScore_1 = require("../../models/contest/judgingScore");
const judging_1 = require("../../models/contest/judging");
const contest_2 = require("../../../interfaces/contest/contest");
const defaultContestPopulate = [
    {
        path: 'submissions',
        select: '_id name screenings',
        populate: {
            path: 'screenings',
        },
    },
    { path: 'criterias' },
];
const defaultJudgingPopulate = [
    { path: 'submission', select: 'name' },
    {
        path: 'judgingScores',
        populate: {
            path: 'criteria',
        },
    },
];
const judgingRouter = express_1.default.Router();
async function isJudge(req, res, next) {
    const contest = await contest_1.ContestModel
        .findOne({
        status: contest_2.ContestStatus.Judging,
        judges: res.locals.userRequest._id,
        submissions: req.body.submissionId,
    })
        .populate(defaultContestPopulate);
    if (contest) {
        res.locals.contest = contest;
        return next();
    }
    return middlewares_1.unauthorize(req, res);
}
judgingRouter.use(middlewares_1.isLoggedIn);
/* GET page */
judgingRouter.get('/relevantInfo', async (req, res) => {
    const contests = await contest_1.ContestModel
        .find({
        status: contest_2.ContestStatus.Judging,
        judges: res.locals.userRequest._id,
    })
        .populate(defaultContestPopulate)
        .select('_id id name submissions judges download status url judgingThreshold screeningBonus screeningVoteCount');
    const judgingDone = await judging_1.JudgingModel
        .find({
        judge: req.session?.mongoId,
    })
        .populate(defaultJudgingPopulate);
    res.json({
        contests,
        judgingDone,
    });
});
/* GET specific contest from search */
judgingRouter.get('/searchContest/:contestId', async (req, res) => {
    const contest = await contest_1.ContestModel
        .findOne({
        status: contest_2.ContestStatus.Judging,
        judges: res.locals.userRequest._id,
        _id: req.params.contestId,
    })
        .populate(defaultContestPopulate)
        .select('_id id name submissions judges download status url judgingThreshold screeningBonus screeningVoteCount');
    const judgingDone = await judging_1.JudgingModel
        .find({
        judge: req.session?.mongoId,
    })
        .populate(defaultJudgingPopulate);
    res.json({
        contest,
        judgingDone,
    });
});
/* POST save judging */
judgingRouter.post('/save', isJudge, async (req, res) => {
    const { submissionId, criteriaId, score, comment } = req.body;
    const [criteria, submission] = await Promise.all([
        criteria_1.CriteriaModel.findById(criteriaId).orFail(),
        submission_1.SubmissionModel
            .findById(submissionId)
            .populate({
            path: 'contest',
        })
            .orFail(),
    ]);
    const isComment = criteria.name == 'comments';
    let parsedScore;
    if (isComment) {
        parsedScore = 0;
    }
    else {
        parsedScore = parseInt(score, 10);
    }
    if (parsedScore < 0) {
        return res.json({ error: 'Must be positive number or 0' });
    }
    if (submission.contest.id != res.locals.contest.id) {
        return res.json({ error: 'Invalid contest' });
    }
    const contestCriteriaIds = res.locals.contest.criterias.map(c => c.id);
    if (!contestCriteriaIds.includes(criteriaId)) {
        return res.json({ error: 'Invalid criteria' });
    }
    if (parsedScore > criteria.maxScore) {
        return res.json({ error: 'Score is higher than expected' });
    }
    let judging = await judging_1.JudgingModel
        .findOne({
        judge: res.locals.userRequest._id,
        submission: submission._id,
    })
        .populate(defaultJudgingPopulate);
    if (!judging) {
        judging = new judging_1.JudgingModel();
        judging.judge = res.locals.userRequest._id;
        judging.submission = submission._id;
    }
    let judgingScore = judging.judgingScores.find(j => j.criteria._id == criteriaId);
    if (!judgingScore) {
        judgingScore = new judgingScore_1.JudgingScoreModel();
        judgingScore.criteria = criteria;
        judging.judgingScores.push(judgingScore);
    }
    judgingScore.score = parsedScore;
    judgingScore.comment = comment;
    await Promise.all([
        judgingScore.save(),
        judging.save(),
    ]);
    const judgingDone = await judging_1.JudgingModel
        .find({
        judge: req.session?.mongoId,
    })
        .populate(defaultJudgingPopulate);
    res.json({
        judgingDone,
        success: 'Saved!',
    });
});
exports.default = judgingRouter;
