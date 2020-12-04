import express from 'express';
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

    res.json(submission);
});

export default contestResultsRouter;