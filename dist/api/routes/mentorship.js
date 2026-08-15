"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../helpers/middlewares");
const user_1 = require("../models/user");
const log_1 = require("../models/log");
const log_2 = require("../../interfaces/log");
const user_2 = require("../../interfaces/user");
const mentorshipCycle_1 = require("../models/mentorshipCycle");
const mentorshipRecord_1 = require("../models/mentorshipRecord");
const osuApi_1 = require("../helpers/osuApi");
const helpers_1 = require("../helpers/helpers");
const mentorshipRouter = express_1.default.Router();
mentorshipRouter.use(middlewares_1.isLoggedIn);
const defaultCyclePopulate = [
    { path: 'records', populate: { path: 'user', select: 'username osuId' } },
];
const userCyclePopulate = [
    {
        path: 'mentorships',
        populate: [
            { path: 'cycle', select: 'name startDate endDate number url' },
            { path: 'mentor' },
        ],
    },
    {
        path: 'menteeRecords',
        populate: {
            path: 'user',
            populate: 'mentorships',
        },
    },
];
/* GET users listing. */
mentorshipRouter.get('/query', async (req, res) => {
    const isAdmin = res.locals.userRequest.isMentorshipAdmin;
    const admins = await user_1.UserModel
        .find({
        isMentorshipAdmin: true,
    })
        .sort({ username: 1 });
    const cycles = await mentorshipCycle_1.MentorshipCycleModel
        .find(isAdmin ? {} : { isPublic: true })
        .populate(defaultCyclePopulate)
        .sort({ number: -1 });
    res.json({
        admins,
        cycles,
    });
});
/* GET badge users */
mentorshipRouter.get('/loadTenureBadges', middlewares_1.isMentorshipAdmin, async (req, res) => {
    const userIds = await mentorshipRecord_1.MentorshipRecordModel.distinct('user');
    const users = await user_1.UserModel
        .find({ _id: { $in: userIds } })
        .populate(userCyclePopulate);
    const relevantUsers = [];
    for (const user of users) {
        if (!user.mentorshipBadge && user.mentorshipBadge !== 0) {
            user.mentorshipBadge = 0;
            await user.save();
        }
        const mentorships = user.mentorships.filter(m => {
            if (m.group == 'mentor' || m.group == 'extraMentor') {
                return true;
            }
        });
        if (mentorships.length) {
            const uniqueCycles = mentorships.reduce((unique, b) => {
                if (!unique.some(a => a.cycle.id === b.cycle.id)) {
                    unique.push(b);
                }
                return unique;
            }, []);
            let phases = 0;
            for (const mentorship of uniqueCycles) {
                if (new Date() > new Date(mentorship.cycle.endDate)) {
                    phases += mentorship.phases.length;
                }
            }
            const fullCycles = phases / 3;
            const years = Math.floor(fullCycles / 4);
            if (user.mentorshipBadge != years) {
                relevantUsers.push({
                    _id: user._id,
                    username: user.username,
                    osuId: user.osuId,
                    mentorshipBadge: user.mentorshipBadge,
                    actualTenure: years,
                });
            }
        }
    }
    res.json({ users: relevantUsers });
});
/* GET user */
mentorshipRouter.get('/searchUser/:input', async (req, res) => {
    const input = req.params.input;
    const osuId = parseInt(input, 10);
    let user;
    if (isNaN(osuId)) {
        const regexp = new RegExp('^' + (0, helpers_1.escapeUsername)(input) + '$', 'i');
        user = await user_1.UserModel
            .findOne({ username: regexp })
            .populate(userCyclePopulate)
            .orFail();
    }
    else {
        user = await user_1.UserModel
            .findOne({ osuId })
            .populate(userCyclePopulate)
            .orFail();
    }
    res.json(user);
});
/* GET extra mentees in UserDetails */
mentorshipRouter.get('/findExtraMentees/:cycleId/:userId/:mode', async (req, res) => {
    const { cycleId, userId, mode } = req.params;
    const [cycle, user] = await Promise.all([
        mentorshipCycle_1.MentorshipCycleModel
            .findById(cycleId)
            .populate(defaultCyclePopulate)
            .orFail(),
        user_1.UserModel
            .findById(userId)
            .populate('mentorships')
            .orFail(),
    ]);
    const mentorshipIndex = user.mentorships.findIndex(m => m.cycle.toString() == cycle.id && m.mode == mode && m.group == 'extraMentor');
    let extraMentees = [];
    if (mentorshipIndex != -1) {
        const mainMentor = await user_1.UserModel
            .findById(user.mentorships[mentorshipIndex].mentor)
            .populate(userCyclePopulate)
            .orFail();
        extraMentees = mainMentor.mentees.filter(m => {
            for (const mentorship of m.mentorships) {
                if (mentorship.cycle.toString() == cycle.id && mentorship.group == 'mentee' && mentorship.mode == mode && mentorship.mentor.toString() == mainMentor.id) {
                    return true;
                }
            }
        });
    }
    res.json(extraMentees);
});
/* POST toggle mentorship admin */
mentorshipRouter.post('/toggleIsMentorshipAdmin', middlewares_1.isMentorshipAdmin, async (req, res) => {
    let osuId;
    if (req.body.userInput) {
        osuId = parseInt(req.body.userInput, 10);
    }
    let user;
    if (req.body.userId) {
        user = await user_1.UserModel
            .findById(req.body.userId)
            .orFail();
    }
    else if (isNaN(osuId)) {
        const regexp = new RegExp('^' + (0, helpers_1.escapeUsername)(req.body.userInput) + '$', 'i');
        user = await user_1.UserModel
            .findOne({ username: regexp })
            .orFail();
    }
    else {
        user = await user_1.UserModel
            .findOne({ osuId })
            .orFail();
    }
    user.isMentorshipAdmin = !user.isMentorshipAdmin;
    await user.save();
    res.json(user);
});
/* POST add cycle */
mentorshipRouter.post('/addCycle', middlewares_1.isMentorshipAdmin, async (req, res) => {
    const { number, name, url, startDate, endDate, duplicateCycleId } = req.body;
    if (!number || !name || !url || !startDate || !endDate) {
        return res.json({ error: 'Missing input!' });
    }
    const [numberCycle, nameCycle] = await Promise.all([
        mentorshipCycle_1.MentorshipCycleModel.findOne({ number }),
        mentorshipCycle_1.MentorshipCycleModel.findOne({ name }),
    ]);
    if (numberCycle) {
        return res.json({ error: 'Cycle already exists with this number!' });
    }
    if (nameCycle) {
        return res.json({ error: 'Cycle already exists with this name!' });
    }
    if (startDate > endDate) {
        return res.json({ error: 'Cycle starts before cycle ends! Check your dates.' });
    }
    const cycle = new mentorshipCycle_1.MentorshipCycleModel();
    cycle.number = parseInt(number);
    cycle.name = name;
    cycle.url = url;
    cycle.startDate = new Date(startDate);
    cycle.endDate = new Date(endDate);
    await cycle.save();
    if (duplicateCycleId && duplicateCycleId.length) {
        const duplicateCycle = await mentorshipCycle_1.MentorshipCycleModel
            .findById(duplicateCycleId)
            .orFail();
        const duplicateRecords = await mentorshipRecord_1.MentorshipRecordModel.find({ cycle: duplicateCycle._id });
        for (const record of duplicateRecords) {
            await mentorshipRecord_1.MentorshipRecordModel.create({
                user: record.user,
                cycle: cycle._id,
                mode: record.mode,
                group: record.group,
                mentor: record.mentor,
                phases: record.phases,
            });
        }
    }
    await cycle.populate(defaultCyclePopulate);
    res.json(cycle);
});
/* POST add mentor */
mentorshipRouter.post('/addMentor', middlewares_1.isMentorshipAdmin, async (req, res) => {
    const { cycleId, userInput, mode, mainMentorId } = req.body;
    const [cycle, response] = await Promise.all([
        mentorshipCycle_1.MentorshipCycleModel
            .findById(cycleId)
            .populate(defaultCyclePopulate)
            .orFail(),
        (0, osuApi_1.getClientCredentialsGrant)(),
    ]);
    if ((0, osuApi_1.isOsuResponseError)(response)) {
        return res.json(helpers_1.defaultErrorMessage);
    }
    const token = response.access_token;
    let user;
    const osuId = parseInt(userInput, 10);
    if (isNaN(osuId)) {
        const regexp = new RegExp('^' + (0, helpers_1.escapeUsername)(userInput) + '$', 'i');
        user = await user_1.UserModel
            .findOne({ username: regexp });
    }
    else {
        user = await user_1.UserModel
            .findOne({ osuId });
    }
    if (!user) {
        const userInfo = await (0, osuApi_1.getUserInfoFromId)(token, userInput);
        if ((0, osuApi_1.isOsuResponseError)(userInfo)) {
            return res.json(helpers_1.defaultErrorMessage);
        }
        if (!(0, osuApi_1.isOsuResponseError)(userInfo)) {
            const osuId = userInfo.id;
            const username = userInfo.username;
            const group = user_2.UserGroup.User;
            const existingUser = await user_1.UserModel.findOne({ osuId });
            if (!existingUser) { // in case mg search doesn't find a user, but osu does
                user = new user_1.UserModel();
                user.osuId = osuId;
                user.username = username;
                user.group = group;
                await user.save();
            }
        }
    }
    const exists = await mentorshipRecord_1.MentorshipRecordModel.exists({ user: user._id, cycle: cycle._id, mode });
    if (exists) {
        return res.json({ error: 'User already mentor for this cycle and mode' });
    }
    const newMentorship = {
        user: user._id,
        cycle: cycle._id,
        mode,
        group: mainMentorId ? 'extraMentor' : 'mentor',
        phases: [1, 2, 3],
    };
    if (mainMentorId) {
        newMentorship.mentor = mainMentorId;
    }
    await mentorshipRecord_1.MentorshipRecordModel.create(newMentorship);
    await cycle.populate(defaultCyclePopulate);
    res.json(cycle);
});
/* POST add mentee */
mentorshipRouter.post('/addMentee', middlewares_1.isMentorshipAdmin, async (req, res) => {
    const { cycleId, userInput, mode, mentorId } = req.body;
    const [cycle, response] = await Promise.all([
        mentorshipCycle_1.MentorshipCycleModel
            .findById(cycleId)
            .populate(defaultCyclePopulate)
            .orFail(),
        (0, osuApi_1.getClientCredentialsGrant)(),
    ]);
    if ((0, osuApi_1.isOsuResponseError)(response)) {
        return res.json(helpers_1.defaultErrorMessage);
    }
    const token = response.access_token;
    let user;
    const osuId = parseInt(userInput, 10);
    if (isNaN(osuId)) {
        const regexp = new RegExp('^' + (0, helpers_1.escapeUsername)(userInput) + '$', 'i');
        user = await user_1.UserModel
            .findOne({ username: regexp });
    }
    else {
        user = await user_1.UserModel
            .findOne({ osuId });
    }
    if (!user) {
        const userInfo = await (0, osuApi_1.getUserInfoFromId)(token, userInput);
        if (!(0, osuApi_1.isOsuResponseError)(userInfo)) {
            const osuId = userInfo.id;
            const username = userInfo.username;
            const group = user_2.UserGroup.User;
            const existingUser = await user_1.UserModel.findOne({ osuId });
            if (!existingUser) { // in case mg search doesn't find a user, but osu does
                user = new user_1.UserModel();
                user.osuId = osuId;
                user.username = username;
                user.group = group;
                await user.save();
            }
        }
    }
    const mentorshipsThisCycle = await mentorshipRecord_1.MentorshipRecordModel.find({ user: user._id, cycle: cycle._id, mode });
    const phases = [];
    if (mentorshipsThisCycle && mentorshipsThisCycle.length) {
        for (const mentorship of mentorshipsThisCycle) {
            for (const phase of mentorship.phases) {
                phases.push(phase);
            }
        }
    }
    const maxPhases = [1, 2, 3];
    const validPhases = [];
    for (const num of maxPhases) {
        if (!phases.includes(num)) {
            validPhases.push(num);
        }
    }
    if (!validPhases.length) {
        return res.json({ error: 'User already mentee for all phases in this cycle and mode' });
    }
    await mentorshipRecord_1.MentorshipRecordModel.create({
        user: user._id,
        cycle: cycle._id,
        mode,
        group: 'mentee',
        mentor: mentorId,
        phases: validPhases,
    });
    await cycle.populate(defaultCyclePopulate);
    res.json(cycle);
});
/* POST remove participant */
mentorshipRouter.post('/removeParticipant', middlewares_1.isMentorshipAdmin, async (req, res) => {
    const { cycleId, userId, mode } = req.body;
    const [cycle] = await Promise.all([
        mentorshipCycle_1.MentorshipCycleModel
            .findById(cycleId)
            .populate(defaultCyclePopulate)
            .orFail(),
        user_1.UserModel
            .findById(userId)
            .orFail(),
    ]);
    const mentorship = await mentorshipRecord_1.MentorshipRecordModel.findOne({ user: userId, cycle: cycleId, mode });
    if (mentorship) {
        await mentorship.deleteOne();
    }
    await cycle.populate(defaultCyclePopulate);
    res.json(cycle);
});
/* POST update cycle name */
mentorshipRouter.post('/updateCycleName', middlewares_1.isMentorshipAdmin, async (req, res) => {
    const { cycleId, name } = req.body;
    const finalName = name.trim();
    const [cycle, exists] = await Promise.all([
        mentorshipCycle_1.MentorshipCycleModel
            .findById(cycleId)
            .populate(defaultCyclePopulate)
            .orFail(),
        mentorshipCycle_1.MentorshipCycleModel
            .findOne({ name: finalName }),
    ]);
    if (exists) {
        return res.json({ error: 'Cycle already exists with this name!' });
    }
    cycle.name = name;
    await cycle.save();
    await cycle.populate(defaultCyclePopulate);
    res.json(cycle);
});
/* POST update cycle number */
mentorshipRouter.post('/updateCycleNumber', middlewares_1.isMentorshipAdmin, async (req, res) => {
    const { cycleId, number } = req.body;
    const finalNumber = parseInt(number, 10);
    const [cycle, exists] = await Promise.all([
        mentorshipCycle_1.MentorshipCycleModel
            .findById(cycleId)
            .populate(defaultCyclePopulate)
            .orFail(),
        mentorshipCycle_1.MentorshipCycleModel
            .findOne({ number: finalNumber }),
    ]);
    if (exists) {
        return res.json({ error: 'Cycle already exists with this number!' });
    }
    cycle.number = finalNumber;
    await cycle.save();
    await cycle.populate(defaultCyclePopulate);
    res.json(cycle);
});
/* POST update cycle url */
mentorshipRouter.post('/updateCycleUrl', middlewares_1.isMentorshipAdmin, async (req, res) => {
    const { cycleId, url } = req.body;
    const finalUrl = url.trim();
    const cycle = await mentorshipCycle_1.MentorshipCycleModel
        .findById(cycleId)
        .populate(defaultCyclePopulate)
        .orFail();
    cycle.url = finalUrl;
    await cycle.save();
    await cycle.populate(defaultCyclePopulate);
    res.json(cycle);
});
/* POST update cycle start date */
mentorshipRouter.post('/updateCycleStartDate', middlewares_1.isMentorshipAdmin, async (req, res) => {
    const { cycleId, startDate } = req.body;
    const finalStartDate = new Date(startDate);
    const cycle = await mentorshipCycle_1.MentorshipCycleModel
        .findById(cycleId)
        .populate(defaultCyclePopulate)
        .orFail();
    const endDate = new Date(cycle.endDate);
    if (finalStartDate > endDate) {
        return res.json({ error: 'Cycle starts before cycle ends! Check your dates.' });
    }
    cycle.startDate = finalStartDate;
    await cycle.save();
    await cycle.populate(defaultCyclePopulate);
    res.json(cycle);
});
/* POST update cycle end date */
mentorshipRouter.post('/updateCycleEndDate', middlewares_1.isMentorshipAdmin, async (req, res) => {
    const { cycleId, endDate } = req.body;
    const finalEndDate = new Date(endDate);
    const cycle = await mentorshipCycle_1.MentorshipCycleModel
        .findById(cycleId)
        .populate(defaultCyclePopulate)
        .orFail();
    const startDate = new Date(cycle.startDate);
    if (startDate > finalEndDate) {
        return res.json({ error: 'Cycle starts before cycle ends! Check your dates.' });
    }
    cycle.endDate = finalEndDate;
    await cycle.save();
    await cycle.populate(defaultCyclePopulate);
    res.json(cycle);
});
/* POST toggle cycle isPublic */
mentorshipRouter.post('/toggleCycleIsPublic', middlewares_1.isMentorshipAdmin, async (req, res) => {
    const { cycleId } = req.body;
    const cycle = await mentorshipCycle_1.MentorshipCycleModel
        .findById(cycleId)
        .populate(defaultCyclePopulate)
        .orFail();
    cycle.isPublic = !cycle.isPublic;
    await cycle.save();
    await cycle.populate(defaultCyclePopulate);
    res.json(cycle);
});
/* POST add user manually */
mentorshipRouter.post('/addUserManually', middlewares_1.isMentorshipAdmin, async (req, res) => {
    const { usernameInput, osuIdInput } = req.body;
    const osuId = parseInt(osuIdInput, 10);
    const username = usernameInput.trim();
    if (isNaN(osuId)) {
        return res.json({ error: 'Invalid osu! ID' });
    }
    const user = await user_1.UserModel.findOne({
        $or: [
            { username },
            { osuId },
        ],
    });
    if (user) {
        return res.json({ error: `User already in Mappers' Guild` });
    }
    const newUser = new user_1.UserModel();
    newUser.osuId = osuId;
    newUser.username = username;
    newUser.group = user_2.UserGroup.User;
    await newUser.save();
    res.json(newUser);
});
/* POST toggle phase */
mentorshipRouter.post('/togglePhase', middlewares_1.isMentorshipAdmin, async (req, res) => {
    const { cycleId, userId, mode, phaseNum, mentorId } = req.body;
    const [cycle, user] = await Promise.all([
        mentorshipCycle_1.MentorshipCycleModel
            .findById(cycleId)
            .populate(defaultCyclePopulate)
            .orFail(),
        user_1.UserModel
            .findById(userId)
            .orFail(),
    ]);
    const query = { user: user._id, cycle: cycle._id, mode };
    if (mentorId) {
        query.mentor = mentorId;
    }
    const mentorship = await mentorshipRecord_1.MentorshipRecordModel.findOne(query);
    if (!mentorship) {
        return res.json({ error: `Couldn't find mentorship` });
    }
    // toggle the phase for relevant user's mentorship entry. save after following checks
    const phaseIndex = mentorship.phases.indexOf(phaseNum);
    if (phaseIndex !== -1) {
        mentorship.phases.splice(phaseIndex, 1);
    }
    else {
        // ensure the phase isn't active for another mentorship in the same cycle
        const mentorshipsThisCycle = await mentorshipRecord_1.MentorshipRecordModel.find({ user: user._id, cycle: cycle._id, mode });
        const phases = [];
        if (mentorshipsThisCycle && mentorshipsThisCycle.length) {
            for (const m of mentorshipsThisCycle) {
                for (const phase of m.phases) {
                    phases.push(phase);
                }
            }
        }
        if (phases.includes(phaseNum) && mentorId) {
            return res.json({ error: 'Mentee is already mentored in this phase of this cycle in this mode' });
        }
        else {
            mentorship.phases.push(phaseNum);
        }
    }
    // disallow removing phases if mentee is logged in that phase
    if (mentorship.group == 'mentor') {
        const cycleMentees = await mentorshipRecord_1.MentorshipRecordModel.find({ cycle: cycle._id, mode, mentor: user._id });
        for (const menteeRecord of cycleMentees) {
            const menteePhaseIndex = menteeRecord.phases.indexOf(phaseNum);
            // return if mentee is in phase that you're trying to remove from mentor
            if (phaseIndex !== -1 && menteePhaseIndex !== -1) {
                return res.json({ error: `Can't remove mentor from phase while mentee(s) are in phase` });
            }
        }
    }
    else if (mentorship.group == 'mentee') {
        const mentorMentorship = await mentorshipRecord_1.MentorshipRecordModel
            .findOne({ user: mentorship.mentor, cycle: cycle._id, mode })
            .orFail();
        const mentorPhaseIndex = mentorMentorship.phases.indexOf(phaseNum);
        // return if mentor isn't mentoring that phase
        if (mentorPhaseIndex == -1) {
            return res.json({ error: `Can't add mentee to phase that mentor isn't mentoring` });
        }
    }
    await mentorship.save();
    await cycle.populate(defaultCyclePopulate);
    res.json(cycle);
});
/* POST delete cycle + all mentorship records tied to it */
mentorshipRouter.post('/deleteCycle', middlewares_1.isMentorshipAdmin, async (req, res) => {
    const { cycleId } = req.body;
    if (res.locals.userRequest.osuId !== 16276548) {
        return res.json({ error: 'Only -White can delete cycles' });
    }
    const cycle = await mentorshipCycle_1.MentorshipCycleModel
        .findById(cycleId)
        .orFail();
    const { deletedCount } = await mentorshipRecord_1.MentorshipRecordModel.deleteMany({ cycle: cycle._id });
    await cycle.deleteOne();
    res.json({ success: true });
    log_1.LogModel.generate(req.session?.mongoId, `deleted mentorship cycle "${cycle.name}" (#${cycle.number}) and ${deletedCount} mentorship record(s)`, log_2.LogCategory.Mentorship);
});
/* POST edit badge value */
mentorshipRouter.post('/editBadgeValue', middlewares_1.isMentorshipAdmin, async (req, res) => {
    const { userId, value } = req.body;
    const user = await user_1.UserModel.findById(userId).orFail();
    if (value) {
        user.mentorshipBadge++;
    }
    else {
        user.mentorshipBadge--;
    }
    await user.save();
    res.json({ success: 'updated' });
    log_1.LogModel.generate(req.session?.mongoId, `adjusted badge value for ${user.username} (${user.mentorshipBadge})`, log_2.LogCategory.Mentorship);
});
exports.default = mentorshipRouter;
