import express from 'express';
import config from '../../config.json';
import { UserModel } from '../models/user';
import { ContestModel } from '../models/contest/contest';
import { ContestMode, ContestStatus } from '../../interfaces/contest/contest';
import { calculateContestScores } from './contests/listing';
import { MentorshipCycleModel } from '../models/mentorshipCycle';
import { MentorshipRecordModel } from '../models/mentorshipRecord';
import { MissionModel } from '../models/mission';
import { findBeatmapsetId } from '../helpers/helpers';

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

    res.locals.interOpConfig = userConfig;

    return next();
});

function canWriteMentorships(req, res, next): void {
    if (res.locals.interOpConfig?.canWriteMentorships) {
        return next();
    }

    return res.status(403).json({ error: 'This credential is not permitted to write mentorship data' });
}

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
                .select('osuId username')
                .populate({ path: 'mentorships', populate: { path: 'cycle', select: 'name' } });
        } else {
            // Search by osuId
            user = await UserModel.findOne({ osuId })
                .select('osuId username')
                .populate({ path: 'mentorships', populate: { path: 'cycle', select: 'name' } });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch {
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
        const userIds = await MentorshipRecordModel.distinct('user');

        const users = await UserModel.find({ _id: { $in: userIds } })
            .select('osuId username')
            .populate({ path: 'mentorships', populate: { path: 'cycle', select: 'name' } });

        res.json(users);
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});

/*
    POST new mentorship cycle + participants from osucmp.com
    for use by -White, who has interOp write permissions.
    this can only write mentorshipCycle + mentorshipRecords
*/
interOpRouter.post('/createMentorshipCycle', canWriteMentorships, async (req, res) => {
    const { number, name, url, startDate, endDate, participants } = req.body;

    if (!number || !Array.isArray(participants)) {
        return res.status(400).json({ error: 'number and participants are required' });
    }

    const errors: string[] = [];

    for (const p of participants) {
        const needsMentorRef = p.group == 'mentee' || p.group == 'extraMentor';

        if (
            !p.osuId || !p.mode || !['mentor', 'extraMentor', 'mentee'].includes(p.group) ||
            (needsMentorRef && !p.mentorOsuId)
        ) {
            errors.push(`invalid entry: ${JSON.stringify(p).slice(0, 100)}`);
        }
    }

    if (errors.length) {
        return res.status(400).json({ errors });
    }

    const osuIds = new Set<number>();

    for (const p of participants) {
        osuIds.add(p.osuId);

        if (p.mentorOsuId) {
            osuIds.add(p.mentorOsuId);
        }
    }

    const users = await UserModel.find({ osuId: { $in: Array.from(osuIds) } }).select('osuId');
    const usersByOsuId = new Map(users.map(u => [u.osuId, u]));
    const missingOsuIds = Array.from(osuIds).filter(id => !usersByOsuId.has(id));

    if (missingOsuIds.length) {
        return res.status(400).json({
            error: 'These osuIds are not in the Mappers\' Guild database. Add them manually on the /mentorships page, then resubmit.',
            missingOsuIds,
        });
    }

    let cycle = await MentorshipCycleModel.findOne({ number });

    if (!cycle) {
        cycle = new MentorshipCycleModel();
        cycle.number = number;
        cycle.name = name || `Cycle ${number}`;
        if (url) cycle.url = url;
        if (startDate) cycle.startDate = new Date(startDate);
        if (endDate) cycle.endDate = new Date(endDate);
        await cycle.save();
    }

    let created = 0;
    let skipped = 0;

    for (const p of participants) {
        const user = usersByOsuId.get(p.osuId)!;

        const exists = await MentorshipRecordModel.exists({
            user: user._id,
            cycle: cycle._id,
            mode: p.mode,
            group: p.group,
        });

        if (exists) {
            skipped++;
            continue;
        }

        const newMentorship: any = {
            user: user._id,
            cycle: cycle._id,
            mode: p.mode,
            group: p.group,
            phases: p.phases || [1, 2, 3],
        };

        if (p.mentorOsuId) {
            newMentorship.mentor = usersByOsuId.get(p.mentorOsuId)!._id;
        }

        await MentorshipRecordModel.create(newMentorship);
        created++;
    }

    res.json({ created, skipped });
});

/* GET winning beatmaps' osuIds + missionTier for BN event missions */
interOpRouter.get('/bnEvent', async (req, res) => {
    // spring 2026 quests https://osu.ppy.sh/home/news/2026-03-16-mappers-guild-spring-2026-priority-quests
    const missionIds = [
        '69b4f0530ff92c44ae66009d',
        '69b4f07b0ff92c44ae6600a2',
        '69b4f0940ff92c44ae6600a6',
        '69b4f0a80ff92c44ae6600aa',
        '69b4f1060ff92c44ae6600b2',
        '69b4f0bb0ff92c44ae6600ae',
    ];

    // https://discord.com/channels/90072389919997952/1470566659746955405/1528357168158347364
    const rankedDateCutoff = new Date('2026-07-29T00:00:00.000Z');

    try {
        const missions = await MissionModel
            .find({ _id: { $in: missionIds } })
            .select('tier winningBeatmaps')
            .populate({ path: 'winningBeatmaps', select: 'url rankedDate' });

        const response: { osuId: number; missionTier: number }[] = [];

        for (const mission of missions) {
            let missionTier = 0;

            // https://discord.com/channels/90072389919997952/1470566659746955405/1528356547330314390
            switch (mission.tier) {
                case 1:
                    missionTier = 1.5;
                    break;
                case 2:
                    missionTier = 2;
                    break;
                case 3:
                    missionTier = 2.5;
                    break;
                case 4:
                    missionTier = 2.5;
                    break;
                default:
                    break;
            }

            for (const beatmap of mission.winningBeatmaps) {
                if (beatmap.rankedDate && beatmap.rankedDate <= rankedDateCutoff) {
                    response.push({
                        osuId: findBeatmapsetId(beatmap.url),
                        missionTier,
                    });
                }
            }
        }

        res.json(response);
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default interOpRouter;
