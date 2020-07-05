import express from 'express';
import { isLoggedIn } from '../helpers/middlewares';
import { ContestModel } from '../models/contest/contest';
import { SubmissionModel } from '../models/contest/submission';
import { JudgingModel, Judging } from '../models/contest/judging';
import { UserGroup } from '../interfaces/user';

const defaultContestPopulate = {
    path: 'submissions',
    select: '_id name evaluations',
    populate: {
        path: 'evaluations',
        populate: {
            path: 'judge',
            select: '_id osuId username',
        },
    },
};

const defaultSubmissionPopulate = {
    path: 'evaluations',
    populate: {
        path: 'judge',
        select: '_id osuId username',
    },
};

const judgingRouter = express.Router();

async function isJudge(req, res, next): Promise<void> {
    //if population doesn't work here, there's a problem
    const contests = await ContestModel
        .find({
            isActive: true,
            judges: res.locals.userRequest._id,
        })
        .populate(defaultContestPopulate)
        .select('_id name submissions judges');

    if (contests.length || res.locals.userRequest.group == UserGroup.Admin) {
        res.locals.contests = contests;

        return next();
    }

    return res.redirect('/');
}

judgingRouter.use(isLoggedIn);
judgingRouter.use(isJudge);

/* GET parties page. */
judgingRouter.get('/', (req, res) => {
    res.render('judging', {
        title: 'Judging',
        script: 'judging.js',
        loggedInAs: req.session?.osuId,
        userMongoId: req.session?.mongoId,
        pointsInfo: res.locals.userRequest.pointsInfo,
    });
});

judgingRouter.get('/relevantInfo', (req, res) => {
    res.json({
        contests: res.locals.contests,
        userId: req.session?.mongoId,
    });
});

/* POST update submission comment */
judgingRouter.post('/updateSubmission/:submissionId', async (req, res) => {
    let submission = await SubmissionModel
        .findById(req.params.submissionId)
        .populate(defaultSubmissionPopulate)
        .orFail();

    const userEvaluation = submission.evaluations.find(e => e.judge.id === req.session?.mongoId);
    let vote = 0;

    if (req.body.vote !== undefined) {
        vote = parseInt(req.body.vote, 10);

        if (isNaN(vote)) {
            vote = 0;
        }
    }

    if (!userEvaluation) {
        const j = new JudgingModel();
        j.judge = req.session?.mongoId;
        j.comment = req.body.comment;
        j.vote = vote;
        await j.save();

        submission.evaluations.push(j);
        await submission.save();
    } else {
        const updatedValues: Partial<Judging> = {};

        if (req.body.comment !== undefined) {
            updatedValues.comment = req.body.comment;
        }

        if (vote !== undefined) {
            updatedValues.vote = vote;
        }

        await JudgingModel.findByIdAndUpdate(userEvaluation.id, updatedValues);
    }

    submission = await SubmissionModel
        .findById(req.params.submissionId)
        .populate(defaultSubmissionPopulate)
        .orFail();

    res.json(submission);
});

export default judgingRouter;
