import express from 'express';
import { isLoggedIn, isSuperAdmin } from '../../helpers/middlewares';
import { ContestModel } from '../../models/contest/contest';
import { UserModel } from '../../models/user';
import { SubmissionModel } from '../../models/contest/submission';

const adminContestsRouter = express.Router();

adminContestsRouter.use(isLoggedIn);
adminContestsRouter.use(isSuperAdmin);

/* GET contest - admin page */
adminContestsRouter.get('/', (req, res) => {
    res.render('admin/contests', {
        title: 'Contests Admin',
        script: 'adminContests.js',
        loggedInAs: req.session?.osuId,
        userMongoId: req.session?.mongoId,
        pointsInfo: res.locals.userRequest.pointsInfo,
    });
});

/* GET retrieve all the contests info */
adminContestsRouter.get('/relevantInfo', async (req, res) => {
    const contests = await ContestModel
        .find({})
        .populate([
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
        ])
        .sort({ name: 1 });

    res.json(contests);
});

/* POST create a contest */
adminContestsRouter.post('/create', async (req, res) => {
    if (!req.body.name) {
        res.json({ error: 'Missing contest name' });
    }

    const contest = new ContestModel();
    contest.name = req.body.name.trim();
    await contest.save();

    res.json(contest);
});

/* POST toggle contest activity */
adminContestsRouter.post('/:id/toggleActivity', async (req, res) => {
    const contest = await ContestModel
        .findById(req.params.id)
        .orFail();

    contest.isActive = !contest.isActive;
    await contest.save();

    res.json(contest.isActive);
});

/* POST update contest start date */
adminContestsRouter.post('/:id/updateContestStart', async (req, res) => {
    const newContestStart = new Date(req.body.date);

    if (!(newContestStart instanceof Date && !isNaN(newContestStart.getTime()))) {
        return res.json({ error: 'Invalid date' });
    }

    const contest = await ContestModel
        .findById(req.params.id)
        .orFail();

    contest.contestStart = newContestStart;
    await contest.save();

    res.json(newContestStart);
});

/* POST update judging start date */
adminContestsRouter.post('/:id/updateJudgingStart', async (req, res) => {
    const newJudgingStart = new Date(req.body.date);

    if (!(newJudgingStart instanceof Date && !isNaN(newJudgingStart.getTime()))) {
        return res.json({ error: 'Invalid date' });
    }

    const contest = await ContestModel
        .findById(req.params.id)
        .orFail();

    contest.judgingStart = newJudgingStart;
    await contest.save();

    res.json(newJudgingStart);
});

/* POST update results published date */
adminContestsRouter.post('/:id/updateResultsPublished', async (req, res) => {
    const newResultsPublished = new Date(req.body.date);

    if (!(newResultsPublished instanceof Date && !isNaN(newResultsPublished.getTime()))) {
        return res.json({ error: 'Invalid date' });
    }

    const contest = await ContestModel
        .findById(req.params.id)
        .orFail();

    contest.resultsPublished = newResultsPublished;
    await contest.save();

    res.json(newResultsPublished);
});

/* POST add a judge to the list */
adminContestsRouter.post('/:id/judges/add', async (req, res) => {
    const osuId = parseInt(req.body.osuId, 10);
    const [contest, user] = await Promise.all([
        ContestModel
            .findById(req.params.id)
            .orFail(),

        UserModel
            .findOne({ osuId })
            .orFail(),
    ]);

    if (contest.judges.includes(user._id)) {
        return res.json({ error: 'User is already a judge!' });
    }

    contest.judges.push(user._id);
    await contest.save();

    res.json(user);
});

/* POST remove a judge from the list */
adminContestsRouter.post('/:id/judges/remove', async (req, res) => {
    const [contest, user] = await Promise.all([
        ContestModel
            .findById(req.params.id)
            .orFail(),

        UserModel
            .findById(req.body.judgeId)
            .orFail(),
    ]);

    if (!contest.judges.includes(user._id)) {
        return res.json({ error: 'User is not a judge!' });
    }

    await ContestModel
        .findByIdAndUpdate(contest._id, { $pull: { judges: user._id } })
        .orFail();

    res.json(user);
});

/* POST create a submission entry */
adminContestsRouter.post('/:id/submissions/create', async (req, res) => {
    const osuId = parseInt(req.body.osuId, 10);
    const [contest, user] = await Promise.all([
        ContestModel
            .findById(req.params.id)
            .orFail(),

        UserModel
            .findOne({ osuId })
            .orFail(),
    ]);
    const submission = new SubmissionModel();
    submission.name = req.body.name;
    submission.creator = user._id;
    await submission.save();
    contest.submissions.push(submission);
    await contest.save();
    await submission.populate({
        path: 'creator',
        select: '_id osuId username',
    }).execPopulate();

    res.json(submission);
});

/* POST delete a submission */
adminContestsRouter.post('/:id/submissions/:submissionId/delete', async (req, res) => {
    const submission = await SubmissionModel
        .findByIdAndRemove(req.params.submissionId)
        .orFail();

    res.json(submission);
});

/* POST update creator on a submission */
adminContestsRouter.post('/submissions/:submissionId/updateCreator', async (req, res) => {
    const osuId = parseInt(req.body.osuId, 10);
    const user = await UserModel
        .findOne({ osuId })
        .orFail();

    await SubmissionModel
        .findByIdAndUpdate(req.params.submissionId, { creator: user._id })
        .orFail();

    res.json(user);
});

export default adminContestsRouter;
