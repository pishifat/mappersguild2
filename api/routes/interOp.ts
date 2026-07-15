import express from 'express';
import config from '../../config.json';
import { UserModel } from '../models/user';
import { ContestModel } from '../models/contest/contest';
import { ContestMode, ContestStatus } from '../../interfaces/contest/contest';
import { calculateContestScores } from './contests/listing';
import { UserGroup } from '../../interfaces/user';
import { MentorshipCycleModel } from '../models/mentorshipCycle';
import { getUserInfoFromId, isOsuResponseError, getClientCredentialsGrant } from '../helpers/osuApi';

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
                    finalScore: isNaN(score.standardizedFinalScore) ? 0 : parseFloat(score.standardizedFinalScore.toFixed(4)),
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

/* GET all mentorships */
interOpRouter.get('/allMentorships', async (req, res) => {
    try {
        const users = await UserModel.find({ 'mentorships.0': { $exists: true } })
            .select('osuId username mentorships')
            .populate('mentorships.cycle', 'name');

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

/* POST a whole mentorship cycle's participants (bulk, append-with-dedupe).
   Used by the CMP site (osucmp.com) once at the end of each cycle, so MG's
   mentorship pages stay accurate without manual re-entry. Modeled on
   addMentor/addMentee in routes/mentorship.ts. */
interOpRouter.post('/mentorshipCycle', async (req, res) => {
    const { number, name, url, startDate, endDate, participants, dryRun } = req.body;

    if (!number || !Array.isArray(participants)) {
        return res.status(400).json({ error: 'number and participants are required' });
    }

    let cycle = await MentorshipCycleModel.findOne({ number });

    if (!cycle && !dryRun) {
        cycle = new MentorshipCycleModel();
        cycle.number = number;
        cycle.name = name || `Cycle ${number}`;
        if (url) cycle.url = url;
        if (startDate) cycle.startDate = new Date(startDate);
        if (endDate) cycle.endDate = new Date(endDate);
        await cycle.save();
    }

    const response = await getClientCredentialsGrant();

    if (isOsuResponseError(response)) {
        return res.status(500).json({ error: 'osu! auth failed' });
    }

    const token = response.access_token;
    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    const findOrCreateUser = async (osuId: number) => {
        let user = await UserModel.findOne({ osuId });

        if (!user) {
            const userInfo = await getUserInfoFromId(token, osuId.toString());

            if (isOsuResponseError(userInfo)) {
                return null;
            }

            user = new UserModel();
            user.osuId = userInfo.id;
            user.username = userInfo.username;
            user.group = UserGroup.User;

            if (!dryRun) {
                await user.save();
            }
        }

        return user;
    };

    for (const p of participants) {
        if (!p.osuId || !p.mode || !['mentor', 'extraMentor', 'mentee'].includes(p.group)) {
            errors.push(`invalid entry: ${JSON.stringify(p).slice(0, 100)}`);
            continue;
        }

        const user = await findOrCreateUser(p.osuId);

        if (!user) {
            errors.push(`osuId ${p.osuId}: not found on osu!`);
            continue;
        }

        const exists = cycle && user.mentorships.some(m =>
            m.cycle.toString() == cycle.id && m.mode == p.mode && m.group == p.group);

        if (exists) {
            skipped++;
            continue;
        }

        let mentorRef: any;

        if (p.group == 'mentee' || p.group == 'extraMentor') {
            const mentor = await findOrCreateUser(p.mentorOsuId);

            if (!mentor) {
                errors.push(`osuId ${p.osuId}: mentor ${p.mentorOsuId} not found on osu!`);
                continue;
            }

            mentorRef = mentor._id;
        }

        if (!dryRun && cycle) {
            const newMentorship: any = {
                cycle: cycle._id,
                mode: p.mode,
                group: p.group,
                phases: p.group == 'mentee' ? (p.phases || [1, 2, 3]) : [1, 2, 3],
            };

            if (mentorRef) {
                newMentorship.mentor = mentorRef;
            }

            user.mentorships.push(newMentorship);
            await user.save();
        }

        created++;
    }

    res.json({ created, skipped, errors });
});

export default interOpRouter;
