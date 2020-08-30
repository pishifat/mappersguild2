import express from 'express';
import { isLoggedIn } from '../helpers/middlewares';
import { SubmissionModel } from '../models/contest/submission';
import { UserModel } from '../models/user';

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

/* GET contest results page. */
contestResultsRouter.get('/', async (req, res, next) => {
    if (req.session?.osuId) {
        const u = await UserModel.findById(req.session.mongoId);

        if (u) {
            return next();
        }
    }

    res.render('contestResults', {
        title: `Contest Results`,
        script: 'contestResults.js',
    });
}, isLoggedIn, (req, res) => {
    res.render('contestResults', {
        title: 'Contest Results',
        script: 'contestResults.js',
        loggedInAs: req.session?.osuId,
        userMongoId: req.session?.mongoId,
        pointsInfo: res.locals.userRequest.pointsInfo,
    });
});

contestResultsRouter.get('/searchSubmission/:id', async (req, res) => {
    const submission =
        await SubmissionModel
            .findById(req.params.id)
            .populate(submissionPopulate);

    res.json(submission);
});

export default contestResultsRouter;