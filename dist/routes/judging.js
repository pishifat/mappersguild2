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
const judging_1 = require("../models/contest/judging");
const user_1 = require("../interfaces/user");
const helpers_1 = require("../helpers/helpers");
const judgingRouter = express_1.default.Router();
function isJudge(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const contests = yield contest_1.ContestService.queryAll({
            query: {
                isActive: true,
                judges: res.locals.userRequest._id,
            },
            defaultPopulate: true,
            select: '_id name submissions judges',
        });
        if ((!contest_1.ContestService.isError(contests) && contests.length) ||
            res.locals.userRequest.group == user_1.UserGroup.Admin) {
            res.locals.contests = contests;
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
judgingRouter.get('/relevantInfo', (req, res) => {
    var _a;
    res.json({
        contests: res.locals.contests,
        userId: (_a = req.session) === null || _a === void 0 ? void 0 : _a.mongoId,
    });
});
judgingRouter.post('/updateSubmission/:submissionId', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let submission = yield submission_1.SubmissionService.queryByIdOrFail(req.params.submissionId, {
        defaultPopulate: true,
    });
    const userEvaluation = submission.evaluations.find(e => e.judge.id === req.session.mongoId);
    let vote;
    if (req.body.vote !== undefined) {
        vote = parseInt(req.body.vote, 10);
        if (isNaN(vote)) {
            vote = undefined;
        }
    }
    if (!userEvaluation) {
        const j = yield judging_1.JudgingService.create(req.session.mongoId, req.body.comment, vote);
        if (judging_1.JudgingService.isError(j)) {
            return res.json(helpers_1.defaultErrorMessage);
        }
        submission.evaluations.push(j);
        yield submission_1.SubmissionService.saveOrFail(submission);
    }
    else {
        const updatedValues = {};
        if (req.body.comment !== undefined) {
            updatedValues.comment = req.body.comment;
        }
        if (vote !== undefined) {
            updatedValues.vote = vote;
        }
        yield judging_1.JudgingService.update(userEvaluation.id, updatedValues);
    }
    submission = yield submission_1.SubmissionService.queryByIdOrFail(req.params.submissionId, {
        defaultPopulate: true,
    });
    res.json(submission);
})));
exports.default = judgingRouter;
