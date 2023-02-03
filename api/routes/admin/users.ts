import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';
import { UserModel } from '../../models/user';
import { updateUserPoints } from '../../helpers/points';
import { sendMessages } from '../../helpers/osuBot';
import { UserGroup, User } from '../../../interfaces/user';

const adminUsersRouter = express.Router();

adminUsersRouter.use(isLoggedIn);
adminUsersRouter.use(isAdmin);
adminUsersRouter.use(isSuperAdmin);

/* GET users */
adminUsersRouter.get('/load', async (req, res) => {
    const users = await UserModel.find({}).sort({ username: 1 });

    res.json(users);
});

/* POST update user queuedBadge */
adminUsersRouter.post('/:id/updateBadge', async (req, res) => {
    const badge = parseInt(req.body.badge, 10);

    if (badge == 0) {
        await UserModel.findByIdAndUpdate(req.params.id, { queuedBadge: badge, badge }).orFail();
    } else {
        await UserModel.findByIdAndUpdate(req.params.id, { queuedBadge: badge }).orFail();
    }

    res.json(badge);
});

/* POST update user group */
adminUsersRouter.post('/:id/updateGroup', async (req, res) => {
    await UserModel.findByIdAndUpdate(req.params.id, { group: req.body.group }).orFail();

    res.json(req.body.group);
});

/* POST update user discordId */
adminUsersRouter.post('/:id/updateDiscordId', async (req, res) => {
    await UserModel.findByIdAndUpdate(req.params.id, { discordId: req.body.discordId }).orFail();

    res.json(req.body.discordId);
});

/* POST calculate user points */
adminUsersRouter.post('/:id/calculateUserPoints', async (req, res) => {
    const points = await updateUserPoints(req.params.id);

    res.json(points);
});

/* POST toggle bypassLogin */
adminUsersRouter.post('/:id/toggleBypassLogin', async (req, res) => {
    const bypassLogin = req.body.bypassLogin;
    const group = bypassLogin ? UserGroup.User : UserGroup.Spectator;

    await UserModel.findByIdAndUpdate(req.params.id, { bypassLogin, group }).orFail();

    res.json({ bypassLogin, group });
});

/* POST toggle isShowcaseMapper */
adminUsersRouter.post('/:id/toggleIsShowcaseMapper', async (req, res) => {
    const isShowcaseMapper = req.body.isShowcaseMapper;

    await UserModel.findByIdAndUpdate(req.params.id, { isShowcaseMapper }).orFail();

    res.json({ isShowcaseMapper });
});

/* POST toggle isMentorshipAdmin */
adminUsersRouter.post('/:id/toggleIsMentorshipAdmin', async (req, res) => {
    const isMentorshipAdmin = req.body.isMentorshipAdmin;

    await UserModel.findByIdAndUpdate(req.params.id, { isMentorshipAdmin }).orFail();

    res.json({ isMentorshipAdmin });
});

/* GET find FA showcase users */
adminUsersRouter.get('/findShowcaseUsers', async (req, res) => {
    const [osuUsers, taikoUsers, catchUsers, maniaUsers] = await Promise.all([
        UserModel
            .find({ isShowcaseMapper: true, group: { $nin: [UserGroup.Secret, UserGroup.Admin] }, osuPoints: { $gte: 1 } })
            .orFail(),
        UserModel
            .find({ isShowcaseMapper: true, group: { $nin: [UserGroup.Secret, UserGroup.Admin] }, taikoPoints: { $gte: 1 } })
            .orFail(),
        UserModel
            .find({ isShowcaseMapper: true, group: { $nin: [UserGroup.Secret, UserGroup.Admin] }, catchPoints: { $gte: 1 } })
            .orFail(),
        UserModel
            .find({ isShowcaseMapper: true, group: { $nin: [UserGroup.Secret, UserGroup.Admin] }, maniaPoints: { $gte: 1 } })
            .orFail(),
    ]);

    res.json({ osuUsers, taikoUsers, catchUsers, maniaUsers });
});

/* GET find Contest Helper users */
adminUsersRouter.get('/findContestHelperUsers', async (req, res) => {
    const [osuUsers, taikoUsers, catchUsers, maniaUsers] = await Promise.all([
        UserModel.find({ isContestHelper: true, osuPoints: { $gte: 1 } }),
        UserModel.find({ isContestHelper: true, taikoPoints: { $gte: 1 } }),
        UserModel.find({ isContestHelper: true, catchPoints: { $gte: 1 } }),
        UserModel.find({ isContestHelper: true, maniaPoints: { $gte: 1 } }),
    ]);

    res.json({ osuUsers, taikoUsers, catchUsers, maniaUsers });
});

/* POST find input users for DiscordHighlightGenerator */
adminUsersRouter.post('/findInputUsers', async (req, res) => {
    const inputUsers = req.body.inputUsers;
    const usernames = inputUsers.split('\n');
    const users: User[] = [];

    for (const username of usernames) {
        const user = await UserModel.findOne({ username }).orFail();
        users.push(user);
    }

    res.json({ users });
});

/* POST send messages */
adminUsersRouter.post('/sendMessages', async (req, res) => {
    let messages;

    for (const user of req.body.users) {
        messages = await sendMessages(user.osuId, req.body.messages);
    }

    if (messages !== true) {
        return res.json({ error: `Messages were not sent.` });
    }

    res.json({ success: 'Messages sent!' });
});

export default adminUsersRouter;
