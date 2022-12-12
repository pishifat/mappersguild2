"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../helpers/middlewares");
const user_1 = require("../models/user");
const mentorshipCycle_1 = require("../models/mentorshipCycle");
const mentorshipRouter = express_1.default.Router();
mentorshipRouter.use(middlewares_1.isLoggedIn);
mentorshipRouter.use(middlewares_1.isMentorshipAdmin);
const defaultCyclePopulate = [
    { path: 'participants', select: 'username osuId mentorships' },
];
const userCyclePopulate = [
    { path: 'mentorships.cycle', select: 'name startDate endDate number url' },
    { path: 'mentorships', populate: { path: 'mentor' } },
    { path: 'mentees' },
];
/* GET users listing. */
mentorshipRouter.get('/query', async (req, res) => {
    const admins = await user_1.UserModel
        .find({
        isMentorshipAdmin: true,
    })
        .sort({ username: 1 });
    const cycles = await mentorshipCycle_1.MentorshipCycleModel
        .find({})
        .populate(defaultCyclePopulate)
        .sort({ number: -1 });
    res.json({
        admins,
        cycles,
    });
});
/* GET user */
mentorshipRouter.get('/searchUser/:input', async (req, res) => {
    const input = req.params.input;
    const osuId = parseInt(input, 10);
    let user;
    if (isNaN(osuId)) {
        let regexp;
        if (input.indexOf('[') >= 0 || input.indexOf(']') >= 0) {
            regexp = new RegExp('^\\' + input + '$', 'i');
        }
        else {
            regexp = new RegExp('^' + input + '$', 'i');
        }
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
/* POST toggle mentorship admin */
mentorshipRouter.post('/toggleIsMentorshipAdmin', async (req, res) => {
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
        let regexp;
        if (req.body.userInput.indexOf('[') >= 0 || req.body.userInput.indexOf(']') >= 0) {
            regexp = new RegExp('^\\' + req.body.userInput + '$', 'i');
        }
        else {
            regexp = new RegExp('^' + req.body.userInput + '$', 'i');
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
    user.isMentorshipAdmin = !user.isMentorshipAdmin;
    await user.save();
    res.json(user);
});
/* POST add cycle */
mentorshipRouter.post('/addCycle', async (req, res) => {
    const { number, name, url, startDate, endDate } = req.body;
    if (!number || !name || !url || !startDate || !endDate) {
        return res.json({ error: 'Missing input!' });
    }
    const [numberCycle, nameCycle, urlCycle] = await Promise.all([
        mentorshipCycle_1.MentorshipCycleModel.findOne({ number }),
        mentorshipCycle_1.MentorshipCycleModel.findOne({ name }),
        mentorshipCycle_1.MentorshipCycleModel.findOne({ url }),
    ]);
    if (numberCycle) {
        return res.json({ error: 'Cycle already exists with this number!' });
    }
    if (nameCycle) {
        return res.json({ error: 'Cycle already exists with this name!' });
    }
    if (urlCycle) {
        return res.json({ error: 'Cycle already exists with this URL!' });
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
    await cycle.populate({
        path: 'participants',
    }).execPopulate();
    res.json(cycle);
});
/* POST add mentor */
mentorshipRouter.post('/addMentor', async (req, res) => {
    const { cycleId, userInput, mode } = req.body;
    const cycle = await mentorshipCycle_1.MentorshipCycleModel
        .findById(cycleId)
        .populate(defaultCyclePopulate)
        .orFail();
    let user;
    const osuId = parseInt(userInput, 10);
    if (isNaN(osuId)) {
        let regexp;
        if (userInput.indexOf('[') >= 0 || userInput.indexOf(']') >= 0) {
            regexp = new RegExp('^\\' + userInput + '$', 'i');
        }
        else {
            regexp = new RegExp('^' + userInput + '$', 'i');
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
    const exists = user.mentorships.some(m => m.cycle.toString() == cycle.id && m.mode == mode);
    if (exists) {
        return res.json({ error: 'User already mentor/mentee for this cycle and mode' });
    }
    user.mentorships.push({
        cycle: cycle._id,
        mode,
        group: 'mentor',
    });
    await user.save();
    await cycle.populate({
        path: 'participants',
    }).execPopulate();
    res.json(cycle);
});
/* POST add mentee */
mentorshipRouter.post('/addMentee', async (req, res) => {
    const { cycleId, userInput, mode, mentorId } = req.body;
    const cycle = await mentorshipCycle_1.MentorshipCycleModel
        .findById(cycleId)
        .populate(defaultCyclePopulate)
        .orFail();
    let user;
    const osuId = parseInt(userInput, 10);
    if (isNaN(osuId)) {
        let regexp;
        if (userInput.indexOf('[') >= 0 || userInput.indexOf(']') >= 0) {
            regexp = new RegExp('^\\' + userInput + '$', 'i');
        }
        else {
            regexp = new RegExp('^' + userInput + '$', 'i');
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
    const exists = user.mentorships.some(m => m.cycle.toString() == cycle.id && m.mode == mode);
    if (exists) {
        return res.json({ error: 'User already mentor/mentee for this cycle and mode' });
    }
    user.mentorships.push({
        cycle: cycle._id,
        mode,
        group: 'mentee',
        mentor: mentorId,
    });
    await user.save();
    await cycle.populate({
        path: 'participants',
    }).execPopulate();
    res.json(cycle);
});
/* POST remove participant */
mentorshipRouter.post('/removeParticipant', async (req, res) => {
    const { cycleId, userId, mode } = req.body;
    const [cycle, user] = await Promise.all([
        mentorshipCycle_1.MentorshipCycleModel
            .findById(cycleId)
            .populate(defaultCyclePopulate)
            .orFail(),
        user_1.UserModel
            .findById(userId)
            .orFail(),
    ]);
    const i = user.mentorships.findIndex(m => m.cycle.toString() == cycle.id && m.mode == mode);
    if (i !== -1) {
        user.mentorships.splice(i, 1);
    }
    await user.save();
    await cycle.populate({
        path: 'participants',
    }).execPopulate();
    res.json(cycle);
});
exports.default = mentorshipRouter;
