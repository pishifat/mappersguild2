import express from 'express';
import { isLoggedIn, isMentorshipAdmin } from '../helpers/middlewares';
import { UserModel } from '../models/user';
import { UserGroup } from '../../interfaces/user';
import { MentorshipCycleModel } from '../models/mentorshipCycle';
import { getUserInfoFromId, isOsuResponseError } from '../helpers/osuApi';

const mentorshipRouter = express.Router();

mentorshipRouter.use(isLoggedIn);
mentorshipRouter.use(isMentorshipAdmin);

const defaultCyclePopulate = [
    { path: 'participants', select: 'username osuId mentorships' },
];

const userCyclePopulate = [
    { path: 'mentorships.cycle', select: 'name startDate endDate number url phases' },
    { path: 'mentorships', populate: { path: 'mentor' } },
    { path: 'mentees' },
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
        } else {
            regexp = new RegExp('^' + input + '$', 'i');
        }

        user = await UserModel
            .findOne({ username: regexp })
            .populate(userCyclePopulate)
            .orFail();
    } else {
        user = await UserModel
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
    const { number, name, url, startDate, endDate, duplicateCycleId } = req.body;

    if (!number || !name || !url || !startDate || !endDate) {
        return res.json({ error: 'Missing input!' });
    }

    const [numberCycle, nameCycle] = await Promise.all([
        MentorshipCycleModel.findOne({ number }),
        MentorshipCycleModel.findOne({ name }),
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

    const cycle = new MentorshipCycleModel();
    cycle.number = parseInt(number);
    cycle.name = name;
    cycle.url = url;
    cycle.startDate = new Date(startDate);
    cycle.endDate = new Date(endDate);
    await cycle.save();

    if (duplicateCycleId && duplicateCycleId.length) {
        const duplicateCycle = await MentorshipCycleModel
            .findById(duplicateCycleId)
            .orFail();

        const users = await UserModel
            .find({
                'mentorships.cycle': duplicateCycle._id,
            })
            .populate(userCyclePopulate);

        for (const user of users) {
            for (const mentorship of user.mentorships) {
                if (mentorship.cycle.id === duplicateCycle.id) {
                    user.mentorships.push({
                        cycle: cycle._id,
                        mode: mentorship.mode,
                        group: mentorship.group,
                        mentor: mentorship.mentor ? mentorship.mentor._id : null,
                        phases: mentorship.phases,
                    });
                }
            }

            await user.save();
        }
    }

    await cycle.populate({
        path: 'participants',
    }).execPopulate();

    res.json(cycle);
});

/* POST add mentor */
mentorshipRouter.post('/addMentor', async (req, res) => {
    const { cycleId, userInput, mode } = req.body;

    const cycle = await MentorshipCycleModel
        .findById(cycleId)
        .populate(defaultCyclePopulate)
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
            .findOne({ username: regexp });
    } else {
        user = await UserModel
            .findOne({ osuId });
    }

    if (!user) {
        const userInfo = await getUserInfoFromId(userInput);

        if (!isOsuResponseError(userInfo)) {
            const osuId = parseInt(userInfo.user_id, 10);
            const username = userInfo.username;
            const group = UserGroup.Spectator;
            const existingUser = await UserModel.findOne({ osuId });

            if (!existingUser) { // in case mg search doesn't find a user, but osu does
                user = new UserModel();
                user.osuId = osuId;
                user.username = username;
                user.group = group;
                await user.save();
            }
        }
    }

    const exists = user.mentorships.some(m => m.cycle.toString() == cycle.id && m.mode == mode);

    if (exists) {
        return res.json({ error: 'User already mentor/mentee for this cycle and mode' });
    }

    user.mentorships.push({
        cycle: cycle._id,
        mode,
        group: 'mentor',
        phases: [1,2,3],
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

    const cycle = await MentorshipCycleModel
        .findById(cycleId)
        .populate(defaultCyclePopulate)
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
            .findOne({ username: regexp });
    } else {
        user = await UserModel
            .findOne({ osuId });
    }

    if (!user) {
        const userInfo = await getUserInfoFromId(userInput);

        if (!isOsuResponseError(userInfo)) {
            const osuId = parseInt(userInfo.user_id, 10);
            const username = userInfo.username;
            const group = UserGroup.Spectator;
            const existingUser = await UserModel.findOne({ osuId });

            if (!existingUser) { // in case mg search doesn't find a user, but osu does
                user = new UserModel();
                user.osuId = osuId;
                user.username = username;
                user.group = group;
                await user.save();
            }
        }
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
        phases: [1,2,3],
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
        MentorshipCycleModel
            .findById(cycleId)
            .populate(defaultCyclePopulate)
            .orFail(),
        UserModel
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

/* POST update cycle name */
mentorshipRouter.post('/updateCycleName', async (req, res) => {
    const { cycleId, name } = req.body;
    const finalName = name.trim();

    const [cycle, exists] = await Promise.all([
        MentorshipCycleModel
            .findById(cycleId)
            .populate(defaultCyclePopulate)
            .orFail(),
        MentorshipCycleModel
            .findOne({ name: finalName }),
    ]);

    if (exists) {
        return res.json({ error: 'Cycle already exists with this name!' });
    }

    cycle.name = name;
    await cycle.save();

    await cycle.populate({
        path: 'participants',
    }).execPopulate();

    res.json(cycle);
});

/* POST update cycle number */
mentorshipRouter.post('/updateCycleNumber', async (req, res) => {
    const { cycleId, number } = req.body;
    const finalNumber = parseInt(number, 10);

    const [cycle, exists] = await Promise.all([
        MentorshipCycleModel
            .findById(cycleId)
            .populate(defaultCyclePopulate)
            .orFail(),
        MentorshipCycleModel
            .findOne({ number: finalNumber }),
    ]);

    if (exists) {
        return res.json({ error: 'Cycle already exists with this number!' });
    }

    cycle.number = finalNumber;
    await cycle.save();

    await cycle.populate({
        path: 'participants',
    }).execPopulate();

    res.json(cycle);
});

/* POST update cycle url */
mentorshipRouter.post('/updateCycleUrl', async (req, res) => {
    const { cycleId, url } = req.body;
    const finalUrl = url.trim();

    const cycle = await MentorshipCycleModel
        .findById(cycleId)
        .populate(defaultCyclePopulate)
        .orFail();

    cycle.url = finalUrl;
    await cycle.save();

    await cycle.populate({
        path: 'participants',
    }).execPopulate();

    res.json(cycle);
});

/* POST update cycle start date */
mentorshipRouter.post('/updateCycleStartDate', async (req, res) => {
    const { cycleId, startDate } = req.body;
    const finalStartDate = new Date(startDate);

    const cycle = await MentorshipCycleModel
        .findById(cycleId)
        .populate(defaultCyclePopulate)
        .orFail();

    const endDate = new Date(cycle.endDate);

    if (finalStartDate > endDate) {
        return res.json({ error: 'Cycle starts before cycle ends! Check your dates.' });
    }

    cycle.startDate = finalStartDate;
    await cycle.save();

    await cycle.populate({
        path: 'participants',
    }).execPopulate();

    res.json(cycle);
});

/* POST update cycle end date */
mentorshipRouter.post('/updateCycleEndDate', async (req, res) => {
    const { cycleId, endDate } = req.body;
    const finalEndDate = new Date(endDate);

    const cycle = await MentorshipCycleModel
        .findById(cycleId)
        .populate(defaultCyclePopulate)
        .orFail();

    const startDate = new Date(cycle.startDate);

    if (startDate > finalEndDate) {
        return res.json({ error: 'Cycle starts before cycle ends! Check your dates.' });
    }

    cycle.endDate = finalEndDate;
    await cycle.save();

    await cycle.populate({
        path: 'participants',
    }).execPopulate();

    res.json(cycle);
});

/* POST add restricted user */
mentorshipRouter.post('/addRestrictedUser', async (req, res) => {
    const { usernameInput, osuIdInput } = req.body;

    const osuId = parseInt(osuIdInput, 10);
    const username = usernameInput.trim();
    let user;

    if (isNaN(osuId)) {
        return res.json({ error: 'Invalid osu! ID' });
    }

    user = await UserModel.findOne  ({
        $or: [
            { username },
            { osuId },
        ],
    });

    if (user) {
        return res.json({ error: `User already in Mappers' Guild` });
    }

    const usernameUserInfo = await getUserInfoFromId(username);
    const osuIdUserInfo = await getUserInfoFromId(osuId);

    if (usernameUserInfo || osuIdUserInfo) {
        return res.json({ error: 'User exists on osu! web. Recheck username or osu! ID' });
    }

    user = new UserModel();
    user.osuId = osuId;
    user.username = username;
    user.group = UserGroup.Spectator;
    await user.save();

    res.json(user);
});

/* POST toggle phase */
mentorshipRouter.post('/togglePhase', async (req, res) => {
    const { cycleId, userId, mode, phaseNum } = req.body;

    const [cycle, user] = await Promise.all([
        MentorshipCycleModel
            .findById(cycleId)
            .populate(defaultCyclePopulate)
            .orFail(),
        UserModel
            .findById(userId)
            .populate(userCyclePopulate)
            .orFail(),
    ]);

    const mentorshipIndex = user.mentorships.findIndex(m => m.cycle.id == cycle.id && m.mode == mode);
    const mentorship = user.mentorships[mentorshipIndex];

    if (mentorshipIndex == -1) {
        return res.json({ error: `Couldn't find mentorship` });
    }

    // toggle the phase for relevant user's mentorship entry. save after following checks
    const phaseIndex = user.mentorships[mentorshipIndex].phases.indexOf(phaseNum);

    if (phaseIndex !== -1) {
        user.mentorships[mentorshipIndex].phases.splice(phaseIndex, 1);
    } else {
        user.mentorships[mentorshipIndex].phases.push(phaseNum);
    }

    // disallow removing phases if mentee is logged in that phase
    if (mentorship.group == 'mentor') {
        const cycleMentees = await UserModel
            .find({
                'mentorships.cycle': cycle.id,
                'mentorships.mentor': user.id,
            })
            .populate(userCyclePopulate);

        for (const mentee of cycleMentees) {
            const menteeMentorshipIndex = mentee.mentorships.findIndex(m => m.cycle.id == cycle.id && m.mode == mode && m.mentor.id == user.id);

            if (menteeMentorshipIndex !== -1) {
                const menteePhaseIndex = mentee.mentorships[menteeMentorshipIndex].phases.indexOf(phaseNum);

                // return if mentee is in phase that you're trying to remove from mentor
                if (phaseIndex !== -1 && menteePhaseIndex !== -1) {
                    return res.json({ error: `Can't remove mentor from phase while mentee(s) are in phase` });
                }
            }
        }
    } else if (mentorship.group == 'mentee') {
        const mentor = await UserModel
            .findById(mentorship.mentor._id)
            .populate(userCyclePopulate)
            .orFail();

        const mentorMentorshipIndex = mentor.mentorships.findIndex(m => m.cycle.id == cycle.id && m.mode == mode);
        const mentorPhaseIndex = mentor.mentorships[mentorMentorshipIndex].phases.indexOf(phaseNum);

        // return if mentor isn't mentoring that phase
        if (mentorPhaseIndex == -1) {
            return res.json({ error: `Can't add mentee to phase that mentor isn't mentoring` });
        }
    }

    await user.save();

    await cycle.populate({
        path: 'participants',
    }).execPopulate();

    res.json(cycle);
});

export default mentorshipRouter;
