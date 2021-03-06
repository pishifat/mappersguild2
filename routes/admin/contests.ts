import express from 'express';
import fs from 'fs';
import { isLoggedIn, isSuperAdmin } from '../../helpers/middlewares';
import { ContestModel } from '../../models/contest/contest';
import { UserModel } from '../../models/user';
import { UserGroup } from '../../interfaces/user';
import { SubmissionModel } from '../../models/contest/submission';
import { sendPm, isOsuResponseError } from '../../helpers/osuApi';
import { CriteriaModel } from '../../models/contest/criteria';
import { updateUserPoints } from '../../helpers/points';
import { ContestStatus } from '../../interfaces/contest/contest';


const adminContestsRouter = express.Router();

adminContestsRouter.use(isLoggedIn);
adminContestsRouter.use(isSuperAdmin);

const defaultContestPopulate = [
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
        path: 'criterias',
    },
];

/* GET retrieve all the contests info */
adminContestsRouter.get('/relevantInfo', async (req, res) => {
    const contests = await ContestModel
        .find({})
        .populate(defaultContestPopulate)
        .sort({ contestStart: -1 });

    res.json(contests);
});

/* GET retrieve all criterias */
adminContestsRouter.get('/criterias', async (req, res) => {
    const criterias = await CriteriaModel.find({});

    res.json({ criterias });
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

/* POST add criteria */
adminContestsRouter.post('/addCriteria', async (req, res) => {
    const { name, maxScore } = req.body;

    if (!name || !name.length) {
        return res.json({ error: 'Invalid name' });
    }

    if (isNaN(maxScore)) {
        return res.json({ error: 'Invalid maxScore' });
    }

    const criteria = new CriteriaModel();
    criteria.name = name;
    criteria.maxScore = maxScore;
    await criteria.save();

    const allCriteria = await CriteriaModel.find({});

    res.json(allCriteria);
});

/* POST update contest status */
adminContestsRouter.post('/:id/updateStatus', async (req, res) => {
    const contest = await ContestModel
        .findByIdAndUpdate(req.params.id, { status: req.body.status })
        .populate(defaultContestPopulate)
        .orFail();

    res.json(contest.status);

    if (contest.status == ContestStatus.Complete) {
        for (const submission of contest.submissions) {
            updateUserPoints(submission.creator._id);
        }
    }
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

/* POST update submissions download link */
adminContestsRouter.post('/:id/updateDownload', async (req, res) => {
    const download = req.body.download;

    const contest = await ContestModel
        .findById(req.params.id)
        .orFail();

    contest.download = download;
    await contest.save();

    res.json(download);
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

/* POST create submissions from CSV file */
adminContestsRouter.post('/:id/submissions/createFromCsv', async (req, res) => {
    const contest = await ContestModel.findById(req.params.id).orFail();

    // read masking csv
    const buffer = fs.readFileSync('contest.csv');
    const csv = buffer.toString();

    if (!csv) {
        return res.json(`couldn't read csv`);
    }

    const data = csv.split('\r\n');

    for (const unsplitSubmission of data) {
        const splitSubmission = unsplitSubmission.split(',');
        const username = splitSubmission[0];
        const osuId = parseInt(splitSubmission[1], 10);
        const mask = splitSubmission[2];
        console.log(username);

        const submission = new SubmissionModel();

        submission.name = mask;

        const user = await UserModel.findOne({ osuId });

        if (user) {
            submission.creator = user._id;
        } else {
            const newUser = new UserModel();
            newUser.osuId = osuId;
            newUser.username = username;
            newUser.group = UserGroup.Spectator;
            await newUser.save();

            submission.creator = newUser._id;
        }

        await submission.save();
        contest.submissions.push(submission);
    }

    await contest.save();
    await contest.populate(defaultContestPopulate).execPopulate();

    res.json(contest.submissions);
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

/* POST update criterias */
adminContestsRouter.post('/:id/toggleCriteria', async (req, res) => {
    const contest = await ContestModel
        .findById(req.params.id)
        .populate(defaultContestPopulate)
        .orFail();

    const newCriteriaId = req.body.criteriaId;
    const criteriaIds = contest.criterias.map(c => c.id);
    const i = criteriaIds.findIndex(c => c === newCriteriaId);

    if (i >= 0) {
        criteriaIds.splice(i, 1);
    } else {
        criteriaIds.push(newCriteriaId);
    }

    const newContest = await ContestModel
        .findByIdAndUpdate(req.params.id, { criterias: criteriaIds })
        .populate(defaultContestPopulate)
        .orFail();

    res.json(newContest.criterias);
});


/* POST send results pm */
adminContestsRouter.post('/sendResultsPm', async (req, res) => {
    const message = `hello, thank you for recently participating in "${req.body.contestName}"! screening/judging details on your submission can be found here: https://mappersguild.com/contestresults?submission=${req.body.submissionId}`;

    const response = await sendPm(req.session!.accessToken!, parseInt(req.body.osuId), message);

    if (isOsuResponseError(response)) {
        return res.json({ error: 'Could not send PM' });
    }

    res.json(true);
});

export default adminContestsRouter;
