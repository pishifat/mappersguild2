import express from 'express';
import config from '../../config.json';
import { UserModel } from '../models/user';
import { ContestModel } from '../models/contest/contest';
import { ContestStatus } from '../../interfaces/contest/contest';

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

/* GET mapping contest results for all public contests, minus comments and judge names */
interOpRouter.get('/contestResults', async (req, res) => {
    const contestPopulate = [
        {
            path: 'submissions',
            populate: [
                {
                    path: 'screenings',
                    select: 'comment vote',
                },
                {
                    path: 'judgings',
                    select: '-judge',
                    populate: {
                        path: 'judgingScores',
                        select: '-comment',
                        populate: {
                            path: 'criteria',
                        },
                    },
                },
                {
                    path: 'creator',
                    select: 'osuId username',
                },
            ],
        },
        {
            path: 'criterias',
            select: 'maxScore',
        },
        {
            path: 'creators',
            select: 'username osuId',
        },
    ];

    try {
        const contests = await ContestModel
            .find({ status: ContestStatus.Complete })
            .populate(contestPopulate)
            .sort({ createdAt: -1 });

        if (!contests) {
            return res.status(404).json({ error: 'Contests not found' });
        }

        res.json(contests);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default interOpRouter;
