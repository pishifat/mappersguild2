"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../helpers/middlewares");
const contest_1 = require("../models/contest/contest");
const submission_1 = require("../models/contest/submission");
const screening_1 = require("../models/contest/screening");
const contest_2 = require("../interfaces/contest/contest");
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
function isScreener(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const contests = yield contest_1.ContestModel
            .find({
            status: contest_2.ContestStatus.Screening,
            screeners: res.locals.userRequest._id,
        })
            .populate(defaultContestPopulate)
            .select('_id name submissions screeners');
        if (contests.length) {
            res.locals.contests = contests;
            return next();
        }
        return middlewares_1.unauthorize(req, res);
    });
}
screeningRouter.use(middlewares_1.isLoggedIn);
screeningRouter.use(isScreener);
screeningRouter.get('/relevantInfo', (req, res) => {
    res.json({
        contests: res.locals.contests,
    });
});
screeningRouter.post('/updateSubmission/:submissionId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let submission = yield submission_1.SubmissionModel
        .findById(req.params.submissionId)
        .populate(defaultSubmissionPopulate)
        .orFail();
    const userEvaluation = submission.evaluations.find(e => { var _a; return e.screener.id === ((_a = req.session) === null || _a === void 0 ? void 0 : _a.mongoId); });
    let vote = userEvaluation ? userEvaluation.vote : 0;
    if (req.body.vote !== undefined) {
        vote = parseInt(req.body.vote, 10);
        if (isNaN(vote)) {
            vote = 0;
        }
    }
    if (!userEvaluation) {
        const j = new screening_1.ScreeningModel();
        j.screener = (_a = req.session) === null || _a === void 0 ? void 0 : _a.mongoId;
        j.comment = req.body.comment;
        j.vote = vote;
        yield j.save();
        submission.evaluations.push(j);
        yield submission.save();
    }
    else {
        const updatedValues = {};
        if (req.body.comment !== undefined) {
            updatedValues.comment = req.body.comment;
        }
        if (vote !== undefined) {
            updatedValues.vote = vote;
        }
        yield screening_1.ScreeningModel.findByIdAndUpdate(userEvaluation.id, updatedValues);
    }
    submission = yield submission_1.SubmissionModel
        .findById(req.params.submissionId)
        .populate(defaultSubmissionPopulate)
        .orFail();
    res.json(submission);
}));
exports.default = screeningRouter;
