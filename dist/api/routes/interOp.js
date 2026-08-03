"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_json_1 = __importDefault(require("../../config.json"));
const user_1 = require("../models/user");
const contest_1 = require("../models/contest/contest");
const contest_2 = require("../../interfaces/contest/contest");
const listing_1 = require("./contests/listing");
const mentorshipCycle_1 = require("../models/mentorshipCycle");
const mentorshipRecord_1 = require("../models/mentorshipRecord");
const interOpRouter = express_1.default.Router();
/* AUTHENTICATION */
interOpRouter.use((req, res, next) => {
    const secret = req.header('secret');
    const username = req.header('username');
    if (!secret || !username) {
        return res.status(401).json({ error: 'Missing secret or username headers' });
    }
    const userConfig = config_json_1.default.interOpAccess[username];
    if (!userConfig || userConfig.secret !== secret) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.locals.interOpConfig = userConfig;
    return next();
});
function canWriteMentorships(req, res, next) {
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
            user = await user_1.UserModel.findOne()
                .byUsername(identifier)
                .select('osuId username')
                .populate({ path: 'mentorships', populate: { path: 'cycle', select: 'name' } });
        }
        else {
            // Search by osuId
            user = await user_1.UserModel.findOne({ osuId })
                .select('osuId username')
                .populate({ path: 'mentorships', populate: { path: 'cycle', select: 'name' } });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});
/* GET mapping contest results for all public contests (only users and final standardized scores) */
interOpRouter.get('/contestResults/:mode', async (req, res) => {
    const contests = await contest_1.ContestModel
        .find({
        status: contest_2.ContestStatus.Complete,
        mode: req.params.mode,
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
    const response = [];
    for (const contest of contests) {
        const { usersScores } = (0, listing_1.calculateContestScores)(contest);
        const results = [];
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
        const userIds = await mentorshipRecord_1.MentorshipRecordModel.distinct('user');
        const users = await user_1.UserModel.find({ _id: { $in: userIds } })
            .select('osuId username')
            .populate({ path: 'mentorships', populate: { path: 'cycle', select: 'name' } });
        res.json(users);
    }
    catch {
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
    const errors = [];
    for (const p of participants) {
        const needsMentorRef = p.group == 'mentee' || p.group == 'extraMentor';
        if (!p.osuId || !p.mode || !['mentor', 'extraMentor', 'mentee'].includes(p.group) ||
            (needsMentorRef && !p.mentorOsuId)) {
            errors.push(`invalid entry: ${JSON.stringify(p).slice(0, 100)}`);
        }
    }
    if (errors.length) {
        return res.status(400).json({ errors });
    }
    const osuIds = new Set();
    for (const p of participants) {
        osuIds.add(p.osuId);
        if (p.mentorOsuId) {
            osuIds.add(p.mentorOsuId);
        }
    }
    const users = await user_1.UserModel.find({ osuId: { $in: Array.from(osuIds) } }).select('osuId');
    const usersByOsuId = new Map(users.map(u => [u.osuId, u]));
    const missingOsuIds = Array.from(osuIds).filter(id => !usersByOsuId.has(id));
    if (missingOsuIds.length) {
        return res.status(400).json({
            error: 'These osuIds are not in the Mappers\' Guild database. Add them manually on the /mentorships page, then resubmit.',
            missingOsuIds,
        });
    }
    let cycle = await mentorshipCycle_1.MentorshipCycleModel.findOne({ number });
    if (!cycle) {
        cycle = new mentorshipCycle_1.MentorshipCycleModel();
        cycle.number = number;
        cycle.name = name || `Cycle ${number}`;
        if (url)
            cycle.url = url;
        if (startDate)
            cycle.startDate = new Date(startDate);
        if (endDate)
            cycle.endDate = new Date(endDate);
        await cycle.save();
    }
    let created = 0;
    let skipped = 0;
    for (const p of participants) {
        const user = usersByOsuId.get(p.osuId);
        const exists = await mentorshipRecord_1.MentorshipRecordModel.exists({
            user: user._id,
            cycle: cycle._id,
            mode: p.mode,
            group: p.group,
        });
        if (exists) {
            skipped++;
            continue;
        }
        const newMentorship = {
            user: user._id,
            cycle: cycle._id,
            mode: p.mode,
            group: p.group,
            phases: p.phases || [1, 2, 3],
        };
        if (p.mentorOsuId) {
            newMentorship.mentor = usersByOsuId.get(p.mentorOsuId)._id;
        }
        await mentorshipRecord_1.MentorshipRecordModel.create(newMentorship);
        created++;
    }
    res.json({ created, skipped });
});
exports.default = interOpRouter;
