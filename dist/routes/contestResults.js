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
const submission_1 = require("../models/contest/submission");
const contestResultsRouter = express_1.default.Router();
const submissionPopulate = [
    {
        path: 'contest',
        select: 'name screeners',
    },
    {
        path: 'evaluations',
        select: 'comment vote',
    },
    {
        path: 'creator',
        select: 'username osuId',
    },
    {
        path: 'judgings',
        select: '-judge',
        populate: {
            path: 'judgingScores',
            populate: {
                path: 'criteria',
            },
        },
    },
];
contestResultsRouter.get('/searchSubmission/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const submission = yield submission_1.SubmissionModel
        .findById(req.params.id)
        .populate(submissionPopulate);
    res.json(submission);
}));
exports.default = contestResultsRouter;
