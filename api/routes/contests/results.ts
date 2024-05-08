import express from 'express';
import { ContestStatus } from '../../../interfaces/contest/contest';
import { SubmissionModel } from '../../models/contest/submission';
import { ContestModel } from '../../models/contest/contest';

const resultsRouter = express.Router();

// population
const submissionPopulate = [
    {
        path: 'contest',
        select: 'name screeners status download id creators',
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

/* GET submission */
resultsRouter.get('/searchSubmission/:id', async (req, res) => {
    const submission =
        await SubmissionModel
            .findById(req.params.id)
            .populate(submissionPopulate);

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
    const contest =
        await ContestModel
            .findById(req.params.id)
            .populate(contestPopulate);

    const creatorIds: string[] | undefined = contest?.creators.map(c => c.id);

    if (creatorIds?.includes(req.session.mongoId)) {
        return res.json(contest);
    }

    if (contest?.status !== ContestStatus.Complete || !contest.download) {
        return res.json(null);
    }

    res.json(contest);
});

export default resultsRouter;