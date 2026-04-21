"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contest_1 = require("../../../interfaces/contest/contest");
const submission_1 = require("../../models/contest/submission");
const contest_2 = require("../../models/contest/contest");
const screening_1 = require("../../models/contest/screening");
const resultsRouter = express_1.default.Router();
const communityVotesPopulate = {
    path: 'communityVotes',
    select: 'vote',
};
// population
const submissionPopulate = [
    {
        path: 'contest',
        select: 'name screeners judges status download id creators hasPublicJudges communityVoteCount communityVoteOrderedPriority',
    },
    {
        path: 'screenings',
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
    communityVotesPopulate,
];
const submissionPopulateWithJudges = [
    {
        path: 'contest',
        select: 'name screeners judges status download id creators hasPublicJudges communityVoteCount communityVoteOrderedPriority',
    },
    {
        path: 'screenings',
        select: 'comment vote',
    },
    {
        path: 'creator',
        select: 'username osuId',
    },
    {
        path: 'judgings',
        populate: [
            {
                path: 'judgingScores',
                populate: {
                    path: 'criteria',
                },
            },
            {
                path: 'judge',
            },
        ],
    },
    communityVotesPopulate,
];
const contestPopulate = [
    {
        path: 'submissions',
        populate: [
            {
                path: 'screenings',
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
            {
                path: 'communityVotes',
                select: 'vote voter',
                populate: { path: 'voter', select: '_id' },
            },
        ],
    },
    {
        path: 'criterias',
        select: 'maxScore',
    },
    {
        path: 'creators',
        select: 'username osuId',
    },
];
/* GET participated submissions */
resultsRouter.get('/participated', async (req, res) => {
    let submissions = await submission_1.SubmissionModel
        .find({
        creator: req.session?.mongoId,
    })
        .populate(submissionPopulate);
    submissions = submissions.filter(s => s.contest.status === contest_1.ContestStatus.Complete);
    res.json(submissions);
});
/* GET user's screening id on a submission (for submission results page) */
resultsRouter.get('/userScreening/:contestId/:submissionId/:userId', async (req, res) => {
    if (req.params.userId !== req.session.mongoId) {
        return res.json({});
    }
    const contestId = req.params.contestId;
    const submissionId = req.params.submissionId;
    const contest = await contest_2.ContestModel.findById(contestId).orFail();
    const screenerIds = contest.screeners.map(s => s.toString());
    if (screenerIds.includes(req.session.mongoId)) {
        const screening = await screening_1.ScreeningModel.findOne({ submission: submissionId, screener: req.session.mongoId });
        if (screening) {
            return res.json(screening.id);
        }
    }
    res.json({});
});
/* GET submission */
resultsRouter.get('/searchSubmission/:id', async (req, res) => {
    let submission = await submission_1.SubmissionModel
        .findById(req.params.id)
        .populate(submissionPopulate);
    if (submission?.contest.hasPublicJudges) {
        submission = await submission_1.SubmissionModel
            .findById(req.params.id)
            .populate(submissionPopulateWithJudges);
    }
    const creatorIds = submission?.contest.creators.map(c => c.toString());
    if (creatorIds?.includes(req.session.mongoId)) {
        return res.json(submission);
    }
    if (submission?.contest.status !== contest_1.ContestStatus.Complete) {
        return res.json(null);
    }
    res.json(submission);
});
/* GET contest */
resultsRouter.get('/searchContest/:id', async (req, res) => {
    const contest = await contest_2.ContestModel
        .findById(req.params.id)
        .populate(contestPopulate);
    if (!contest) {
        return res.json(null);
    }
    const creatorIds = contest.creators.map(c => c.id);
    const isCreator = creatorIds.includes(req.session.mongoId);
    if (contest.status !== contest_1.ContestStatus.Complete || !contest.download) {
        if (!isCreator)
            return res.json(null);
    }
    const voterData = new Map();
    for (const submission of contest.submissions) {
        for (const cv of (submission.communityVotes || [])) {
            if (cv.voter && cv.vote > 0) {
                const voterId = cv.voter._id?.toString() || cv.voter.toString();
                const existing = voterData.get(voterId);
                if (existing) {
                    existing.count++;
                    existing.voteValues.push(cv.vote);
                }
                else {
                    voterData.set(voterId, { count: 1, voteValues: [cv.vote] });
                }
            }
        }
    }
    const hasDuplicateRank = (voteValues) => new Set(voteValues).size !== voteValues.length;
    const badActorIds = new Set([...voterData.entries()]
        .filter(([, data]) => data.count > contest.communityVoteCount || (contest.communityVoteOrderedPriority && hasDuplicateRank(data.voteValues)))
        .map(([id]) => id));
    const contestObj = contest.toObject();
    for (const submission of contestObj.submissions) {
        submission.communityVotes = (submission.communityVotes || [])
            .filter(cv => !badActorIds.has(cv.voter?._id?.toString()))
            .map(cv => ({ vote: cv.vote }));
    }
    res.json(contestObj);
});
exports.default = resultsRouter;
