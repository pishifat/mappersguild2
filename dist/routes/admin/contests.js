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
const fs_1 = __importDefault(require("fs"));
const middlewares_1 = require("../../helpers/middlewares");
const contest_1 = require("../../models/contest/contest");
const user_1 = require("../../models/user");
const user_2 = require("../../interfaces/user");
const submission_1 = require("../../models/contest/submission");
const osuApi_1 = require("../../helpers/osuApi");
const criteria_1 = require("../../models/contest/criteria");
const points_1 = require("../../helpers/points");
const contest_2 = require("../../interfaces/contest/contest");
const adminContestsRouter = express_1.default.Router();
adminContestsRouter.use(middlewares_1.isLoggedIn);
adminContestsRouter.use(middlewares_1.isSuperAdmin);
const defaultContestPopulate = [
    {
        path: 'submissions',
        populate: [
            {
                path: 'evaluations',
                populate: {
                    path: 'screener',
                },
            },
            {
                path: 'creator',
                select: '_id osuId username',
            },
        ],
    },
    {
        path: 'screeners',
    },
    {
        path: 'judges',
    },
    {
        path: 'criterias',
    },
];
adminContestsRouter.get('/relevantInfo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contests = yield contest_1.ContestModel
        .find({})
        .populate(defaultContestPopulate)
        .sort({ contestStart: -1 });
    res.json(contests);
}));
adminContestsRouter.get('/criterias', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const criterias = yield criteria_1.CriteriaModel.find({});
    res.json({ criterias });
}));
adminContestsRouter.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.name) {
        return res.json({ error: 'Missing contest name' });
    }
    const contest = new contest_1.ContestModel();
    contest.name = req.body.name.trim();
    yield contest.save();
    res.json(contest);
}));
adminContestsRouter.post('/addCriteria', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, maxScore } = req.body;
    if (!name || !name.length) {
        return res.json({ error: 'Invalid name' });
    }
    if (isNaN(maxScore)) {
        return res.json({ error: 'Invalid maxScore' });
    }
    const criteria = new criteria_1.CriteriaModel();
    criteria.name = name;
    criteria.maxScore = maxScore;
    yield criteria.save();
    const allCriteria = yield criteria_1.CriteriaModel.find({});
    res.json(allCriteria);
}));
adminContestsRouter.post('/:id/updateStatus', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contest = yield contest_1.ContestModel
        .findByIdAndUpdate(req.params.id, { status: req.body.status })
        .populate(defaultContestPopulate)
        .orFail();
    res.json(contest.status);
    if (contest.status == contest_2.ContestStatus.Complete) {
        for (const submission of contest.submissions) {
            points_1.updateUserPoints(submission.creator._id);
        }
    }
}));
adminContestsRouter.post('/:id/updateContestStart', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newContestStart = new Date(req.body.date);
    if (!(newContestStart instanceof Date && !isNaN(newContestStart.getTime()))) {
        return res.json({ error: 'Invalid date' });
    }
    const contest = yield contest_1.ContestModel
        .findById(req.params.id)
        .orFail();
    contest.contestStart = newContestStart;
    yield contest.save();
    res.json(newContestStart);
}));
adminContestsRouter.post('/:id/updateDownload', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const download = req.body.download;
    const contest = yield contest_1.ContestModel
        .findById(req.params.id)
        .orFail();
    contest.download = download;
    yield contest.save();
    res.json(download);
}));
adminContestsRouter.post('/:id/screeners/add', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contest = yield contest_1.ContestModel
        .findById(req.params.id)
        .orFail();
    const osuId = parseInt(req.body.screenerInput, 10);
    let user;
    if (isNaN(osuId)) {
        let regexp;
        if (req.body.screenerInput.indexOf('[') >= 0 || req.body.screenerInput.indexOf(']') >= 0) {
            regexp = new RegExp('^\\' + req.body.screenerInput + '$', 'i');
        }
        else {
            regexp = new RegExp('^' + req.body.screenerInput + '$', 'i');
        }
        user = yield user_1.UserModel
            .findOne({ username: regexp })
            .orFail();
    }
    else {
        user = yield user_1.UserModel
            .findOne({ osuId })
            .orFail();
    }
    if (contest.screeners.includes(user._id)) {
        return res.json({ error: 'User is already a screener!' });
    }
    contest.screeners.push(user._id);
    yield contest.save();
    res.json(user);
}));
adminContestsRouter.post('/:id/screeners/remove', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [contest, user] = yield Promise.all([
        contest_1.ContestModel
            .findById(req.params.id)
            .orFail(),
        user_1.UserModel
            .findById(req.body.screenerId)
            .orFail(),
    ]);
    if (!contest.screeners.includes(user._id)) {
        return res.json({ error: 'User is not a screener!' });
    }
    yield contest_1.ContestModel
        .findByIdAndUpdate(contest._id, { $pull: { screeners: user._id } })
        .orFail();
    res.json(user);
}));
adminContestsRouter.post('/:id/judges/add', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contest = yield contest_1.ContestModel
        .findById(req.params.id)
        .orFail();
    const osuId = parseInt(req.body.judgeInput, 10);
    let user;
    if (isNaN(osuId)) {
        let regexp;
        if (req.body.judgeInput.indexOf('[') >= 0 || req.body.judgeInput.indexOf(']') >= 0) {
            regexp = new RegExp('^\\' + req.body.judgeInput + '$', 'i');
        }
        else {
            regexp = new RegExp('^' + req.body.judgeInput + '$', 'i');
        }
        user = yield user_1.UserModel
            .findOne({ username: regexp })
            .orFail();
    }
    else {
        user = yield user_1.UserModel
            .findOne({ osuId })
            .orFail();
    }
    if (contest.judges.includes(user._id)) {
        return res.json({ error: 'User is already a judge!' });
    }
    contest.judges.push(user._id);
    yield contest.save();
    res.json(user);
}));
adminContestsRouter.post('/:id/judges/remove', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [contest, user] = yield Promise.all([
        contest_1.ContestModel
            .findById(req.params.id)
            .orFail(),
        user_1.UserModel
            .findById(req.body.judgeId)
            .orFail(),
    ]);
    if (!contest.judges.includes(user._id)) {
        return res.json({ error: 'User is not a judge!' });
    }
    yield contest_1.ContestModel
        .findByIdAndUpdate(contest._id, { $pull: { judges: user._id } })
        .orFail();
    res.json(user);
}));
adminContestsRouter.post('/:id/submissions/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const osuId = parseInt(req.body.osuId, 10);
    const [contest, user] = yield Promise.all([
        contest_1.ContestModel
            .findById(req.params.id)
            .orFail(),
        user_1.UserModel
            .findOne({ osuId })
            .orFail(),
    ]);
    const submission = new submission_1.SubmissionModel();
    submission.name = req.body.name;
    submission.creator = user._id;
    yield submission.save();
    contest.submissions.push(submission);
    yield contest.save();
    yield submission.populate({
        path: 'creator',
        select: '_id osuId username',
    }).execPopulate();
    res.json(submission);
}));
adminContestsRouter.post('/:id/submissions/createFromCsv', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contest = yield contest_1.ContestModel.findById(req.params.id).orFail();
    const buffer = fs_1.default.readFileSync('contest.csv');
    const csv = buffer.toString();
    if (!csv) {
        return res.json(`couldn't read csv`);
    }
    const data = csv.split('\r\n');
    for (const unsplitSubmission of data) {
        const splitSubmission = unsplitSubmission.split(',');
        const username = splitSubmission[0];
        const osuId = parseInt(splitSubmission[1], 10);
        const mask = splitSubmission[2];
        console.log(username);
        const submission = new submission_1.SubmissionModel();
        submission.name = mask;
        const user = yield user_1.UserModel.findOne({ osuId });
        if (user) {
            submission.creator = user._id;
        }
        else {
            const newUser = new user_1.UserModel();
            newUser.osuId = osuId;
            newUser.username = username;
            newUser.group = user_2.UserGroup.Spectator;
            yield newUser.save();
            submission.creator = newUser._id;
        }
        yield submission.save();
        contest.submissions.push(submission);
    }
    yield contest.save();
    yield contest.populate(defaultContestPopulate).execPopulate();
    res.json(contest.submissions);
}));
adminContestsRouter.post('/:id/submissions/:submissionId/delete', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const submission = yield submission_1.SubmissionModel
        .findByIdAndRemove(req.params.submissionId)
        .orFail();
    res.json(submission);
}));
adminContestsRouter.post('/:id/updateJudgingThreshold', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newJudgingThreshold = parseInt(req.body.judgingThreshold);
    if (isNaN(newJudgingThreshold)) {
        return res.json({ error: 'Invalid number' });
    }
    const contest = yield contest_1.ContestModel
        .findById(req.params.id)
        .orFail();
    contest.judgingThreshold = newJudgingThreshold;
    yield contest.save();
    res.json(newJudgingThreshold);
}));
adminContestsRouter.post('/:id/toggleCriteria', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contest = yield contest_1.ContestModel
        .findById(req.params.id)
        .populate(defaultContestPopulate)
        .orFail();
    const newCriteriaId = req.body.criteriaId;
    const criteriaIds = contest.criterias.map(c => c.id);
    const i = criteriaIds.findIndex(c => c === newCriteriaId);
    if (i >= 0) {
        criteriaIds.splice(i, 1);
    }
    else {
        criteriaIds.push(newCriteriaId);
    }
    const newContest = yield contest_1.ContestModel
        .findByIdAndUpdate(req.params.id, { criterias: criteriaIds })
        .populate(defaultContestPopulate)
        .orFail();
    res.json(newContest.criterias);
}));
adminContestsRouter.post('/sendResultsPm', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const message = `hello, thank you for recently participating in "${req.body.contestName}"! screening/judging details on your submission can be found here: https://mappersguild.com/contestresults?submission=${req.body.submissionId}`;
    const response = yield osuApi_1.sendPm(req.session.accessToken, parseInt(req.body.osuId), message);
    if (osuApi_1.isOsuResponseError(response)) {
        return res.json({ error: 'Could not send PM' });
    }
    res.json(true);
}));
exports.default = adminContestsRouter;
