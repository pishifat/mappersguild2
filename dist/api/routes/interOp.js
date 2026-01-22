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
        const contests = await contest_1.ContestModel
            .find({ status: contest_2.ContestStatus.Complete })
            .populate(contestPopulate)
            .sort({ createdAt: -1 });
        if (!contests) {
            return res.status(404).json({ error: 'Contests not found' });
        }
        res.json(contests);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = interOpRouter;
