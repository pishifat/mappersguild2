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
            user = await user_1.UserModel.findOne()
                .byUsername(identifier)
                .select('osuId username mentorships')
                .populate('mentorships.cycle', 'name');
        }
        else {
            // Search by osuId
            user = await user_1.UserModel.findOne({ osuId })
                .select('osuId username mentorships')
                .populate('mentorships.cycle', 'name');
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
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
        const { usersScores } = listing_1.calculateContestScores(contest);
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
exports.default = interOpRouter;
