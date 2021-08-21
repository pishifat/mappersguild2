import express from 'express';
import { ContestStatus } from '../../interfaces/contest/contest';
import { SubmissionModel } from '../models/contest/submission';
import { ContestModel } from '../models/contest/contest';

const contestResultsRouter = express.Router();

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
    let submissions = await SubmissionModel
        .find({
            creator: req.session?.mongoId,
        })
        .populate(submissionPopulate);

    submissions = submissions.filter(s => s.contest.status === ContestStatus.Complete);

    res.json(submissions);
});

/* GET submission */
contestResultsRouter.get('/searchSubmission/:id', async (req, res) => {
    const submission =
        await SubmissionModel
            .findById(req.params.id)
            .populate(submissionPopulate);

    if (submission?.contest.status !== ContestStatus.Complete) {
        return res.json(null);
    }

    res.json(submission);
});

/* GET contest */
contestResultsRouter.get('/searchContest/:id', async (req, res) => {
    const contest =
        await ContestModel
            .findById(req.params.id)
            .populate(contestPopulate);

    if (contest?.status !== ContestStatus.Complete || !contest.download) { // add .download prereq
        return res.json(null);
    }

    res.json(contest);
});

export default contestResultsRouter;