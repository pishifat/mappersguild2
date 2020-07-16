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
                            path: 'screener',
                        },
                    },
                    {
                        path: 'creator',
                        select: '_id osuId username',
                    },
                ],
            },
            {
                path: 'screeners',
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
        return res.json({ error: 'Missing contest name' });
    }

    const contest = new ContestModel();
    contest.name = req.body.name.trim();
    await contest.save();

    res.json(contest);
});

/* POST update contest status */
adminContestsRouter.post('/:id/updateStatus', async (req, res) => {
    const contest = await ContestModel
        .findByIdAndUpdate(req.params.id, { status: req.body.status })
        .orFail();

    res.json(contest.status);
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

/* POST add a screener to the list */
adminContestsRouter.post('/:id/screeners/add', async (req, res) => {
    const contest = await ContestModel
        .findById(req.params.id)
        .orFail();

    const osuId = parseInt(req.body.screenerInput, 10);

    let user;

    if (isNaN(osuId)) {
        let regexp;

        if (req.body.screenerInput.indexOf('[') >= 0 || req.body.screenerInput.indexOf(']') >= 0) {
            regexp = new RegExp('^\\' + req.body.screenerInput + '$', 'i');
        } else {
            regexp = new RegExp('^' + req.body.screenerInput + '$', 'i');
        }

        user = await UserModel
            .findOne({ username: regexp })
            .orFail();
    } else {
        user = await UserModel
            .findOne({ osuId })
            .orFail();
    }

    if (contest.screeners.includes(user._id)) {
        return res.json({ error: 'User is already a screener!' });
    }

    contest.screeners.push(user._id);
    await contest.save();

    res.json(user);
});

/* POST remove a screener from the list */
adminContestsRouter.post('/:id/screeners/remove', async (req, res) => {
    const [contest, user] = await Promise.all([
        ContestModel
            .findById(req.params.id)
            .orFail(),

        UserModel
            .findById(req.body.screenerId)
            .orFail(),
    ]);

    if (!contest.screeners.includes(user._id)) {
        return res.json({ error: 'User is not a screener!' });
    }

    await ContestModel
        .findByIdAndUpdate(contest._id, { $pull: { screeners: user._id } })
        .orFail();

    res.json(user);
});

/* POST add a judge to the list */
adminContestsRouter.post('/:id/judges/add', async (req, res) => {
    const contest = await ContestModel
        .findById(req.params.id)
        .orFail();

    const osuId = parseInt(req.body.judgeInput, 10);

    let user;

    if (isNaN(osuId)) {
        let regexp;

        if (req.body.judgeInput.indexOf('[') >= 0 || req.body.judgeInput.indexOf(']') >= 0) {
            regexp = new RegExp('^\\' + req.body.judgeInput + '$', 'i');
        } else {
            regexp = new RegExp('^' + req.body.judgeInput + '$', 'i');
        }

        user = await UserModel
            .findOne({ username: regexp })
            .orFail();
    } else {
        user = await UserModel
            .findOne({ osuId })
            .orFail();
    }

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

/* POST update judging threshold */
adminContestsRouter.post('/:id/updateJudgingThreshold', async (req, res) => {
    const newJudgingThreshold = parseInt(req.body.judgingThreshold);

    if (isNaN(newJudgingThreshold)) {
        return res.json({ error: 'Invalid number' });
    }

    const contest = await ContestModel
        .findById(req.params.id)
        .orFail();

    contest.judgingThreshold = newJudgingThreshold;
    await contest.save();

    res.json(newJudgingThreshold);
});

export default adminContestsRouter;
