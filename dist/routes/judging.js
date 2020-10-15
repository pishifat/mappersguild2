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
const middlewares_1 = require("../helpers/middlewares");
const contest_1 = require("../models/contest/contest");
const submission_1 = require("../models/contest/submission");
const criteria_1 = require("../models/contest/criteria");
const judgingScore_1 = require("../models/contest/judgingScore");
const judging_1 = require("../models/contest/judging");
const contest_2 = require("../interfaces/contest/contest");
const defaultContestPopulate = {
    path: 'submissions',
    select: '_id name evaluations',
    populate: {
        path: 'evaluations',
    },
};
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
function isJudge(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = contest_1.ContestModel
            .findOne({
            status: contest_2.ContestStatus.Judging,
            judges: res.locals.userRequest._id,
        })
            .populate(defaultContestPopulate);
        const contest = yield query.exec();
        if (contest) {
            res.locals.contest = contest;
            return next();
        }
        return res.redirect('/');
    });
}
judgingRouter.use(middlewares_1.isLoggedIn);
judgingRouter.use(isJudge);
judgingRouter.get('/', (req, res) => {
    var _a, _b;
    res.render('judging', {
        title: 'Judging',
        script: 'judging.js',
        loggedInAs: (_a = req.session) === null || _a === void 0 ? void 0 : _a.osuId,
        userMongoId: (_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId,
        pointsInfo: res.locals.userRequest.pointsInfo,
    });
});
judgingRouter.get('/relevantInfo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const contest = res.locals.contest;
    let criteriaQuery;
    if (contest.isTheme) {
        criteriaQuery = { name: { $ne: 'limitation' } };
    }
    else {
        criteriaQuery = { name: { $ne: 'theme' } };
    }
    const [criterias, judgingDone] = yield Promise.all([
        criteria_1.CriteriaModel.find(criteriaQuery),
        judging_1.JudgingModel
            .find({
            judge: (_a = req.session) === null || _a === void 0 ? void 0 : _a.mongoId,
        })
            .populate(defaultJudgingPopulate),
    ]);
    res.json({
        contest,
        criterias,
        judgingDone,
    });
}));
judgingRouter.post('/save', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { submissionId, criteriaId, score, comment } = req.body;
    const [criteria, submission] = yield Promise.all([
        criteria_1.CriteriaModel.findById(criteriaId).orFail(),
        submission_1.SubmissionModel
            .findById(submissionId)
            .populate({
            path: 'contest',
        })
            .orFail(),
    ]);
    const parsedScore = parseInt(score, 10);
    if (submission.contest.id != res.locals.contest.id) {
        return res.json({ error: 'woah' });
    }
    if (score > criteria.maxScore) {
        return res.json({ error: 'Score is higher than expected' });
    }
    let judging = yield judging_1.JudgingModel
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
    yield Promise.all([
        judgingScore.save(),
        judging.save(),
    ]);
    const judgingDone = yield judging_1.JudgingModel
        .find({
        judge: (_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId,
    })
        .populate(defaultJudgingPopulate);
    res.json({
        judgingDone,
        success: 'Saved!',
    });
}));
exports.default = judgingRouter;
