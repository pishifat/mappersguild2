import express from 'express';
import { LocusInfoModel } from '../../models/locusInfo';
import { isLoggedIn, isLocusAdmin } from '../../helpers/middlewares';
import { isValidUser } from './middlewares';

const locusRouter = express.Router();

locusRouter.use(isLoggedIn);
locusRouter.use(isLocusAdmin);

/* GET users listing. */
locusRouter.get('/query', async (req, res) => {
    const [locusInfos, self] = await Promise.all([
        LocusInfoModel
            .find({ isPublic: true })
            .defaultPopulate()
            .sort({ updatedAt: -1 }),
        LocusInfoModel
            .findOne({ user: req.session.mongoId })
            .defaultPopulate(),
    ]);

    let selfLocusInfo = self;

    if (!selfLocusInfo) {
        const newLocusInfo = new LocusInfoModel();
        newLocusInfo.user = req.session.mongoId;
        await newLocusInfo.save();

        selfLocusInfo = await LocusInfoModel
            .findOne({ user: req.session.mongoId })
            .defaultPopulate()
            .orFail();
    }

    res.json({ locusInfos, selfLocusInfo });
});

/* POST update timezone */
locusRouter.post('/:id/updateTimezone', isValidUser, async (req, res) => {
    const timezoneOptions = ['-11', '-10', '-9', '-8', '-7', '-6', '-5', '-4', '-3', '-2', '-1', '+0', '+1', '+2', '+3', '+4', '+5', '+6', '+7', '+8', '+9', '+10', '+11', '+12'];
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

/* POST update availability */
locusRouter.post('/:id/updateLanguage', isValidUser, async (req, res) => {
    const newLanguage = req.body.language;
    const locusInfo = res.locals.locusInfo;

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

    locusInfo.isPublic = !locusInfo.isPublic;
    await locusInfo.save();

    res.json(locusInfo.isPublic);
});

export default locusRouter;
