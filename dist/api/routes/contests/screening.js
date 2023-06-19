"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../../helpers/middlewares");
const contest_1 = require("../../models/contest/contest");
const submission_1 = require("../../models/contest/submission");
const screening_1 = require("../../models/contest/screening");
const contest_2 = require("../../../interfaces/contest/contest");
const defaultContestPopulate = {
    path: 'submissions',
    select: '_id name screenings url',
    populate: {
        path: 'screenings',
        populate: {
            path: 'screener',
            select: '_id osuId username',
        },
    },
};
const defaultSubmissionPopulate = {
    path: 'screenings',
    populate: {
        path: 'screener',
        select: '_id osuId username',
    },
};
const screeningRouter = express_1.default.Router();
async function isScreener(req, res, next) {
    const contest = await contest_1.ContestModel
        .findOne({
        $or: [
            {
                status: contest_2.ContestStatus.Screening,
                screeners: res.locals.userRequest._id,
                submissions: req.params.submissionId,
            },
            { isTempFormat: true },
        ],
    });
    if (contest) {
        return next();
    }
    return middlewares_1.unauthorize(req, res);
}
screeningRouter.use(middlewares_1.isLoggedIn);
/* GET page */
screeningRouter.get('/relevantInfo', async (req, res) => {
    const contests = await contest_1.ContestModel
        .find({
        $or: [
            {
                status: contest_2.ContestStatus.Screening,
                screeners: res.locals.userRequest._id,
            },
            { isTempFormat: true },
        ],
    })
        .populate(defaultContestPopulate)
        .select('_id name submissions screeners download status url screeningVoteCount isTempFormat');
    res.json(contests);
});
/* GET specific contest from search */
screeningRouter.get('/searchContest/:contestId', async (req, res) => {
    const contest = await contest_1.ContestModel
        .findOne({
        $or: [
            {
                status: contest_2.ContestStatus.Screening,
                screeners: res.locals.userRequest._id,
            },
            { isTempFormat: true },
        ],
    })
        .populate(defaultContestPopulate)
        .select('_id name submissions screeners download status url screeningVoteCount isTempFormat');
    res.json(contest);
});
/* POST update submission comment */
screeningRouter.post('/updateSubmission/:submissionId', isScreener, async (req, res) => {
    let submission = await submission_1.SubmissionModel
        .findById(req.params.submissionId)
        .populate(defaultSubmissionPopulate)
        .orFail();
    const userScreening = submission.screenings.find(s => s.screener.id === req.session?.mongoId);
    let vote = userScreening ? userScreening.vote : 0;
    if (req.body.vote !== undefined) {
        vote = parseInt(req.body.vote, 10);
        if (isNaN(vote)) {
            vote = 0;
        }
    }
    if (!userScreening) {
        const screening = new screening_1.ScreeningModel();
        screening.screener = req.session?.mongoId;
        screening.comment = req.body.comment;
        screening.vote = vote;
        screening.submission = submission._id;
        await screening.save();
    }
    else {
        const updatedValues = {};
        if (req.body.comment !== undefined) {
            updatedValues.comment = req.body.comment;
        }
        if (vote !== undefined) {
            updatedValues.vote = vote;
        }
        await screening_1.ScreeningModel.findByIdAndUpdate(userScreening.id, updatedValues);
    }
    submission = await submission_1.SubmissionModel
        .findById(req.params.submissionId)
        .populate(defaultSubmissionPopulate)
        .orFail();
    res.json(submission);
});
exports.default = screeningRouter;
