"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../../helpers/middlewares");
const contest_1 = require("../../models/contest/contest");
const submission_1 = require("../../models/contest/submission");
const communityVote_1 = require("../../models/contest/communityVote");
const contest_2 = require("../../../interfaces/contest/contest");
function getContestPopulate(mongoId) {
    return {
        path: 'submissions',
        select: '_id name communityVotes',
        populate: {
            path: 'communityVotes',
            match: { voter: mongoId },
            populate: {
                path: 'voter',
                select: '_id osuId username',
            },
        },
    };
}
function getSubmissionPopulate(mongoId) {
    return {
        path: 'communityVotes',
        match: { voter: mongoId },
        populate: {
            path: 'voter',
            select: '_id osuId username',
        },
    };
}
const communityVoteRouter = express_1.default.Router();
async function isVoter(req, res, next) {
    const contest = await contest_1.ContestModel
        .findOne({
        status: contest_2.ContestStatus.Vote,
        submissions: req.params.submissionId,
    });
    if (contest) {
        if (contest.communityVoteEnd && new Date() > new Date(contest.communityVoteEnd)) {
            return (0, middlewares_1.unauthorize)(req, res);
        }
        res.locals.contest = contest;
        return next();
    }
    return (0, middlewares_1.unauthorize)(req, res);
}
communityVoteRouter.use(middlewares_1.isLoggedIn);
/* GET page */
communityVoteRouter.get('/relevantInfo', async (req, res) => {
    const contests = await contest_1.ContestModel
        .find({
        status: contest_2.ContestStatus.Vote,
    })
        .populate(getContestPopulate(req.session?.mongoId))
        .select('_id name submissions communityVoteCount communityVoteOrderedPriority communityVoteDescription bannerUrl download communityVoteEnd status');
    res.json(contests);
});
/* GET whether other vote-status contests exist besides the given one */
communityVoteRouter.get('/hasOtherContests/:contestId', async (req, res) => {
    const count = await contest_1.ContestModel.countDocuments({
        status: contest_2.ContestStatus.Vote,
        _id: { $ne: req.params.contestId },
    });
    res.json({ hasOthers: count > 0 });
});
/* GET specific contest from search */
communityVoteRouter.get('/searchContest/:contestId', async (req, res) => {
    const contest = await contest_1.ContestModel
        .findOne({
        status: contest_2.ContestStatus.Vote,
        _id: req.params.contestId,
    })
        .populate(getContestPopulate(req.session?.mongoId))
        .select('_id name submissions communityVoteCount communityVoteOrderedPriority communityVoteDescription bannerUrl download communityVoteEnd status');
    res.json(contest);
});
/* POST update vote */
communityVoteRouter.post('/updateVote/:submissionId', isVoter, async (req, res) => {
    let submission = await submission_1.SubmissionModel
        .findById(req.params.submissionId)
        .populate(getSubmissionPopulate(req.session?.mongoId))
        .orFail();
    const userVote = submission.communityVotes.find(v => v.voter.id === req.session?.mongoId);
    let vote = userVote ? userVote.vote : 0;
    if (req.body.vote !== undefined) {
        vote = parseInt(req.body.vote, 10);
        if (isNaN(vote)) {
            vote = 0;
        }
    }
    const contest = res.locals.contest;
    if (vote !== 0) {
        const contestSubmissionIds = contest.submissions.map(id => id.toString());
        if (contest.communityVoteOrderedPriority) {
            const duplicate = await communityVote_1.CommunityVoteModel.findOne({
                voter: req.session?.mongoId,
                submission: { $in: contestSubmissionIds, $ne: req.params.submissionId },
                vote,
            });
            if (duplicate) {
                return res.json({ error: `You already assigned rank ${vote} to another submission` });
            }
        }
        else {
            const existingVotes = await communityVote_1.CommunityVoteModel.countDocuments({
                voter: req.session?.mongoId,
                submission: { $in: contestSubmissionIds, $ne: req.params.submissionId },
                vote: { $gt: 0 },
            });
            if (existingVotes >= contest.communityVoteCount) {
                return res.json({ error: `You have already used all ${contest.communityVoteCount} votes` });
            }
        }
    }
    if (!userVote) {
        const communityVote = new communityVote_1.CommunityVoteModel();
        communityVote.voter = req.session?.mongoId;
        communityVote.vote = vote;
        communityVote.submission = submission._id;
        await communityVote.save();
    }
    else {
        await communityVote_1.CommunityVoteModel.findByIdAndUpdate(userVote.id, { vote });
    }
    submission = await submission_1.SubmissionModel
        .findById(req.params.submissionId)
        .populate(getSubmissionPopulate(req.session?.mongoId))
        .orFail();
    res.json(submission);
});
exports.default = communityVoteRouter;
