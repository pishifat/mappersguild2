"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const middlewares_1 = require("../../helpers/middlewares");
const contest_1 = require("../../models/contest/contest");
const user_1 = require("../../models/user");
const user_2 = require("../../../interfaces/user");
const submission_1 = require("../../models/contest/submission");
const osuBot_1 = require("../../helpers/osuBot");
const criteria_1 = require("../../models/contest/criteria");
const points_1 = require("../../helpers/points");
const contest_2 = require("../../../interfaces/contest/contest");
const adminContestsRouter = express_1.default.Router();
adminContestsRouter.use(middlewares_1.isLoggedIn);
adminContestsRouter.use(middlewares_1.isSuperAdmin);
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
    const contests = await contest_1.ContestModel
        .find({})
        .populate(defaultContestPopulate)
        .sort({ contestStart: -1 });
    res.json(contests);
});
/* GET retrieve all criterias */
adminContestsRouter.get('/criterias', async (req, res) => {
    const criterias = await criteria_1.CriteriaModel.find({});
    res.json({ criterias });
});
/* POST create a contest */
adminContestsRouter.post('/create', async (req, res) => {
    if (!req.body.name) {
        return res.json({ error: 'Missing contest name' });
    }
    const contest = new contest_1.ContestModel();
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
    const criteria = new criteria_1.CriteriaModel();
    criteria.name = name;
    criteria.maxScore = maxScore;
    await criteria.save();
    const allCriteria = await criteria_1.CriteriaModel.find({});
    res.json(allCriteria);
});
/* POST update contest status */
adminContestsRouter.post('/:id/updateStatus', async (req, res) => {
    const contest = await contest_1.ContestModel
        .findByIdAndUpdate(req.params.id, { status: req.body.status })
        .populate(defaultContestPopulate)
        .orFail();
    res.json(contest.status);
    if (contest.status == contest_2.ContestStatus.Complete) {
        for (const submission of contest.submissions) {
            points_1.updateUserPoints(submission.creator._id);
        }
    }
});
/* POST update contest start date */
adminContestsRouter.post('/:id/updateContestStart', async (req, res) => {
    const newContestStart = new Date(req.body.date);
    if (!(newContestStart instanceof Date && !isNaN(newContestStart.getTime()))) {
        return res.json({ error: 'Invalid date' });
    }
    const contest = await contest_1.ContestModel
        .findById(req.params.id)
        .orFail();
    contest.contestStart = newContestStart;
    await contest.save();
    res.json(newContestStart);
});
/* POST update submissions download link */
adminContestsRouter.post('/:id/updateDownload', async (req, res) => {
    const download = req.body.download;
    const contest = await contest_1.ContestModel
        .findById(req.params.id)
        .orFail();
    contest.download = download;
    await contest.save();
    res.json(download);
});
/* POST add a screener to the list */
adminContestsRouter.post('/:id/screeners/add', async (req, res) => {
    const contest = await contest_1.ContestModel
        .findById(req.params.id)
        .orFail();
    const osuId = parseInt(req.body.screenerInput, 10);
    let user;
    if (isNaN(osuId)) {
        let regexp;
        if (req.body.screenerInput.indexOf('[') >= 0 || req.body.screenerInput.indexOf(']') >= 0) {
            regexp = new RegExp('^\\' + req.body.screenerInput + '$', 'i');
        }
        else {
            regexp = new RegExp('^' + req.body.screenerInput + '$', 'i');
        }
        user = await user_1.UserModel
            .findOne({ username: regexp })
            .orFail();
    }
    else {
        user = await user_1.UserModel
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
        contest_1.ContestModel
            .findById(req.params.id)
            .orFail(),
        user_1.UserModel
            .findById(req.body.screenerId)
            .orFail(),
    ]);
    if (!contest.screeners.includes(user._id)) {
        return res.json({ error: 'User is not a screener!' });
    }
    await contest_1.ContestModel
        .findByIdAndUpdate(contest._id, { $pull: { screeners: user._id } })
        .orFail();
    res.json(user);
});
/* POST add a judge to the list */
adminContestsRouter.post('/:id/judges/add', async (req, res) => {
    const contest = await contest_1.ContestModel
        .findById(req.params.id)
        .orFail();
    const osuId = parseInt(req.body.judgeInput, 10);
    let user;
    if (isNaN(osuId)) {
        let regexp;
        if (req.body.judgeInput.indexOf('[') >= 0 || req.body.judgeInput.indexOf(']') >= 0) {
            regexp = new RegExp('^\\' + req.body.judgeInput + '$', 'i');
        }
        else {
            regexp = new RegExp('^' + req.body.judgeInput + '$', 'i');
        }
        user = await user_1.UserModel
            .findOne({ username: regexp })
            .orFail();
    }
    else {
        user = await user_1.UserModel
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
        contest_1.ContestModel
            .findById(req.params.id)
            .orFail(),
        user_1.UserModel
            .findById(req.body.judgeId)
            .orFail(),
    ]);
    if (!contest.judges.includes(user._id)) {
        return res.json({ error: 'User is not a judge!' });
    }
    await contest_1.ContestModel
        .findByIdAndUpdate(contest._id, { $pull: { judges: user._id } })
        .orFail();
    res.json(user);
});
/* POST create a submission entry */
adminContestsRouter.post('/:id/submissions/create', async (req, res) => {
    const osuId = parseInt(req.body.osuId, 10);
    const [contest, user] = await Promise.all([
        contest_1.ContestModel
            .findById(req.params.id)
            .orFail(),
        user_1.UserModel
            .findOne({ osuId })
            .orFail(),
    ]);
    const submission = new submission_1.SubmissionModel();
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
    const contest = await contest_1.ContestModel.findById(req.params.id).orFail();
    // read masking csv
    const buffer = fs_1.default.readFileSync('contest.csv');
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
        const submission = new submission_1.SubmissionModel();
        submission.name = mask;
        const user = await user_1.UserModel.findOne({ osuId });
        if (user) {
            submission.creator = user._id;
        }
        else {
            const newUser = new user_1.UserModel();
            newUser.osuId = osuId;
            newUser.username = username;
            newUser.group = user_2.UserGroup.Spectator;
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
    const submission = await submission_1.SubmissionModel
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
    const contest = await contest_1.ContestModel
        .findById(req.params.id)
        .orFail();
    contest.judgingThreshold = newJudgingThreshold;
    await contest.save();
    res.json(newJudgingThreshold);
});
/* POST update criterias */
adminContestsRouter.post('/:id/toggleCriteria', async (req, res) => {
    const contest = await contest_1.ContestModel
        .findById(req.params.id)
        .populate(defaultContestPopulate)
        .orFail();
    const newCriteriaId = req.body.criteriaId;
    const criteriaIds = contest.criterias.map(c => c.id);
    const i = criteriaIds.findIndex(c => c === newCriteriaId);
    if (i >= 0) {
        criteriaIds.splice(i, 1);
    }
    else {
        criteriaIds.push(newCriteriaId);
    }
    const newContest = await contest_1.ContestModel
        .findByIdAndUpdate(req.params.id, { criterias: criteriaIds })
        .populate(defaultContestPopulate)
        .orFail();
    res.json(newContest.criterias);
});
/* POST send messages */
adminContestsRouter.post('/:id/sendMessages', async (req, res) => {
    const contest = await contest_1.ContestModel
        .findById(req.params.id)
        .populate(defaultContestPopulate)
        .orFail();
    if (contest.status !== contest_2.ContestStatus.Complete) {
        return res.json({ error: 'Contest must be set as complete!' });
    }
    let messages;
    req.body.users.push({ osuId: req.session.osuId });
    for (const user of req.body.users) {
        messages = await osuBot_1.sendMessages(user.osuId, req.body.messages);
    }
    if (messages !== true) {
        return res.json({ error: `Messages were not sent.` });
    }
    res.json({ success: 'Messages sent!' });
});
/* POST send all results messages to contest's participants */
adminContestsRouter.post('/:id/sendAllMessages', async (req, res) => {
    const contest = await contest_1.ContestModel
        .findById(req.params.id)
        .populate(defaultContestPopulate)
        .orFail();
    if (contest.status !== contest_2.ContestStatus.Complete) {
        return res.json({ error: 'Contest must be set as complete!' });
    }
    for (const submission of contest.submissions) {
        const messages = [];
        messages.push(`hello! thank you for participating in ${contest.name}!`);
        messages.push(`screening/judging details for your submission can be found here: https://mappersguild.com/contestresults?submission=${submission.id}`);
        messages.push(`a news post including the full results will be published soon!`);
        await osuBot_1.sendMessages(submission.creator.osuId, messages);
    }
    res.json({ success: 'Messages sent! A copy was sent to you for confirmation' });
});
exports.default = adminContestsRouter;
