import express from 'express';
import { isLoggedIn } from '../helpers/middlewares';
import { ContestService } from '../models/contest/contest';
import { SubmissionService } from '../models/contest/submission';
import { JudgingService } from '../models/contest/judging';
import { UserGroup } from '../interfaces/user';
import { canFail, defaultErrorMessage } from '../helpers/helpers';
import { Judging } from '../interfaces/contest/judging';

const judgingRouter = express.Router();

async function isJudge(req, res, next): Promise<void> {
    //if population doesn't work here, there's a problem
    const contests = await ContestService.queryAll({
        query: {
            isActive: true,
            judges: res.locals.userRequest._id,
        },
        defaultPopulate: true,
        select: '_id name submissions judges',
    });

    if ((!ContestService.isError(contests) && contests.length) ||
        res.locals.userRequest.group == UserGroup.Admin
    ) {
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
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});

judgingRouter.get('/relevantInfo', (req, res) => {
    res.json({
        contests: res.locals.contests,
        userId: req.session?.mongoId,
    });
});

/* POST update submission comment */
judgingRouter.post('/updateSubmission/:submissionId', canFail(async (req, res) => {
    let submission = await SubmissionService.queryByIdOrFail(req.params.submissionId, {
        defaultPopulate: true,
    });
    const userEvaluation = submission.evaluations.find(e => e.judge.id === req.session.mongoId);
    let vote: number | undefined;

    if (req.body.vote !== undefined) {
        vote = parseInt(req.body.vote, 10);

        if (isNaN(vote)) {
            vote = undefined;
        }
    }

    if (!userEvaluation) {
        const j = await JudgingService.create(req.session.mongoId, req.body.comment, vote);

        if (JudgingService.isError(j)) {
            return res.json(defaultErrorMessage);
        }

        submission.evaluations.push(j);
        await SubmissionService.saveOrFail(submission);
    } else {
        const updatedValues: Partial<Judging> = {};

        if (req.body.comment !== undefined) {
            updatedValues.comment = req.body.comment;
        }

        if (vote !== undefined) {
            updatedValues.vote = vote;
        }

        await JudgingService.update(userEvaluation.id, updatedValues);
    }

    submission = await SubmissionService.queryByIdOrFail(req.params.submissionId, {
        defaultPopulate: true,
    });

    res.json(submission);
}));

export default judgingRouter;
