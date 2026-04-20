import express from 'express';
import { isLoggedIn, unauthorize } from '../../helpers/middlewares';
import { ContestModel } from '../../models/contest/contest';
import { SubmissionModel } from '../../models/contest/submission';
import { CommunityVoteModel } from '../../models/contest/communityVote';
import { ContestStatus } from '../../../interfaces/contest/contest';

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

const communityVoteRouter = express.Router();

async function isVoter(req, res, next): Promise<void> {
    const contest = await ContestModel
        .findOne({
            status: ContestStatus.Vote,
            submissions: req.params.submissionId,
        });

    if (contest) {
        res.locals.contest = contest;

        return next();
    }

    return unauthorize(req, res);
}

communityVoteRouter.use(isLoggedIn);

/* GET page */
communityVoteRouter.get('/relevantInfo', async (req, res) => {
    const contests = await ContestModel
        .find({
            status: ContestStatus.Vote,
        })
        .populate(getContestPopulate(req.session?.mongoId))
        .select('_id name submissions communityVoteCount communityVoteOrderedPriority communityVoteDescription bannerUrl download status');

    res.json(contests);
});

/* GET whether other vote-status contests exist besides the given one */
communityVoteRouter.get('/hasOtherContests/:contestId', async (req, res) => {
    const count = await ContestModel.countDocuments({
        status: ContestStatus.Vote,
        _id: { $ne: req.params.contestId },
    });

    res.json({ hasOthers: count > 0 });
});

/* GET specific contest from search */
communityVoteRouter.get('/searchContest/:contestId', async (req, res) => {
    const contest = await ContestModel
        .findOne({
            status: ContestStatus.Vote,
            _id: req.params.contestId,
        })
        .populate(getContestPopulate(req.session?.mongoId))
        .select('_id name submissions communityVoteCount communityVoteOrderedPriority communityVoteDescription bannerUrl download status');

    res.json(contest);
});

/* POST update vote */
communityVoteRouter.post('/updateVote/:submissionId', isVoter, async (req, res) => {
    let submission = await SubmissionModel
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
            const duplicate = await CommunityVoteModel.findOne({
                voter: req.session?.mongoId,
                submission: { $in: contestSubmissionIds, $ne: req.params.submissionId },
                vote,
            });

            if (duplicate) {
                return res.json({ error: `You already assigned rank ${vote} to another submission` });
            }
        } else {
            const existingVotes = await CommunityVoteModel.countDocuments({
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
        const communityVote = new CommunityVoteModel();
        communityVote.voter = req.session?.mongoId;
        communityVote.vote = vote;
        communityVote.submission = submission._id;
        await communityVote.save();
    } else {
        await CommunityVoteModel.findByIdAndUpdate(userVote.id, { vote });
    }

    submission = await SubmissionModel
        .findById(req.params.submissionId)
        .populate(getSubmissionPopulate(req.session?.mongoId))
        .orFail();

    res.json(submission);
});

export default communityVoteRouter;
