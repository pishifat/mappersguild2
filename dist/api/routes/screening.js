"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../helpers/middlewares");
const contest_1 = require("../models/contest/contest");
const submission_1 = require("../models/contest/submission");
const screening_1 = require("../models/contest/screening");
const contest_2 = require("../../interfaces/contest/contest");
const defaultContestPopulate = {
    path: 'submissions',
    select: '_id name evaluations',
    populate: {
        path: 'evaluations',
        populate: {
            path: 'screener',
            select: '_id osuId username',
        },
    },
};
const defaultSubmissionPopulate = {
    path: 'evaluations',
    populate: {
        path: 'screener',
        select: '_id osuId username',
    },
};
const screeningRouter = express_1.default.Router();
async function isScreener(req, res, next) {
    //if population doesn't work here, there's a problem
    const contests = await contest_1.ContestModel
        .find({
        status: contest_2.ContestStatus.Screening,
        screeners: res.locals.userRequest._id,
    })
        .populate(defaultContestPopulate)
        .select('_id name submissions screeners download');
    if (contests.length) {
        res.locals.contests = contests;
        return next();
    }
    return middlewares_1.unauthorize(req, res);
}
screeningRouter.use(middlewares_1.isLoggedIn);
screeningRouter.use(isScreener);
screeningRouter.get('/relevantInfo', (req, res) => {
    res.json({
        contests: res.locals.contests,
    });
});
/* POST update submission comment */
screeningRouter.post('/updateSubmission/:submissionId', async (req, res) => {
    let submission = await submission_1.SubmissionModel
        .findById(req.params.submissionId)
        .populate(defaultSubmissionPopulate)
        .orFail();
    const userEvaluation = submission.evaluations.find(e => e.screener.id === req.session?.mongoId);
    let vote = userEvaluation ? userEvaluation.vote : 0;
    if (req.body.vote !== undefined) {
        vote = parseInt(req.body.vote, 10);
        if (isNaN(vote)) {
            vote = 0;
        }
    }
    if (!userEvaluation) {
        const j = new screening_1.ScreeningModel();
        j.screener = req.session?.mongoId;
        j.comment = req.body.comment;
        j.vote = vote;
        await j.save();
        submission.evaluations.push(j);
        await submission.save();
    }
    else {
        const updatedValues = {};
        if (req.body.comment !== undefined) {
            updatedValues.comment = req.body.comment;
        }
        if (vote !== undefined) {
            updatedValues.vote = vote;
        }
        await screening_1.ScreeningModel.findByIdAndUpdate(userEvaluation.id, updatedValues);
    }
    submission = await submission_1.SubmissionModel
        .findById(req.params.submissionId)
        .populate(defaultSubmissionPopulate)
        .orFail();
    res.json(submission);
});
exports.default = screeningRouter;
