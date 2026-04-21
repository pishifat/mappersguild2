import express from 'express';
import { ContestStatus } from '../../../interfaces/contest/contest';
import { SubmissionModel } from '../../models/contest/submission';
import { ContestModel } from '../../models/contest/contest';
import { ScreeningModel } from '../../models/contest/screening';

const resultsRouter = express.Router();

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
    let submissions = await SubmissionModel
        .find({
            creator: req.session?.mongoId,
        })
        .populate(submissionPopulate);

    submissions = submissions.filter(s => s.contest.status === ContestStatus.Complete);

    res.json(submissions);
});

/* GET user's screening id on a submission (for submission results page) */
resultsRouter.get('/userScreening/:contestId/:submissionId/:userId', async (req, res) => {
    if (req.params.userId !== req.session.mongoId) {
        return res.json({});
    }

    const contestId = req.params.contestId;
    const submissionId = req.params.submissionId;

    const contest = await ContestModel.findById(contestId).orFail();

    const screenerIds = contest.screeners.map(s => s.toString());

    if (screenerIds.includes(req.session.mongoId)) {
        const screening = await ScreeningModel.findOne({ submission: submissionId as any, screener: req.session.mongoId as any });

        if (screening) {
            return res.json(screening.id);
        }
    }

    res.json({});
});

/* GET submission */
resultsRouter.get('/searchSubmission/:id', async (req, res) => {
    let submission =
        await SubmissionModel
            .findById(req.params.id)
            .populate(submissionPopulate);

    if (submission?.contest.hasPublicJudges) {
        submission = await SubmissionModel
            .findById(req.params.id)
            .populate(submissionPopulateWithJudges);
    }

    const creatorIds: string[] | undefined = submission?.contest.creators.map(c => c.toString());

    if (creatorIds?.includes(req.session.mongoId)) {
        return res.json(submission);
    }

    if (submission?.contest.status !== ContestStatus.Complete) {
        return res.json(null);
    }

    res.json(submission);
});

/* GET contest */
resultsRouter.get('/searchContest/:id', async (req, res) => {
    const contest = await ContestModel
        .findById(req.params.id)
        .populate(contestPopulate);

    if (!contest) {
        return res.json(null);
    }

    const creatorIds = contest.creators.map(c => c.id);
    const isCreator = creatorIds.includes(req.session.mongoId);

    if (contest.status !== ContestStatus.Complete || !contest.download) {
        if (!isCreator) return res.json(null);
    }

    const voterData = new Map<string, { count: number; voteValues: number[] }>();

    for (const submission of contest.submissions) {
        for (const cv of (submission.communityVotes || [])) {
            if (cv.voter && cv.vote > 0) {
                const voterId = cv.voter._id?.toString() || cv.voter.toString();
                const existing = voterData.get(voterId);

                if (existing) {
                    existing.count++;
                    existing.voteValues.push(cv.vote);
                } else {
                    voterData.set(voterId, { count: 1, voteValues: [cv.vote] });
                }
            }
        }
    }

    const hasDuplicateRank = (voteValues: number[]) => new Set(voteValues).size !== voteValues.length;

    const badActorIds = new Set([...voterData.entries()]
        .filter(([, data]) => data.count > contest.communityVoteCount || (contest.communityVoteOrderedPriority && hasDuplicateRank(data.voteValues)))
        .map(([id]) => id));

    const contestObj = contest.toObject();

    for (const submission of contestObj.submissions) {
        submission.communityVotes = (submission.communityVotes || [])
            .filter(cv => !badActorIds.has(cv.voter?._id?.toString()))
            .map(cv => ({ vote: cv.vote })) as any;
    }

    res.json(contestObj);
});

export default resultsRouter;