import express from 'express';
import { isLoggedIn, isMentorshipAdmin } from '../helpers/middlewares';
import { UserModel } from '../models/user';
import { MentorshipCycleModel } from '../models/mentorshipCycle';

const mentorshipRouter = express.Router();

mentorshipRouter.use(isLoggedIn);
mentorshipRouter.use(isMentorshipAdmin);

const defaultPopulate = [
    { path: 'osuMentors', select: 'username osuId' },
    { path: 'taikoMentors', select: 'username osuId' },
    { path: 'catchMentors', select: 'username osuId' },
    { path: 'maniaMentors', select: 'username osuId' },
    { path: 'osuMentees', select: 'username osuId' },
    { path: 'taikoMentees', select: 'username osuId' },
    { path: 'catchMentees', select: 'username osuId' },
    { path: 'maniaMentees', select: 'username osuId' },
    { path: 'test', select: 'username' },
];

/* GET users listing. */
mentorshipRouter.get('/query', async (req, res) => {
    const admins = await UserModel
        .find({
            isMentorshipAdmin: true,
        })
        .sort({ username: 1 });

    const cycles = await MentorshipCycleModel
        .find({})
        .populate(defaultPopulate)
        .sort({ number: -1 });

    for (const cycle of cycles) {
        console.log(cycle.test);
    }

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
        } else {
            regexp = new RegExp('^' + input + '$', 'i');
        }

        user = await UserModel
            .findOne({ username: regexp })
            .orFail();
    } else {
        user = await UserModel
            .findOne({ osuId })
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
        user = await UserModel
            .findById(req.body.userId)
            .orFail();
    } else if (isNaN(osuId)) {
        let regexp;

        if (req.body.userInput.indexOf('[') >= 0 || req.body.userInput.indexOf(']') >= 0) {
            regexp = new RegExp('^\\' + req.body.userInput + '$', 'i');
        } else {
            regexp = new RegExp('^' + req.body.userInput + '$', 'i');
        }

        user = await UserModel
            .findOne({ username: regexp })
            .orFail();
    } else {
        user = await UserModel
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
        MentorshipCycleModel.findOne({ number }),
        MentorshipCycleModel.findOne({ name }),
        MentorshipCycleModel.findOne({ url }),
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

    const cycle = new MentorshipCycleModel();
    cycle.number = parseInt(number);
    cycle.name = name;
    cycle.url = url;
    cycle.startDate = new Date(startDate);
    cycle.endDate = new Date(endDate);
    await cycle.save();

    res.json(cycle);
});

/* POST add participant */
mentorshipRouter.post('/addParticipant', async (req, res) => {
    const { cycleId, userInput, mode, group } = req.body;

    const cycle = await MentorshipCycleModel
        .findById(cycleId)
        .populate(defaultPopulate)
        .orFail();

    let user;
    const osuId = parseInt(userInput, 10);

    if (isNaN(osuId)) {
        let regexp;

        if (userInput.indexOf('[') >= 0 || userInput.indexOf(']') >= 0) {
            regexp = new RegExp('^\\' + userInput + '$', 'i');
        } else {
            regexp = new RegExp('^' + userInput + '$', 'i');
        }

        user = await UserModel
            .findOne({ username: regexp })
            .orFail();
    } else {
        user = await UserModel
            .findOne({ osuId })
            .orFail();
    }

    let userIds: string[] = [];
    let invalid = false;

    if (group == 'mentor') {
        switch (mode) {
            case 'osu':
                userIds = cycle.osuMentors.map(u => u.id);

                if (!userIds.includes(user.id)) {
                    cycle.osuMentors.push(user);
                    break;
                } else {
                    invalid = true;
                    break;
                }

            case 'taiko':
                userIds = cycle.taikoMentors.map(u => u.id);

                if (!userIds.includes(user.id)) {
                    cycle.taikoMentors.push(user);
                    break;
                } else {
                    invalid = true;
                    break;
                }

            case 'catch':
                userIds = cycle.catchMentors.map(u => u.id);

                if (!userIds.includes(user.id)) {
                    cycle.catchMentors.push(user);
                    break;
                } else {
                    invalid = true;
                    break;
                }

            case 'mania':
                userIds = cycle.maniaMentors.map(u => u.id);

                if (!userIds.includes(user.id)) {
                    cycle.maniaMentors.push(user);
                    break;
                } else {
                    invalid = true;
                    break;
                }

            default:
                return res.json({ error: 'Invalid' });
        }
    } else if (group == 'mentee') {
        switch (mode) {
            case 'osu':
                userIds = cycle.osuMentees.map(u => u.id);

                if (!userIds.includes(user.id)) {
                    cycle.osuMentees.push(user);
                    break;
                } else {
                    invalid = true;
                    break;
                }

            case 'taiko':
                userIds = cycle.taikoMentees.map(u => u.id);

                if (!userIds.includes(user.id)) {
                    cycle.taikoMentees.push(user);
                    break;
                } else {
                    invalid = true;
                    break;
                }

            case 'catch':
                userIds = cycle.catchMentees.map(u => u.id);

                if (!userIds.includes(user.id)) {
                    cycle.catchMentees.push(user);
                    break;
                } else {
                    invalid = true;
                    break;
                }

            case 'mania':
                userIds = cycle.maniaMentees.map(u => u.id);

                if (!userIds.includes(user.id)) {
                    cycle.maniaMentees.push(user);
                    break;
                } else {
                    invalid = true;
                    break;
                }

            default:
                return res.json({ error: 'Invalid' });
        }
    }

    if (invalid) return res.json({ error: 'User already in list!' });

    await cycle.save();

    res.json(cycle);
});

/* POST remove participant */
mentorshipRouter.post('/removeParticipant', async (req, res) => {
    const { cycleId, userId, mode, group } = req.body;

    const [cycle, user] = await Promise.all([
        MentorshipCycleModel
            .findById(cycleId)
            .populate(defaultPopulate)
            .orFail(),

        UserModel
            .findById(userId)
            .orFail(),
    ]);

    let i;

    if (group == 'mentor') {
        switch (mode) {
            case 'osu':
                i = cycle.osuMentors.findIndex(u => u.id === user.id);

                if (i !== -1) {
                    cycle.osuMentors.splice(i, 1);
                }

                break;

            case 'taiko':
                i = cycle.taikoMentors.findIndex(u => u.id === user.id);

                if (i !== -1) {
                    cycle.taikoMentors.splice(i, 1);
                }

                break;

            case 'catch':
                i = cycle.catchMentors.findIndex(u => u.id === user.id);

                if (i !== -1) {
                    cycle.catchMentors.splice(i, 1);
                }

                break;

            case 'mania':
                i = cycle.maniaMentors.findIndex(u => u.id === user.id);

                if (i !== -1) {
                    cycle.maniaMentors.splice(i, 1);
                }

                break;

            default:
                return res.json({ error: 'Invalid' });
        }
    } else if (group == 'mentee') {
        switch (mode) {
            case 'osu':
                i = cycle.osuMentees.findIndex(u => u.id === user.id);

                if (i !== -1) {
                    cycle.osuMentees.splice(i, 1);
                }

                break;

            case 'taiko':
                i = cycle.taikoMentees.findIndex(u => u.id === user.id);

                if (i !== -1) {
                    cycle.taikoMentees.splice(i, 1);
                }

                break;

            case 'catch':
                i = cycle.catchMentees.findIndex(u => u.id === user.id);

                if (i !== -1) {
                    cycle.catchMentees.splice(i, 1);
                }

                break;

            case 'mania':
                i = cycle.maniaMentees.findIndex(u => u.id === user.id);

                if (i !== -1) {
                    cycle.maniaMentees.splice(i, 1);
                }

                break;

            default:
                return res.json({ error: 'Invalid' });
        }
    }

    await cycle.save();

    res.json(cycle);
});

export default mentorshipRouter;
