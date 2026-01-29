import express from 'express';
import config from '../../config.json';
import { UserModel } from '../models/user';
import { ContestModel } from '../models/contest/contest';
import { ContestMode, ContestStatus } from '../../interfaces/contest/contest';
import { calculateContestScores } from './contests/listing';

const interOpRouter = express.Router();

/* AUTHENTICATION */
interOpRouter.use((req, res, next) => {
    const secret = req.header('secret');
    const username = req.header('username');

    if (!secret || !username) {
        return res.status(401).json({ error: 'Missing secret or username headers' });
    }

    const userConfig = config.interOpAccess[username];

    if (!userConfig || userConfig.secret !== secret) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    return next();
});

/* GET user mentorships by osuId or username */
interOpRouter.get('/userMentorships/:id', async (req, res) => {
    const identifier = req.params.id;
    const osuId = parseInt(identifier, 10);

    try {
        let user;

        if (isNaN(osuId)) {
            // Search by username
            user = await UserModel.findOne()
                .byUsername(identifier)
                .select('osuId username mentorships')
                .populate('mentorships.cycle', 'name');
        } else {
            // Search by osuId
            user = await UserModel.findOne({ osuId })
                .select('osuId username mentorships')
                .populate('mentorships.cycle', 'name');
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

/* GET mapping contest results for all public contests (only users and final standardized scores) */
interOpRouter.get('/contestResults/:mode', async (req, res) => {
    const contests = await ContestModel
        .find({
            status: ContestStatus.Complete,
            mode: req.params.mode as ContestMode,
        })
        .populate([
            {
                path: 'submissions',
                populate: {
                    path: 'judgings creator screenings',
                    populate: {
                        path: 'judgingScores judge',
                        populate: {
                            path: 'criteria',
                        },
                    },
                },
            },
            { path: 'judges' },
            { path: 'criterias' },
        ])
        .sort({ createdAt: -1 })
        .orFail();

    const response: any[] = [];

    for (const contest of contests) {
        const { usersScores } = calculateContestScores(contest);

        const results: any[] = [];

        for (const submission of contest.submissions) {
            const score = usersScores.find(s => s.submissionId == submission.id);

            if (score) {
                results.push({
                    username: submission.creator.username,
                    osuId: submission.creator.osuId,
                    finalScore: isNaN(score.standardizedFinalScore) ? 0 : parseFloat(score.standardizedFinalScore.toFixed(4))
                });
            }
        }

        response.push({
            contestName: contest.name,
            contestId: contest.id,
            contestResults: results,
        });
    }

    return res.json(response);
});

export default interOpRouter;
