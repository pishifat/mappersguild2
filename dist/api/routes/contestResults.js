"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contest_1 = require("../../interfaces/contest/contest");
const submission_1 = require("../models/contest/submission");
const contest_2 = require("../models/contest/contest");
const contestResultsRouter = express_1.default.Router();
// population
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
/* GET participated submissions */
contestResultsRouter.get('/participated', async (req, res) => {
    let submissions = await submission_1.SubmissionModel
        .find({
        creator: req.session?.mongoId,
    })
        .populate(submissionPopulate);
    submissions = submissions.filter(s => s.contest.status === contest_1.ContestStatus.Complete);
    res.json(submissions);
});
/* GET submission */
contestResultsRouter.get('/searchSubmission/:id', async (req, res) => {
    const submission = await submission_1.SubmissionModel
        .findById(req.params.id)
        .populate(submissionPopulate);
    if (submission?.contest.status !== contest_1.ContestStatus.Complete) {
        return res.json(null);
    }
    res.json(submission);
});
/* GET contest */
contestResultsRouter.get('/searchContest/:id', async (req, res) => {
    const contest = await contest_2.ContestModel
        .findById(req.params.id)
        .populate(contestPopulate);
    if (contest?.status !== contest_1.ContestStatus.Complete || !contest.download) { // add .download prereq
        return res.json(null);
    }
    res.json(contest);
});
exports.default = contestResultsRouter;
