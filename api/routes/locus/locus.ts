import express from 'express';
import { LocusInfoModel } from '../../models/locusInfo';
import { isLoggedIn } from '../../helpers/middlewares';
import { isValidUser } from './middlewares';

const locusRouter = express.Router();

locusRouter.use(isLoggedIn);

/* GET users listing. */
locusRouter.get('/query', async (req, res) => {
    const [locusInfos, self] = await Promise.all([
        LocusInfoModel
            .find({ isPublic: true })
            .populate({ path: 'user', select: 'username osuId' })
            .sort({ isOnTeam: 1, updatedAt: -1 }),
        LocusInfoModel
            .findOne({ user: req.session.mongoId })
            .populate({ path: 'user', select: 'username osuId' }),
    ]);

    let selfLocusInfo = self;

    if (!selfLocusInfo) {
        const newLocusInfo = new LocusInfoModel();
        newLocusInfo.user = req.session.mongoId;
        await newLocusInfo.save();

        selfLocusInfo = await LocusInfoModel
            .findOne({ user: req.session.mongoId })
            .populate({ path: 'user', select: 'username osuId' })
            .orFail();
    }

    res.json({ locusInfos, selfLocusInfo });
});

/* POST update timezone */
locusRouter.post('/:id/updateTimezone', isValidUser, async (req, res) => {
    const timezoneOptions = ['-11', '-10', '-9', '-8', '-7', '-6', '-5', '-4', '-3:30', '-3', '-2', '-1', '+0', '+1', '+2', '+3', '+4', '+5', '+6', '+7', '+8', '+9', '+10', '+11', '+12'];
    const newTimezone = req.body.timezone;
    const locusInfo = res.locals.locusInfo;

    if (!timezoneOptions.includes(newTimezone)) {
        return res.json({ error: 'Invalid timezone' });
    }

    locusInfo.timezone = newTimezone;
    await locusInfo.save();

    res.json(newTimezone);
});

/* POST update availability */
locusRouter.post('/:id/updateAvailability', isValidUser, async (req, res) => {
    const newAvailability = req.body.availability;
    const locusInfo = res.locals.locusInfo;

    locusInfo.availability = newAvailability;
    await locusInfo.save();

    res.json(newAvailability);
});

/* POST update language */
locusRouter.post('/:id/updateLanguage', isValidUser, async (req, res) => {
    const newLanguage = req.body.language;
    const locusInfo = res.locals.locusInfo;

    if (!newLanguage.length) {
        return res.json ({ error: 'Must select a language!' });
    }

    if (locusInfo.languages && locusInfo.languages.length) {
        const i = locusInfo.languages.findIndex(l => l == newLanguage);

        if (i > -1) {
            locusInfo.languages.splice(i, 1);
        } else {
            locusInfo.languages.push(newLanguage);
        }
    } else {
        locusInfo.languages = [newLanguage];
    }

    await locusInfo.save();

    res.json(newLanguage);
});

/* POST update role */
locusRouter.post('/:id/updateRole', isValidUser, async (req, res) => {
    const newRole = req.body.role;
    const locusInfo = res.locals.locusInfo;

    if (!newRole.length) {
        return res.json ({ error: 'Must select a role!' });
    }

    if (locusInfo.roles && locusInfo.roles.length) {
        const i = locusInfo.roles.findIndex(l => l == newRole);

        if (i > -1) {
            locusInfo.roles.splice(i, 1);
        } else {
            locusInfo.roles.push(newRole);
        }
    } else {
        locusInfo.roles = [newRole];
    }

    await locusInfo.save();

    res.json(newRole);
});

/* POST update discord */
locusRouter.post('/:id/updateDiscord', isValidUser, async (req, res) => {
    const newDiscord = req.body.discord;
    const locusInfo = res.locals.locusInfo;

    locusInfo.discord = newDiscord;
    await locusInfo.save();

    res.json(newDiscord);
});

/* POST update email */
locusRouter.post('/:id/updateEmail', isValidUser, async (req, res) => {
    const newEmail = req.body.email;
    const locusInfo = res.locals.locusInfo;

    locusInfo.email = newEmail;
    await locusInfo.save();

    res.json(newEmail);
});

/* POST update about */
locusRouter.post('/:id/updateAbout', isValidUser, async (req, res) => {
    const newAbout = req.body.about;
    const locusInfo = res.locals.locusInfo;

    locusInfo.about = newAbout;
    await locusInfo.save();

    res.json(newAbout);
});

/* POST toggle isPublic */
locusRouter.post('/:id/toggleIsPublic', isValidUser, async (req, res) => {
    const locusInfo = res.locals.locusInfo;

    if (!locusInfo.roles || !locusInfo.roles.length) {
        return res.json({ error: 'Must add at leaset one role!' });
    }

    locusInfo.isPublic = !locusInfo.isPublic;
    await locusInfo.save();

    res.json(locusInfo.isPublic);
});

/* POST toggle isOnTeam */
locusRouter.post('/:id/toggleIsOnTeam', isValidUser, async (req, res) => {
    const locusInfo = res.locals.locusInfo;

    locusInfo.isOnTeam = !locusInfo.isOnTeam;
    await locusInfo.save();

    res.json(locusInfo.isOnTeam);
});

export default locusRouter;
