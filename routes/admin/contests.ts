import express from 'express';
import { isLoggedIn, isAdmin } from '../../helpers/middlewares';
import { canFail, defaultErrorMessage } from '../../helpers/helpers';
import { ContestService } from '../../models/contest/contest';
import { UserService } from '../../models/user';
import { SubmissionService } from '../../models/contest/submission';

const adminContestsRouter = express.Router();

adminContestsRouter.use(isLoggedIn);
adminContestsRouter.use(isAdmin);

/* GET contest - admin page */
adminContestsRouter.get('/', (req, res) => {
    res.render('admin/contests', {
        title: 'Contests Admin',
        script: 'adminContests.js',
        loggedInAs: req.session?.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});

/* GET retrieve all the contests info */
adminContestsRouter.get('/relevantInfo', async (req, res) => {
    const contests = await ContestService.queryAll({
        populate: [
            {
                path: 'submissions',
                populate: [
                    {
                        path: 'evaluations',
                        populate: {
                            path: 'judge',
                        },
                    },
                    {
                        path: 'creator',
                        select: '_id osuId username',
                    },
                ],
            },
            {
                path: 'judges',
            },
            {
                path: 'voters',
            },
        ],
        defaultSort: true,
    });

    res.json(contests);
});

/* POST create a contest */
adminContestsRouter.post('/create', async (req, res) => {
    if (!req.body.name) {
        res.json({ error: 'Missing contest name' });
    }

    const contest = await ContestService.create(req.body.name.trim());
    res.json(contest);
});

/* POST toggle contest activity */
adminContestsRouter.post('/:id/toggleActivity', canFail(async (req, res) => {
    const contest = await ContestService.queryByIdOrFail(req.params.id);

    contest.isActive = !contest.isActive;
    await ContestService.saveOrFail(contest);

    res.json(contest.isActive);
}));

/* POST update contest start date */
adminContestsRouter.post('/:id/updateContestStart', canFail(async (req, res) => {
    const newContestStart = new Date(req.body.date);

    if (!(newContestStart instanceof Date && !isNaN(newContestStart.getTime()))) {
        return res.json({ error: 'Invalid date' });
    }

    const contest = await ContestService.queryByIdOrFail(req.params.id);

    contest.contestStart = newContestStart;
    ContestService.saveOrFail(contest);

    res.json(newContestStart);
}));

/* POST update judging start date */
adminContestsRouter.post('/:id/updateJudgingStart', canFail(async (req, res) => {
    const newJudgingStart = new Date(req.body.date);

    if (!(newJudgingStart instanceof Date && !isNaN(newJudgingStart.getTime()))) {
        return res.json({ error: 'Invalid date' });
    }

    const contest = await ContestService.queryByIdOrFail(req.params.id);

    contest.judgingStart = newJudgingStart;
    ContestService.saveOrFail(contest);

    res.json(newJudgingStart);
}));

/* POST update results published date */
adminContestsRouter.post('/:id/updateResultsPublished', canFail(async (req, res) => {
    const newResultsPublished = new Date(req.body.date);

    if (!(newResultsPublished instanceof Date && !isNaN(newResultsPublished.getTime()))) {
        return res.json({ error: 'Invalid date' });
    }

    const contest = await ContestService.queryByIdOrFail(req.params.id);

    contest.resultsPublished = newResultsPublished;
    ContestService.saveOrFail(contest);

    res.json(newResultsPublished);
}));

/* POST add a judge to the list */
adminContestsRouter.post('/:id/judges/add', canFail(async (req, res) => {
    const osuId = parseInt(req.body.osuId, 10);
    const [contest, user] = await Promise.all([
        ContestService.queryByIdOrFail(req.params.id),
        UserService.queryOneOrFail({ query: { osuId } }),
    ]);

    if (contest.judges.includes(user._id)) {
        return res.json({ error: 'User is already a judge!' });
    }

    contest.judges.push(user._id);
    await ContestService.saveOrFail(contest);

    res.json(user);
}));

/* POST remove a judge from the list */
adminContestsRouter.post('/:id/judges/remove', canFail(async (req, res) => {
    const [contest, user] = await Promise.all([
        ContestService.queryByIdOrFail(req.params.id),
        UserService.queryByIdOrFail(req.body.judgeId),
    ]);

    if (!contest.judges.includes(user._id)) {
        return res.json({ error: 'User is not a judge!' });
    }

    await ContestService.updateOrFail(contest._id, { $pull: { judges: user._id } });
    res.json(user);
}));

/* POST create a submission entry */
adminContestsRouter.post('/:id/submissions/create', canFail(async (req, res) => {
    const osuId = parseInt(req.body.osuId, 10);
    const [contest, user] = await Promise.all([
        ContestService.queryByIdOrFail(req.params.id),
        UserService.queryOneOrFail({ query: { osuId } }),
    ]);
    const submission = await SubmissionService.create(req.body.name, user._id);

    if (SubmissionService.isError(submission)) {
        return defaultErrorMessage;
    }

    contest.submissions.push(submission);
    await ContestService.saveOrFail(contest);
    await submission.populate({
        path: 'creator',
        select: '_id osuId username',
    }).execPopulate();

    res.json(submission);
}));

/* POST delete a submission */
adminContestsRouter.post('/:id/submissions/:submissionId/delete', canFail(async (req, res) => {
    const submission = await SubmissionService.removeOrFail(req.params.submissionId);

    res.json(submission);
}));

/* POST save an array of users as voters */
adminContestsRouter.post('/:id/voters/update', async (req, res) => {
    // get array of ids from array of osuids and save them to the contest voters?
});

export default adminContestsRouter;
