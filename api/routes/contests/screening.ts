import express from 'express';
import { isLoggedIn, unauthorize } from '../../helpers/middlewares';
import { ContestModel } from '../../models/contest/contest';
import { SubmissionModel } from '../../models/contest/submission';
import { ScreeningModel, Screening } from '../../models/contest/screening';
import { ContestStatus } from '../../../interfaces/contest/contest';

const defaultContestPopulate = {
    path: 'submissions',
    select: '_id name screenings',
    populate: {
        path: 'screenings',
        populate: {
            path: 'screener',
            select: '_id osuId username',
        },
    },
};

const defaultSubmissionPopulate = {
    path: 'screenings',
    populate: {
        path: 'screener',
        select: '_id osuId username',
    },
};

const screeningRouter = express.Router();

async function isScreener(req, res, next): Promise<void> {
    const contest = await ContestModel
        .findOne({
            status: ContestStatus.Screening,
            screeners: res.locals.userRequest._id,
            submissions: req.params.submissionId,
        });

    if (contest) {
        return next();
    }

    return unauthorize(req, res);
}

screeningRouter.use(isLoggedIn);

/* GET page */
screeningRouter.get('/relevantInfo', async (req, res) => {
    const contests = await ContestModel
        .find({
            status: ContestStatus.Screening,
            screeners: res.locals.userRequest._id,
        })
        .populate(defaultContestPopulate)
        .select('_id name submissions screeners download status url screeningVoteCount');

    res.json(contests);
});

/* GET specific contest from search */
screeningRouter.get('/searchContest/:contestId', async (req, res) => {
    const contest = await ContestModel
        .findOne({
            status: ContestStatus.Screening,
            screeners: res.locals.userRequest._id,
            _id: req.params.contestId,
        })
        .populate(defaultContestPopulate)
        .select('_id name submissions screeners download status url screeningVoteCount');

    res.json(contest);
});

/* POST update submission comment */
screeningRouter.post('/updateSubmission/:submissionId', isScreener, async (req, res) => {
    let submission = await SubmissionModel
        .findById(req.params.submissionId)
        .populate(defaultSubmissionPopulate)
        .orFail();

    const userScreening = submission.screenings.find(s => s.screener.id === req.session?.mongoId);
    let vote = userScreening ? userScreening.vote : 0;

    if (req.body.vote !== undefined) {
        vote = parseInt(req.body.vote, 10);

        if (isNaN(vote)) {
            vote = 0;
        }
    }

    if (!userScreening) {
        const screening = new ScreeningModel();
        screening.screener = req.session?.mongoId;
        screening.comment = req.body.comment;
        screening.vote = vote;
        screening.submission = submission._id;
        await screening.save();
    } else {
        const updatedValues: Partial<Screening> = {};

        if (req.body.comment !== undefined) {
            updatedValues.comment = req.body.comment;
        }

        if (vote !== undefined) {
            updatedValues.vote = vote;
        }

        await ScreeningModel.findByIdAndUpdate(userScreening.id, updatedValues);
    }

    submission = await SubmissionModel
        .findById(req.params.submissionId)
        .populate(defaultSubmissionPopulate)
        .orFail();

    res.json(submission);
});

export default screeningRouter;
