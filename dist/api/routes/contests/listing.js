"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateContestScores = void 0;
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../../helpers/middlewares");
const discordApi_1 = require("../../helpers/discordApi");
const middlewares_2 = require("./middlewares");
const contest_1 = require("../../models/contest/contest");
const user_1 = require("../../models/user");
const submission_1 = require("../../models/contest/submission");
const osuBot_1 = require("../../helpers/osuBot");
const criteria_1 = require("../../models/contest/criteria");
const contest_2 = require("../../../interfaces/contest/contest");
const screening_1 = require("../../models/contest/screening");
const judging_1 = require("../../models/contest/judging");
const listingRouter = express_1.default.Router();
listingRouter.use(middlewares_1.isLoggedIn);
const limitedContestSelect = '-screeners -judges -judgingThreshold -criterias -download';
const defaultContestPopulate = [
    {
        path: 'submissions',
        populate: [
            {
                path: 'screenings',
                populate: {
                    path: 'screener',
                },
            },
            {
                path: 'creator',
                select: '_id osuId username',
            },
            {
                path: 'judgings',
                populate: {
                    path: 'judge',
                },
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
    {
        path: 'creators',
    },
];
// hides mediator info
function getLimitedDefaultPopulate(mongoId) {
    return [
        {
            path: 'submissions',
            select: '-screenings',
            match: {
                creator: mongoId,
            },
        },
        {
            path: 'creators',
            select: 'username osuId',
        },
    ];
}
function getQuerySelectPopulate(mongoId, contestType, showFullData, bypass) {
    let query;
    let select;
    let populate;
    if (contestType == 'activeContests') {
        query = { $nor: [{ status: contest_2.ContestStatus.Complete }, { status: contest_2.ContestStatus.Hidden }], isApproved: true };
        select = limitedContestSelect;
        populate = getLimitedDefaultPopulate(mongoId);
    }
    else if (contestType == 'completedContests') {
        query = { status: contest_2.ContestStatus.Complete, isApproved: true };
        select = limitedContestSelect;
        populate = [{ path: 'creators', select: 'username osuId' }];
    }
    else if (showFullData) {
        if (bypass)
            query = {};
        else
            query = { creators: mongoId };
        select = '';
        populate = defaultContestPopulate;
    }
    return { query, select, populate };
}
/* GET retrieve all the contests info */
listingRouter.get('/relevantInfo', async (req, res) => {
    const contestType = req.query.displayMode;
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip);
    const showFullData = contestType == 'myContests' || contestType == 'completedContests';
    const bypass = req.session.osuId == 3178418;
    const { query, select, populate } = getQuerySelectPopulate(req.session.mongoId, contestType, showFullData, bypass);
    const contests = await contest_1.ContestModel
        .find(query)
        .populate(populate)
        .sort({ createdAt: -1, contestStart: -1 })
        .select(select)
        .limit(limit)
        .skip(skip);
    res.json(contests);
});
/* GET specific contest from search */
listingRouter.get('/searchContest/:contestId', async (req, res) => {
    let contest = await contest_1.ContestModel
        .findOne({
        creators: req.session.mongoId,
        _id: req.params.contestId,
    })
        .populate(defaultContestPopulate);
    if (!contest) {
        const tempContest = await contest_1.ContestModel
            .findById(req.params.contestId)
            .orFail();
        if (tempContest.status == contest_2.ContestStatus.Complete) {
            contest = await contest_1.ContestModel
                .findById(req.params.contestId)
                .populate(defaultContestPopulate);
        }
        else {
            contest = await contest_1.ContestModel
                .findById(req.params.contestId)
                .populate(getLimitedDefaultPopulate(req.session.mongoId))
                .select(limitedContestSelect);
        }
    }
    res.json(contest);
});
/* GET user contests */
listingRouter.get('/loadUserContests', async (req, res) => {
    const contests = await contest_1.ContestModel
        .find({ creators: req.session.mongoId })
        .select('name');
    res.json(contests);
});
/* POST create a contest */
listingRouter.post('/create', async (req, res) => {
    const name = req.body.name.trim();
    const templateId = req.body.templateId;
    if (!name) {
        return res.json({ error: 'Missing contest name' });
    }
    const exists = await contest_1.ContestModel.findOne({ name });
    if (exists) {
        return res.json({ error: 'Contest with this name already exists!' });
    }
    const contest = new contest_1.ContestModel();
    contest.name = req.body.name.trim();
    contest.creators = [req.session.mongoId];
    if (templateId && templateId.length) {
        const templateContest = await contest_1.ContestModel.findById(templateId).orFail();
        contest.mode = templateContest.mode;
        contest.url = templateContest.url;
        contest.description = templateContest.description;
    }
    await contest.save();
    const newContest = await contest_1.ContestModel
        .findById(contest.id)
        .populate(defaultContestPopulate)
        .orFail();
    res.json(newContest);
});
/* POST update contest start date */
listingRouter.post('/:id/updateContestStart', middlewares_2.isContestCreator, middlewares_2.isEditable, async (req, res) => {
    const newContestStart = new Date(req.body.date);
    if (!(newContestStart instanceof Date && !isNaN(newContestStart.getTime()))) {
        return res.json({ error: 'Invalid date' });
    }
    const contest = await contest_1.ContestModel
        .findById(req.params.id)
        .orFail();
    if (contest.contestEnd && new Date(contest.contestEnd) < newContestStart) {
        return res.json({ error: 'Start date must be before end date!' });
    }
    contest.contestStart = newContestStart;
    await contest.save();
    res.json(contest.contestStart);
});
/* POST update contest end date */
listingRouter.post('/:id/updateContestEnd', middlewares_2.isContestCreator, middlewares_2.isEditable, async (req, res) => {
    const newContestEnd = new Date(req.body.date);
    if (!(newContestEnd instanceof Date && !isNaN(newContestEnd.getTime()))) {
        return res.json({ error: 'Invalid date' });
    }
    const contest = await contest_1.ContestModel
        .findById(req.params.id)
        .orFail();
    if (contest.contestStart && newContestEnd < new Date(contest.contestStart)) {
        return res.json({ error: 'End date must be after start date!' });
    }
    contest.contestEnd = newContestEnd;
    await contest.save();
    res.json(contest.contestEnd);
});
/* POST update contest status */
listingRouter.post('/:id/updateStatus', middlewares_2.isContestCreator, middlewares_2.isEditable, async (req, res) => {
    const contest = await contest_1.ContestModel
        .findById(req.params.id)
        .populate(defaultContestPopulate)
        .orFail();
    // beatmapping requirements
    const beatmappingStatusRequirements = [];
    if (!contest.contestStart)
        beatmappingStatusRequirements.push('start date');
    if (!contest.contestEnd)
        beatmappingStatusRequirements.push('end date');
    if (!contest.url)
        beatmappingStatusRequirements.push('details URL');
    if (!contest.description)
        beatmappingStatusRequirements.push('description');
    if (!contest.mode)
        beatmappingStatusRequirements.push('mode');
    if (beatmappingStatusRequirements.length) {
        return res.json({ error: `Missing requirements: ${beatmappingStatusRequirements.join(', ')}!` });
    }
    // general evaluation requirements (judging and screening)
    const evaluationStatusRequirements = [];
    // screening requirements
    if (req.body.status == contest_2.ContestStatus.Screening) {
        if (!contest.submissions.length)
            evaluationStatusRequirements.push('submissions');
        if (!contest.download)
            evaluationStatusRequirements.push('anonymized entries download link');
        for (const submission of contest.submissions) {
            if (!submission.name)
                evaluationStatusRequirements.push(`submission name (${submission.id})`);
        }
        if (!contest.screeners.length)
            evaluationStatusRequirements.push('screening users');
    }
    // judging requirements
    if (req.body.status == contest_2.ContestStatus.Judging) {
        if (!contest.submissions.length)
            evaluationStatusRequirements.push('submissions');
        if (!contest.download)
            evaluationStatusRequirements.push('anonymized entries download link');
        for (const submission of contest.submissions) {
            if (!submission.name)
                evaluationStatusRequirements.push(`submission name (${submission.id})`);
        }
        if (!contest.judges.length)
            evaluationStatusRequirements.push('judging users');
        if (!contest.judgingThreshold && contest.judgingThreshold != 0)
            evaluationStatusRequirements.push('judging threshold');
        if (!contest.criterias.length)
            evaluationStatusRequirements.push('judging criteria');
    }
    if (evaluationStatusRequirements.length) {
        return res.json({ error: `Missing requirements: ${evaluationStatusRequirements.join(', ')}!` });
    }
    // complete requirements
    const completeStatusRequirements = [];
    if (req.body.status == contest_2.ContestStatus.Complete) {
        if (!contest.submissions.length)
            completeStatusRequirements.push('submissions');
        if (!contest.download || !contest.download.length)
            completeStatusRequirements.push('anonymized entries download link');
        if (!contest.resultsUrl || !contest.resultsUrl.length)
            completeStatusRequirements.push('results url');
        for (const submission of contest.submissions) {
            if (!submission.name)
                completeStatusRequirements.push(`submission name (${submission.id})`);
        }
        const screenerIds = contest.screeners.map(s => s.id);
        const judgeIds = contest.judges.map(j => j.id);
        for (const submission of contest.submissions) {
            for (const screening of submission.screenings) {
                if (!screenerIds.includes(screening.screener.id)) {
                    //await ScreeningModel.findByIdAndRemove(screening.id);
                    completeStatusRequirements.push(`${screening.screener.username} has a saved screening despite not being a screener`);
                }
            }
            for (const judging of submission.judgings) {
                if (!judgeIds.includes(judging.judge.id)) {
                    completeStatusRequirements.push(`${judging.judge.username} has a saved judging despite not being a judge`);
                }
            }
        }
        for (const screener of contest.screeners) {
            let count = 0;
            for (const submission of contest.submissions) {
                for (const screening of submission.screenings) {
                    if (screening.screener.id == screener.id && screening.vote) {
                        count++;
                    }
                }
            }
            if (count < 5)
                completeStatusRequirements.push(`screener incomplete (${screener.username})`);
        }
        for (const submission of contest.submissions) {
            if (submission.judgings) {
                for (const judge of contest.judges) {
                    const judging = submission.judgings.find(j => j.judge.id === judge.id);
                    if (judging && judging.judgingScores.length !== contest.criterias.length) {
                        completeStatusRequirements.push(`judge incomplete (${judge.username})`);
                    }
                }
                if (submission.judgings.length && submission.judgings.length < contest.judges.length) {
                    completeStatusRequirements.push(`judging incomplete (${submission.id})`);
                }
            }
        }
    }
    if (completeStatusRequirements.length) {
        return res.json({ error: `Missing requirements: ${completeStatusRequirements.join(', ')}!` });
    }
    contest.status = req.body.status;
    await contest.save();
    if (req.body.status == contest_2.ContestStatus.Beatmapping) {
        discordApi_1.devWebhookPost([{
                color: discordApi_1.webhookColors.lightBlue,
                description: `**${contest.name}** pending approval\n\nlisting: https://mappersguild.com/contests/listing?contest=${contest.id}\nadmin: https://mappersguild.com/admin/summary`,
            }]);
    }
    res.json(contest.status);
});
/* POST update contest name */
listingRouter.post('/:id/updateName', middlewares_2.isContestCreator, middlewares_2.isEditable, async (req, res) => {
    const name = req.body.name.trim();
    if (!name.length) {
        return res.json({ error: `Name doesn't exist` });
    }
    const contest = await contest_1.ContestModel
        .findByIdAndUpdate(req.params.id, { name })
        .populate(defaultContestPopulate)
        .orFail();
    res.json(contest.name);
});
/* POST update contest mode */
listingRouter.post('/:id/updateMode', middlewares_2.isContestCreator, middlewares_2.isEditable, async (req, res) => {
    const contest = await contest_1.ContestModel
        .findById(req.params.id)
        .populate(defaultContestPopulate)
        .orFail();
    contest.mode = req.body.mode;
    await contest.save();
    res.json(contest.mode);
});
/* POST update contest description */
listingRouter.post('/:id/updateDescription', middlewares_2.isContestCreator, middlewares_2.isEditable, async (req, res) => {
    const contest = await contest_1.ContestModel
        .findByIdAndUpdate(req.params.id, { description: req.body.description.trim() })
        .populate(defaultContestPopulate)
        .orFail();
    res.json(contest.description);
});
/* POST update contest URL */
listingRouter.post('/:id/updateUrl', middlewares_2.isContestCreator, middlewares_2.isEditable, async (req, res) => {
    const contest = await contest_1.ContestModel
        .findByIdAndUpdate(req.params.id, { url: req.body.url })
        .populate(defaultContestPopulate)
        .orFail();
    res.json(contest.url);
});
/* POST update contest osu! contest listing URL */
listingRouter.post('/:id/updateOsuContestListingUrl', middlewares_2.isContestCreator, middlewares_2.isEditable, async (req, res) => {
    const contest = await contest_1.ContestModel
        .findByIdAndUpdate(req.params.id, { osuContestListingUrl: req.body.url })
        .populate(defaultContestPopulate)
        .orFail();
    res.json(contest.osuContestListingUrl);
});
/* POST update results URL */
listingRouter.post('/:id/updateResultsUrl', middlewares_2.isContestCreator, async (req, res) => {
    const contest = await contest_1.ContestModel
        .findByIdAndUpdate(req.params.id, { resultsUrl: req.body.url })
        .populate(defaultContestPopulate)
        .orFail();
    res.json(contest.resultsUrl);
});
/* POST update banner URL */
listingRouter.post('/:id/updateBannerUrl', middlewares_2.isContestCreator, async (req, res) => {
    const contest = await contest_1.ContestModel
        .findByIdAndUpdate(req.params.id, { bannerUrl: req.body.url })
        .populate(defaultContestPopulate)
        .orFail();
    res.json(contest.bannerUrl);
});
/* POST update submissions download link */
listingRouter.post('/:id/updateDownload', middlewares_2.isContestCreator, async (req, res) => {
    const download = req.body.download;
    const contest = await contest_1.ContestModel
        .findById(req.params.id)
        .orFail();
    contest.download = download;
    await contest.save();
    res.json(contest.download);
});
/* POST update submission anonymous name */
listingRouter.post('/:id/submissions/:submissionId/updateAnonymousSubmissionName', middlewares_2.isContestCreator, middlewares_2.isEditable, async (req, res) => {
    const submission = await submission_1.SubmissionModel
        .findById(req.params.submissionId)
        .orFail();
    submission.name = req.body.name;
    await submission.save();
    res.json(submission.name);
});
/* POST delete a submission */
listingRouter.post('/:id/submissions/:submissionId/delete', middlewares_2.isContestCreator, middlewares_2.isEditable, async (req, res) => {
    const submission = await submission_1.SubmissionModel
        .findByIdAndRemove(req.params.submissionId)
        .orFail();
    res.json(submission);
});
/* POST add a screener to the list */
listingRouter.post('/:id/screeners/add', middlewares_2.isContestCreator, middlewares_2.isEditable, async (req, res) => {
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
listingRouter.post('/:id/screeners/remove', middlewares_2.isContestCreator, middlewares_2.isEditable, async (req, res) => {
    const [contest, user] = await Promise.all([
        contest_1.ContestModel
            .findById(req.params.id)
            .populate(defaultContestPopulate)
            .orFail(),
        user_1.UserModel
            .findById(req.body.screenerId)
            .orFail(),
    ]);
    const screenerIds = contest.screeners.map(s => s.id);
    if (!screenerIds.includes(user.id)) {
        return res.json({ error: 'User is not a screener!' });
    }
    await contest_1.ContestModel
        .findByIdAndUpdate(contest._id, { $pull: { screeners: user._id } })
        .orFail();
    for (const submission of contest.submissions) {
        await screening_1.ScreeningModel
            .deleteMany({
            submission: submission._id,
            screener: user._id,
        });
    }
    res.json(user);
});
/* POST add a judge to the list */
listingRouter.post('/:id/judges/add', middlewares_2.isContestCreator, middlewares_2.isEditable, async (req, res) => {
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
listingRouter.post('/:id/judges/remove', middlewares_2.isContestCreator, middlewares_2.isEditable, async (req, res) => {
    const [contest, user] = await Promise.all([
        contest_1.ContestModel
            .findById(req.params.id)
            .populate(defaultContestPopulate)
            .orFail(),
        user_1.UserModel
            .findById(req.body.judgeId)
            .orFail(),
    ]);
    const judgeIds = contest.judges.map(j => j.id);
    if (!judgeIds.includes(user.id)) {
        return res.json({ error: 'User is not a judge!' });
    }
    await contest_1.ContestModel
        .findByIdAndUpdate(contest._id, { $pull: { judges: user._id } })
        .orFail();
    for (const submission of contest.submissions) {
        await judging_1.JudgingModel
            .deleteMany({
            submission: submission._id,
            judge: user._id,
        });
    }
    res.json(user);
});
/* POST update judging threshold */
listingRouter.post('/:id/updateJudgingThreshold', middlewares_2.isContestCreator, middlewares_2.isEditable, async (req, res) => {
    const newJudgingThreshold = parseInt(req.body.judgingThreshold);
    if (isNaN(newJudgingThreshold)) {
        return res.json({ error: 'Invalid number' });
    }
    const contest = await contest_1.ContestModel
        .findById(req.params.id)
        .orFail();
    contest.judgingThreshold = newJudgingThreshold;
    await contest.save();
    res.json(contest.judgingThreshold);
});
/* POST add criteria */
listingRouter.post('/:id/addCriteria', middlewares_2.isContestCreator, middlewares_2.isEditable, async (req, res) => {
    const name = req.body.name.toLowerCase();
    const maxScore = parseInt(req.body.maxScore);
    if (!name || !name.length) {
        return res.json({ error: 'Invalid name' });
    }
    if (isNaN(maxScore) || maxScore == 0) {
        return res.json({ error: 'Invalid maxScore' });
    }
    const [contest, exists] = await Promise.all([
        contest_1.ContestModel
            .findById(req.params.id)
            .orFail(),
        criteria_1.CriteriaModel
            .findOne({ name, maxScore }),
    ]);
    if (exists) {
        contest.criterias.push(exists.id);
        await contest.save();
    }
    else {
        const criteria = new criteria_1.CriteriaModel();
        criteria.name = name;
        criteria.maxScore = maxScore;
        const newCriteria = await criteria.save();
        contest.criterias.push(newCriteria.id);
        await contest.save();
    }
    const newContest = await contest_1.ContestModel
        .findById(req.params.id)
        .populate(defaultContestPopulate)
        .orFail();
    res.json(newContest.criterias);
});
/* POST add criteria */
listingRouter.post('/:id/deleteCriteria', middlewares_2.isContestCreator, middlewares_2.isEditable, async (req, res) => {
    const criteriaId = req.body.criteriaId;
    const [contest, criteria] = await Promise.all([
        contest_1.ContestModel
            .findById(req.params.id)
            .populate(defaultContestPopulate)
            .orFail(),
        criteria_1.CriteriaModel
            .findById(criteriaId)
            .orFail(),
    ]);
    const criteriaIndex = contest.criterias.findIndex(c => c.id == criteria.id);
    if (criteriaIndex !== -1) {
        contest.criterias.splice(criteriaIndex, 1);
        await contest.save();
    }
    const contestsWithCriteria = await contest_1.ContestModel
        .find({ criterias: { $in: criteria._id } });
    if (!contestsWithCriteria.length) {
        criteria_1.CriteriaModel.findByIdAndRemove(criteria.id);
    }
    const newContest = await contest_1.ContestModel
        .findById(req.params.id)
        .populate(defaultContestPopulate)
        .orFail();
    res.json(newContest.criterias);
});
/* POST toggle comment criteria */
listingRouter.post('/:id/toggleComments', middlewares_2.isContestCreator, async (req, res) => {
    const [contest, commentCriteria] = await Promise.all([
        contest_1.ContestModel
            .findById(req.params.id)
            .populate(defaultContestPopulate)
            .orFail(),
        criteria_1.CriteriaModel
            .findOne({ name: 'comments' })
            .orFail(),
    ]);
    const criteriaIds = contest.criterias.map(c => c.id);
    const i = criteriaIds.findIndex(c => c === commentCriteria.id);
    if (i >= 0) {
        criteriaIds.splice(i, 1);
    }
    else {
        criteriaIds.push(commentCriteria.id);
    }
    const newContest = await contest_1.ContestModel
        .findByIdAndUpdate(req.params.id, { criterias: criteriaIds })
        .populate(defaultContestPopulate)
        .orFail();
    res.json(newContest.criterias);
});
/* helper function for calculating judging results */
function calculateContestScores(contest) {
    const usersScores = [];
    const judgesCorrel = [];
    const judges = contest?.judges;
    const submissions = contest?.submissions;
    if (!contest || !submissions?.length || !judges?.length) {
        return {
            usersScores,
            judgesCorrel,
        };
    }
    for (const submission of submissions) {
        const userScore = {
            creator: submission.creator,
            criteriaSum: [],
            judgingSum: [],
            rawFinalScore: 0,
            standardizedFinalScore: 0,
        };
        for (const judging of submission.judgings) {
            let judgeSum = 0;
            for (const judgingScore of judging.judgingScores) {
                judgeSum += judgingScore.score;
                const i = userScore.criteriaSum.findIndex(j => j.criteriaId === judgingScore.criteria.id);
                if (i !== -1) {
                    userScore.criteriaSum[i].sum += judgingScore.score;
                }
                else {
                    userScore.criteriaSum.push({
                        criteriaId: judgingScore.criteria.id,
                        sum: judgingScore.score,
                        name: judgingScore.criteria.name,
                    });
                }
            }
            userScore.judgingSum.push({
                judgeId: judging.judge.id,
                sum: judgeSum,
                standardized: 0,
            });
        }
        userScore.rawFinalScore = userScore.criteriaSum.reduce((acc, c) => acc + c.sum, 0);
        usersScores.push(userScore);
    }
    if (usersScores.length) {
        const judgesIds = judges.map(j => j.id);
        for (const judgeId of judgesIds) {
            let judgeSum = 0;
            let judgeAvg = 0;
            let judgeSd = 0;
            let judgeStdSum = 0;
            // Get score avg for the current judge
            for (const userScore of usersScores) {
                judgeSum += userScore.judgingSum.find(j => j.judgeId === judgeId)?.sum || 0;
            }
            judgeAvg = judgeSum / usersScores.length;
            // Get SD for the current judge
            for (const userScore of usersScores) {
                const judgingSum = userScore.judgingSum.find(j => j.judgeId === judgeId);
                if (judgingSum) {
                    judgeSd += Math.pow(judgingSum.sum - judgeAvg, 2);
                }
            }
            judgeSd = Math.sqrt(judgeSd / usersScores.length);
            // Set standard score for each entry for the current judge
            for (let i = 0; i < usersScores.length; i++) {
                const j = usersScores[i].judgingSum.findIndex(j => j.judgeId === judgeId);
                if (j !== -1) {
                    // S* = S - S(avg) / SD
                    const stdScore = (usersScores[i].judgingSum[j].sum - judgeAvg) / judgeSd;
                    usersScores[i].standardizedFinalScore += stdScore;
                    usersScores[i].judgingSum[j].standardized = stdScore;
                    judgeStdSum += stdScore || 0;
                }
            }
            // Set standard score average for the current judge
            judgesCorrel.push({
                id: judgeId,
                rawAvg: judgeAvg,
                avg: judgeStdSum / usersScores.length,
                sd: judgeSd,
                correl: 0,
            });
        }
        // Get final standard scores average
        const totalStdAvg = usersScores.reduce((acc, s) => acc + s.standardizedFinalScore, 0) / usersScores.length;
        // Set correlation coefficient per judge
        for (const judgeId of judgesIds) {
            const i = judgesCorrel.findIndex(j => j.id === judgeId);
            const judgeAvg = judgesCorrel?.[i]?.avg || 0;
            let sum1 = 0;
            let sum2 = 0;
            let sum3 = 0;
            for (const teamScore of usersScores) {
                const judgingSum = teamScore.judgingSum.find(j => j.judgeId === judgeId);
                if (judgingSum) {
                    const x = (judgingSum.standardized - judgeAvg);
                    const y = (teamScore.standardizedFinalScore - totalStdAvg);
                    sum1 += x * y;
                    sum2 += Math.pow(x, 2);
                    sum3 += Math.pow(y, 2);
                }
            }
            judgesCorrel[i].correl = sum1 / (Math.sqrt(sum2 * sum3));
        }
    }
    usersScores.sort((a, b) => b.standardizedFinalScore - a.standardizedFinalScore);
    return {
        usersScores,
        judgesCorrel,
    };
}
exports.calculateContestScores = calculateContestScores;
/* GET contest judging results */
listingRouter.get('/:id/judgingResults', middlewares_2.isContestCreator, async (req, res) => {
    const contest = await contest_1.ContestModel
        .findById(req.params.id)
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
        .orFail();
    const filteredSubmissions = [...contest.submissions].filter(submission => {
        let total = 0;
        submission.screenings.forEach(e => {
            total += e.vote;
        });
        return total >= contest.judgingThreshold;
    });
    contest.submissions = filteredSubmissions;
    const { usersScores, judgesCorrel } = calculateContestScores(contest);
    res.json({
        contest,
        criterias: contest.criterias,
        usersScores,
        judgesCorrel,
    });
});
/* POST create submission */
listingRouter.post('/:id/createSubmission', middlewares_2.isEditable, async (req, res) => {
    const contest = await contest_1.ContestModel
        .findById(req.params.id)
        .populate(defaultContestPopulate)
        .orFail();
    const today = new Date();
    if (new Date(contest.contestStart) > today) {
        return res.json({ error: `Contest not accepting submissions until ${contest.contestStart}` });
    }
    if (new Date(contest.contestEnd) < today) {
        return res.json({ error: `This contest is no longer accepting new submissions.` });
    }
    const url = req.body.submissionUrl;
    if (contest.status !== contest_2.ContestStatus.Beatmapping) {
        return res.json({ error: 'Contest is not accepting new submissions!' });
    }
    const regexp = /^(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
    if (!regexp.test(url) && url) {
        return res.json({ error: 'Not a valid URL' });
    }
    const userSubmission = contest.submissions.find(s => s.creator.id == req.session.mongoId);
    if (!userSubmission) {
        const submission = new submission_1.SubmissionModel();
        submission.creator = req.session.mongoId;
        submission.url = url;
        await submission.save();
        contest.submissions.push(submission);
        await contest.save();
    }
    else {
        const submission = await submission_1.SubmissionModel
            .findById(userSubmission._id)
            .orFail();
        submission.url = url;
        await submission.save();
    }
    const newContest = await contest_1.ContestModel
        .findById(req.params.id)
        .populate(getLimitedDefaultPopulate(req.session.mongoId))
        .select(limitedContestSelect)
        .orFail();
    res.json(newContest.submissions);
});
/* POST create submissions from CSV data */
listingRouter.post('/:id/submissions/syncAnonymousNames', async (req, res) => {
    const contest = await contest_1.ContestModel
        .findById(req.params.id)
        .populate(defaultContestPopulate)
        .orFail();
    const csv = req.body.csv;
    const lines = csv.split('\n');
    const errors = [];
    for (const submission of contest.submissions) {
        const userLine = lines.find(line => {
            if (line.includes(submission.creator.osuId)) {
                return true;
            }
        });
        if (userLine) {
            const lineSplit = userLine.split(',');
            const mask = lineSplit[2];
            await submission_1.SubmissionModel.findByIdAndUpdate(submission._id, { name: mask });
        }
        else {
            errors.push(submission.creator.username);
        }
    }
    await contest.populate(defaultContestPopulate).execPopulate();
    res.json({ submissions: contest.submissions, errors });
});
/* POST create submissions from CSV data */
listingRouter.post('/:id/delete', middlewares_2.isContestCreator, middlewares_2.isEditable, async (req, res) => {
    const contest = await contest_1.ContestModel
        .findById(req.params.id)
        .populate(defaultContestPopulate)
        .orFail();
    if (contest.status != contest_2.ContestStatus.Hidden || contest.submissions.length) {
        return res.json({ error: 'Cannot delete contest at this stage. Set status to "Hidden" instead.' });
    }
    await contest.remove();
    res.json({ success: 'Deleted' });
});
/* POST update creators */
listingRouter.post('/:id/updateCreators', middlewares_2.isContestCreator, middlewares_2.isEditable, async (req, res) => {
    const usersSplit = req.body.creatorInput.split(',');
    const userIds = [];
    for (const u of usersSplit) {
        const user = await user_1.UserModel
            .findOne()
            .byUsernameOrOsuId(u.trim());
        if (!user) {
            return res.json({ error: `Cannot find ${u}!` });
        }
        else {
            userIds.push(user._id);
        }
    }
    await contest_1.ContestModel.findByIdAndUpdate(req.params.id, { creators: userIds });
    const updatedContest = await contest_1.ContestModel
        .findById(req.params.id)
        .populate(defaultContestPopulate)
        .orFail();
    res.json(updatedContest.creators);
});
/* POST send messages */
listingRouter.post('/:id/sendMessages', async (req, res) => {
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
listingRouter.post('/:id/sendAllMessages', async (req, res) => {
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
        messages.push(`screening/judging details for your submission can be found here: https://mappersguild.com/contests/results?submission=${submission.id}`);
        messages.push(`a news post including the full results will be published soon!`);
        await osuBot_1.sendMessages(submission.creator.osuId, messages);
    }
    res.json({ success: 'Messages sent! A copy was sent to you for confirmation' });
});
exports.default = listingRouter;
