"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isComplete = exports.isEditable = exports.isContestCreator = void 0;
const contest_1 = require("../../../interfaces/contest/contest");
const contest_2 = require("../../models/contest/contest");
async function isContestCreator(req, res, next) {
    const id = req.params.id;
    const contest = await contest_2.ContestModel
        .findById(id)
        .orFail();
    if (!contest.creators || !contest.creators.length) {
        return res.json({ error: 'Contest has no creator' });
    }
    const creatorIds = contest.creators.map(c => c.toString());
    if (!creatorIds.includes(req.session?.mongoId) && req.session?.osuId !== 3178418) {
        return res.json({ error: 'You are not the contest creator!' });
    }
    next();
}
exports.isContestCreator = isContestCreator;
async function isEditable(req, res, next) {
    const id = req.params.id;
    const contest = await contest_2.ContestModel
        .findById(id)
        .orFail();
    if (contest.status == contest_1.ContestStatus.Complete && res.locals.userRequest.osuId !== 3178418) { // only pishifat can edit completed contests
        return res.json({ error: 'Cannot edit this section of completed contests' });
    }
    next();
}
exports.isEditable = isEditable;
async function isComplete(req, res, next) {
    const id = req.params.id;
    const contest = await contest_2.ContestModel
        .findById(id)
        .orFail();
    if (contest.status !== contest_1.ContestStatus.Complete) {
        return res.json({ error: 'Cannot load this on incomplete contests' });
    }
    next();
}
exports.isComplete = isComplete;
