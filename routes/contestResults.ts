import express from 'express';
import { ContestStatus } from '../interfaces/contest/contest';
import { SubmissionModel } from '../models/contest/submission';

const contestResultsRouter = express.Router();

// population
const submissionPopulate = [
    {
        path: 'contest',
        select: 'name screeners',
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

contestResultsRouter.get('/searchSubmission/:id', async (req, res) => {
    const submission =
        await SubmissionModel
            .findById(req.params.id)
            .populate(submissionPopulate);

    if (submission?.contest.status !== ContestStatus.Complete) res.json(null);

    res.json(submission);
});

export default contestResultsRouter;