import express from 'express';
import { TeamInfoModel } from '../models/teamInfo';
import { isLoggedIn, isTeamContestUser, isTeamContestAdmin } from '../helpers/middlewares';

const teamContestRouter = express.Router();
const CONTEST = 'aspire6';

teamContestRouter.use(isLoggedIn);
teamContestRouter.use((req, res, next) => { res.locals.contest = CONTEST; next(); });

/* GET users listing. */
teamContestRouter.get('/query', async (req, res) => {
    const isAdmin = res.locals.userRequest.isTeamContestAdmin || res.locals.userRequest.group == 'admin';
    const listingQuery: Record<string, unknown> = { isPublic: true, contest: CONTEST };
    if (!isAdmin) listingQuery.isHiddenByAdmin = { $ne: true };

    const [teamInfos, self] = await Promise.all([
        TeamInfoModel
            .find(listingQuery)
            .populate({ path: 'user', select: 'username osuId' })
            .sort({ isOnTeam: 1, updatedAt: -1 }),
        TeamInfoModel
            .findOne({ user: req.session.mongoId, contest: CONTEST })
            .populate({ path: 'user', select: 'username osuId' }),
    ]);

    let selfTeamInfo = self;

    if (!selfTeamInfo) {
        const newTeamInfo = new TeamInfoModel();
        newTeamInfo.user = req.session.mongoId;
        newTeamInfo.contest = CONTEST;
        await newTeamInfo.save();

        selfTeamInfo = await TeamInfoModel
            .findOne({ user: req.session.mongoId, contest: CONTEST })
            .populate({ path: 'user', select: 'username osuId' })
            .orFail();
    }

    res.json({ teamInfos, selfTeamInfo });
});

/* POST update timezone */
teamContestRouter.post('/:id/updateTimezone', isTeamContestUser, async (req, res) => {
    const timezoneOptions = ['-11', '-10', '-9', '-8', '-7', '-6', '-5', '-4', '-3:30', '-3', '-2', '-1', '+0', '+1', '+2', '+3', '+4', '+5', '+6', '+7', '+8', '+9', '+10', '+11', '+12'];
    const newTimezone = req.body.timezone;
    const teamInfo = res.locals.teamInfo;

    if (!timezoneOptions.includes(newTimezone)) {
        return res.json({ error: 'Invalid timezone' });
    }

    teamInfo.timezone = newTimezone;
    await teamInfo.save();

    res.json(newTimezone);
});

/* POST update availability */
teamContestRouter.post('/:id/updateAvailability', isTeamContestUser, async (req, res) => {
    const newAvailability = req.body.availability;
    const teamInfo = res.locals.teamInfo;

    if (newAvailability.length > 1000) {
        return res.json({ error: 'Availability must be 1000 characters or less' });
    }

    teamInfo.availability = newAvailability;
    await teamInfo.save();

    res.json(newAvailability);
});

/* POST update language */
teamContestRouter.post('/:id/updateLanguage', isTeamContestUser, async (req, res) => {
    const newLanguage = req.body.language;
    const teamInfo = res.locals.teamInfo;

    if (!newLanguage.length) {
        return res.json({ error: 'Must select a language!' });
    }

    if (newLanguage.length > 1000) {
        return res.json({ error: 'Language must be 1000 characters or less' });
    }

    if (teamInfo.languages && teamInfo.languages.length) {
        const i = teamInfo.languages.findIndex(l => l == newLanguage);

        if (i > -1) {
            teamInfo.languages.splice(i, 1);
        } else {
            teamInfo.languages.push(newLanguage);
        }
    } else {
        teamInfo.languages = [newLanguage];
    }

    await teamInfo.save();

    res.json(newLanguage);
});

/* POST update role */
teamContestRouter.post('/:id/updateRole', isTeamContestUser, async (req, res) => {
    const newRole = req.body.role;
    const teamInfo = res.locals.teamInfo;

    if (!newRole.length) {
        return res.json({ error: 'Must select a role!' });
    }

    if (newRole.length > 1000) {
        return res.json({ error: 'Role must be 1000 characters or less' });
    }

    if (teamInfo.roles && teamInfo.roles.length) {
        const i = teamInfo.roles.findIndex(l => l == newRole);

        if (i > -1) {
            teamInfo.roles.splice(i, 1);
        } else {
            teamInfo.roles.push(newRole);
        }
    } else {
        teamInfo.roles = [newRole];
    }

    await teamInfo.save();

    res.json(newRole);
});

/* POST update discord */
teamContestRouter.post('/:id/updateDiscord', isTeamContestUser, async (req, res) => {
    const newDiscord = req.body.discord;
    const teamInfo = res.locals.teamInfo;

    if (newDiscord.length > 1000) {
        return res.json({ error: 'Discord must be 1000 characters or less' });
    }

    teamInfo.discord = newDiscord;
    await teamInfo.save();

    res.json(newDiscord);
});

/* POST update email */
teamContestRouter.post('/:id/updateEmail', isTeamContestUser, async (req, res) => {
    const newEmail = req.body.email;
    const teamInfo = res.locals.teamInfo;

    if (newEmail.length > 1000) {
        return res.json({ error: 'Email must be 1000 characters or less' });
    }

    teamInfo.email = newEmail;
    await teamInfo.save();

    res.json(newEmail);
});

/* POST update about */
teamContestRouter.post('/:id/updateAbout', isTeamContestUser, async (req, res) => {
    const newAbout = req.body.about;
    const teamInfo = res.locals.teamInfo;

    if (newAbout.length > 3000) {
        return res.json({ error: 'About must be 3000 characters or less' });
    }

    teamInfo.about = newAbout;
    await teamInfo.save();

    res.json(newAbout);
});

/* POST toggle isPublic */
teamContestRouter.post('/:id/toggleIsPublic', isTeamContestUser, async (req, res) => {
    const teamInfo = res.locals.teamInfo;

    if (!teamInfo.roles || !teamInfo.roles.length) {
        return res.json({ error: 'Must add at least one role!' });
    }

    teamInfo.isPublic = !teamInfo.isPublic;
    await teamInfo.save();

    res.json(teamInfo.isPublic);
});

/* POST toggle isOnTeam */
teamContestRouter.post('/:id/toggleIsOnTeam', isTeamContestUser, async (req, res) => {
    const teamInfo = res.locals.teamInfo;

    teamInfo.isOnTeam = !teamInfo.isOnTeam;
    await teamInfo.save();

    res.json(teamInfo.isOnTeam);
});

/* POST toggle isHiddenByAdmin */
teamContestRouter.post('/:id/toggleIsHiddenByAdmin', isTeamContestAdmin, async (req, res) => {
    const teamInfo = await TeamInfoModel.findOne({ _id: req.params.id, contest: CONTEST }).orFail();

    teamInfo.isHiddenByAdmin = !teamInfo.isHiddenByAdmin;
    await teamInfo.save();

    res.json(teamInfo.isHiddenByAdmin);
});

export default teamContestRouter;
