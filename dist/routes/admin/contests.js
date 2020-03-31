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
const helpers_1 = require("../../helpers/helpers");
const contest_1 = require("../../models/contest/contest");
const user_1 = require("../../models/user");
const submission_1 = require("../../models/contest/submission");
const adminContestsRouter = express_1.default.Router();
adminContestsRouter.use(middlewares_1.isLoggedIn);
adminContestsRouter.use(middlewares_1.isSuperAdmin);
adminContestsRouter.get('/', (req, res) => {
    var _a, _b;
    res.render('admin/contests', {
        title: 'Contests Admin',
        script: 'adminContests.js',
        loggedInAs: (_a = req.session) === null || _a === void 0 ? void 0 : _a.osuId,
        userMongoId: (_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId,
        pointsInfo: res.locals.userRequest.pointsInfo,
    });
});
adminContestsRouter.get('/relevantInfo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contests = yield contest_1.ContestService.queryAll({
        populate: [
            {
                path: 'submissions',
                populate: [
                    {
                        path: 'evaluations',
                        populate: {
                            path: 'judge',
                        },
                    },
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
    res.json(contests);
}));
adminContestsRouter.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.name) {
        res.json({ error: 'Missing contest name' });
    }
    const contest = yield contest_1.ContestService.create(req.body.name.trim());
    res.json(contest);
}));
adminContestsRouter.post('/:id/toggleActivity', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contest = yield contest_1.ContestService.queryByIdOrFail(req.params.id);
    contest.isActive = !contest.isActive;
    yield contest_1.ContestService.saveOrFail(contest);
    res.json(contest.isActive);
})));
adminContestsRouter.post('/:id/updateContestStart', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newContestStart = new Date(req.body.date);
    if (!(newContestStart instanceof Date && !isNaN(newContestStart.getTime()))) {
        return res.json({ error: 'Invalid date' });
    }
    const contest = yield contest_1.ContestService.queryByIdOrFail(req.params.id);
    contest.contestStart = newContestStart;
    contest_1.ContestService.saveOrFail(contest);
    res.json(newContestStart);
})));
adminContestsRouter.post('/:id/updateJudgingStart', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newJudgingStart = new Date(req.body.date);
    if (!(newJudgingStart instanceof Date && !isNaN(newJudgingStart.getTime()))) {
        return res.json({ error: 'Invalid date' });
    }
    const contest = yield contest_1.ContestService.queryByIdOrFail(req.params.id);
    contest.judgingStart = newJudgingStart;
    contest_1.ContestService.saveOrFail(contest);
    res.json(newJudgingStart);
})));
adminContestsRouter.post('/:id/updateResultsPublished', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newResultsPublished = new Date(req.body.date);
    if (!(newResultsPublished instanceof Date && !isNaN(newResultsPublished.getTime()))) {
        return res.json({ error: 'Invalid date' });
    }
    const contest = yield contest_1.ContestService.queryByIdOrFail(req.params.id);
    contest.resultsPublished = newResultsPublished;
    contest_1.ContestService.saveOrFail(contest);
    res.json(newResultsPublished);
})));
adminContestsRouter.post('/:id/judges/add', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const osuId = parseInt(req.body.osuId, 10);
    const [contest, user] = yield Promise.all([
        contest_1.ContestService.queryByIdOrFail(req.params.id),
        user_1.UserService.queryOneOrFail({ query: { osuId } }),
    ]);
    if (contest.judges.includes(user._id)) {
        return res.json({ error: 'User is already a judge!' });
    }
    contest.judges.push(user._id);
    yield contest_1.ContestService.saveOrFail(contest);
    res.json(user);
})));
adminContestsRouter.post('/:id/judges/remove', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [contest, user] = yield Promise.all([
        contest_1.ContestService.queryByIdOrFail(req.params.id),
        user_1.UserService.queryByIdOrFail(req.body.judgeId),
    ]);
    if (!contest.judges.includes(user._id)) {
        return res.json({ error: 'User is not a judge!' });
    }
    yield contest_1.ContestService.updateOrFail(contest._id, { $pull: { judges: user._id } });
    res.json(user);
})));
adminContestsRouter.post('/:id/submissions/create', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const osuId = parseInt(req.body.osuId, 10);
    const [contest, user] = yield Promise.all([
        contest_1.ContestService.queryByIdOrFail(req.params.id),
        user_1.UserService.queryOneOrFail({ query: { osuId } }),
    ]);
    const submission = yield submission_1.SubmissionService.create(req.body.name, user._id);
    if (submission_1.SubmissionService.isError(submission)) {
        return helpers_1.defaultErrorMessage;
    }
    contest.submissions.push(submission);
    yield contest_1.ContestService.saveOrFail(contest);
    yield submission.populate({
        path: 'creator',
        select: '_id osuId username',
    }).execPopulate();
    res.json(submission);
})));
adminContestsRouter.post('/:id/submissions/:submissionId/delete', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const submission = yield submission_1.SubmissionService.removeOrFail(req.params.submissionId);
    res.json(submission);
})));
adminContestsRouter.post('/submissions/:submissionId/updateCreator', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const osuId = parseInt(req.body.osuId, 10);
    const user = yield user_1.UserService.queryOneOrFail({ query: { osuId } });
    yield submission_1.SubmissionService.updateOrFail(req.params.submissionId, { creator: user.id });
    res.json(user);
})));
adminContestsRouter.post('/:id/voters/update', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
}));
exports.default = adminContestsRouter;
