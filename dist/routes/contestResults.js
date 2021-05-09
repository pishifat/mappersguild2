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
const contest_1 = require("../interfaces/contest/contest");
const submission_1 = require("../models/contest/submission");
const contest_2 = require("../models/contest/contest");
const contestResultsRouter = express_1.default.Router();
const submissionPopulate = [
    {
        path: 'contest',
        select: 'name screeners status download id',
    },
    {
        path: 'evaluations',
        select: 'comment vote',
    },
    {
        path: 'creator',
        select: 'username osuId',
    },
    {
        path: 'judgings',
        select: '-judge',
        populate: {
            path: 'judgingScores',
            populate: {
                path: 'criteria',
            },
        },
    },
];
const contestPopulate = [
    {
        path: 'submissions',
        populate: [
            {
                path: 'evaluations',
                select: 'comment vote',
            },
            {
                path: 'judgings',
                select: '-judge',
                populate: {
                    path: 'judgingScores',
                    populate: {
                        path: 'criteria',
                    },
                },
            },
            {
                path: 'creator',
                select: 'osuId username',
            },
        ],
    },
    {
        path: 'criterias',
        select: 'maxScore',
    },
];
contestResultsRouter.get('/participated', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let submissions = yield submission_1.SubmissionModel
        .find({
        creator: (_a = req.session) === null || _a === void 0 ? void 0 : _a.mongoId,
    })
        .populate(submissionPopulate);
    submissions = submissions.filter(s => s.contest.status === contest_1.ContestStatus.Complete);
    res.json(submissions);
}));
contestResultsRouter.get('/searchSubmission/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const submission = yield submission_1.SubmissionModel
        .findById(req.params.id)
        .populate(submissionPopulate);
    if ((submission === null || submission === void 0 ? void 0 : submission.contest.status) !== contest_1.ContestStatus.Complete) {
        return res.json(null);
    }
    res.json(submission);
}));
contestResultsRouter.get('/searchContest/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contest = yield contest_2.ContestModel
        .findById(req.params.id)
        .populate(contestPopulate);
    if ((contest === null || contest === void 0 ? void 0 : contest.status) !== contest_1.ContestStatus.Complete || !contest.download) {
        return res.json(null);
    }
    res.json(contest);
}));
exports.default = contestResultsRouter;
