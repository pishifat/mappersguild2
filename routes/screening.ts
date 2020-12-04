import express from 'express';
import { isLoggedIn, unauthorize } from '../helpers/middlewares';
import { ContestModel } from '../models/contest/contest';
import { SubmissionModel } from '../models/contest/submission';
import { ScreeningModel, Screening } from '../models/contest/screening';
import { ContestStatus } from '../interfaces/contest/contest';

const defaultContestPopulate = {
    path: 'submissions',
    select: '_id name evaluations',
    populate: {
        path: 'evaluations',
        populate: {
            path: 'screener',
            select: '_id osuId username',
        },
    },
};

const defaultSubmissionPopulate = {
    path: 'evaluations',
    populate: {
        path: 'screener',
        select: '_id osuId username',
    },
};

const screeningRouter = express.Router();

async function isScreener(req, res, next): Promise<void> {
    //if population doesn't work here, there's a problem
    const contests = await ContestModel
        .find({
            status: ContestStatus.Screening,
            screeners: res.locals.userRequest._id,
        })
        .populate(defaultContestPopulate)
        .select('_id name submissions screeners');

    if (contests.length) {
        res.locals.contests = contests;

        return next();
    }

    return unauthorize(req, res);
}

screeningRouter.use(isLoggedIn);
screeningRouter.use(isScreener);

screeningRouter.get('/relevantInfo', (req, res) => {
    res.json({
        contests: res.locals.contests,
    });
});

/* POST update submission comment */
screeningRouter.post('/updateSubmission/:submissionId', async (req, res) => {
    let submission = await SubmissionModel
        .findById(req.params.submissionId)
        .populate(defaultSubmissionPopulate)
        .orFail();

    const userEvaluation = submission.evaluations.find(e => e.screener.id === req.session?.mongoId);
    let vote = userEvaluation ? userEvaluation.vote : 0;

    if (req.body.vote !== undefined) {
        vote = parseInt(req.body.vote, 10);

        if (isNaN(vote)) {
            vote = 0;
        }
    }

    if (!userEvaluation) {
        const j = new ScreeningModel();
        j.screener = req.session?.mongoId;
        j.comment = req.body.comment;
        j.vote = vote;
        await j.save();

        submission.evaluations.push(j);
        await submission.save();
    } else {
        const updatedValues: Partial<Screening> = {};

        if (req.body.comment !== undefined) {
            updatedValues.comment = req.body.comment;
        }

        if (vote !== undefined) {
            updatedValues.vote = vote;
        }

        await ScreeningModel.findByIdAndUpdate(userEvaluation.id, updatedValues);
    }

    submission = await SubmissionModel
        .findById(req.params.submissionId)
        .populate(defaultSubmissionPopulate)
        .orFail();

    res.json(submission);
});

export default screeningRouter;
