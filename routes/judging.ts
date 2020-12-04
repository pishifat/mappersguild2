import express from 'express';
import { isLoggedIn, unauthorize } from '../helpers/middlewares';
import { ContestModel } from '../models/contest/contest';
import { SubmissionModel } from '../models/contest/submission';
import { CriteriaModel } from '../models/contest/criteria';
import { JudgingScoreModel } from '../models/contest/judgingScore';
import { JudgingModel } from '../models/contest/judging';
import { ContestStatus } from '../interfaces/contest/contest';

const defaultContestPopulate = {
    path: 'submissions',
    select: '_id name evaluations',
    populate: {
        path: 'evaluations',
    },
};

const defaultJudgingPopulate = [
    { path: 'submission', select: 'name' },
    {
        path: 'judgingScores',
        populate: {
            path: 'criteria',
        },
    },
];

const judgingRouter = express.Router();

async function isJudge(req, res, next): Promise<void> {
    const query = ContestModel
        .findOne({
            status: ContestStatus.Judging,
            judges: res.locals.userRequest._id,
        })
        .populate(defaultContestPopulate);

    const contest = await query.exec();

    if (contest) {
        res.locals.contest = contest;

        return next();
    }

    return unauthorize(req, res);
}

judgingRouter.use(isLoggedIn);
judgingRouter.use(isJudge);

judgingRouter.get('/relevantInfo', async (req, res) => {
    const contest = res.locals.contest;
    let criteriaQuery;

    if (contest.isTheme) {
        criteriaQuery = { name: { $ne: 'limitation' } };
    } else {
        criteriaQuery = { name: { $ne: 'theme' } };
    }

    const [criterias, judgingDone] = await Promise.all([
        CriteriaModel.find(criteriaQuery),
        JudgingModel
            .find({
                judge: req.session?.mongoId,
            })
            .populate(defaultJudgingPopulate),
    ]);

    res.json({
        contest,
        criterias,
        judgingDone,
    });
});

judgingRouter.post('/save', async (req, res) => {
    const { submissionId, criteriaId, score, comment } = req.body;
    const [criteria, submission] = await Promise.all([
        CriteriaModel.findById(criteriaId).orFail(),
        SubmissionModel
            .findById(submissionId)
            .populate({
                path: 'contest',
            })
            .orFail(),
    ]);

    const parsedScore = parseInt(score, 10);

    if (submission.contest.id != res.locals.contest.id) {
        return res.json({ error: 'woah' });
    }

    if (score > criteria.maxScore) {
        return res.json({ error: 'Score is higher than expected' });
    }

    let judging = await JudgingModel
        .findOne({
            judge: res.locals.userRequest._id,
            submission: submission._id,
        })
        .populate(defaultJudgingPopulate);


    if (!judging) {
        judging = new JudgingModel();
        judging.judge = res.locals.userRequest._id;
        judging.submission = submission._id;
    }

    let judgingScore = judging.judgingScores.find(j => j.criteria._id == criteriaId);

    if (!judgingScore) {
        judgingScore = new JudgingScoreModel();
        judgingScore.criteria = criteria;
        judging.judgingScores.push(judgingScore);
    }

    judgingScore.score = parsedScore;
    judgingScore.comment = comment;
    await Promise.all([
        judgingScore.save(),
        judging.save(),
    ]);

    const judgingDone = await JudgingModel
        .find({
            judge: req.session?.mongoId,
        })
        .populate(defaultJudgingPopulate);

    res.json({
        judgingDone,
        success: 'Saved!',
    });
});

export default judgingRouter;
