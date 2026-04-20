import express from 'express';
import { Contest, ContestStatus } from '../../../interfaces/contest/contest';
import { Submission } from '../../../interfaces/contest/submission';
import { User } from '../../../interfaces/user';
import { SubmissionModel } from '../../models/contest/submission';
import { ContestModel } from '../../models/contest/contest';
import { ScreeningModel } from '../../models/contest/screening';

const resultsRouter = express.Router();

// population
const submissionPopulate = [
    {
        path: 'contest',
        select: 'name screeners status download id creators hasPublicJudges',
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
];

const submissionPopulateWithJudges = [
    {
        path: 'contest',
        select: 'name screeners status download id creators hasPublicJudges',
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
    const contestId = req.params.contestId;
    const submissionId = req.params.submissionId;
    const userId = req.params.userId;

    const contest = await ContestModel.findById(contestId).orFail();

    const screenerIds = contest.screeners.map(s => s.toString());

    if (screenerIds.includes(userId)) {
        const screening = await ScreeningModel.findOne({ submission: submissionId as any, screener: userId as any });

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

    const voterVoteCounts = new Map<string, number>();

    for (const submission of contest.submissions) {
        for (const cv of (submission.communityVotes || [])) {
            if (cv.voter && cv.vote > 0) {
                const voterId = cv.voter._id?.toString() || cv.voter.toString();
                voterVoteCounts.set(voterId, (voterVoteCounts.get(voterId) || 0) + 1);
            }
        }
    }

    const badActorIds = new Set([...voterVoteCounts.entries()]
        .filter(([, count]) => count > contest.communityVoteCount)
        .map(([id]) => id));

    const contestObj = contest.toObject();

    for (const submission of contestObj.submissions) {
        submission.communityVotes = (submission.communityVotes || [])
            .filter(cv => !badActorIds.has(cv.voter?._id?.toString()))
            .map(cv => ({ vote: cv.vote }));
    }

    res.json(contestObj);
});

export default resultsRouter;