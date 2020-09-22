import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';
import { UserModel } from '../../models/user';
import { updateUserPoints } from '../../helpers/points';
import { webhookPost, webhookColors } from '../../helpers/discordApi';
import { UserGroup, User } from '../../interfaces/user';

const adminUsersRouter = express.Router();

adminUsersRouter.use(isLoggedIn);
adminUsersRouter.use(isAdmin);
adminUsersRouter.use(isSuperAdmin);

/* GET users - admin page */
adminUsersRouter.get('/', (req, res) => {
    res.render('admin/users', {
        title: 'Users - Admin',
        script: 'adminUsers.js',
        loggedInAs: req.session?.osuId,
        userMongoId: req.session?.mongoId,
        pointsInfo: res.locals.userRequest.pointsInfo,
    });
});

/* GET users */
adminUsersRouter.get('/load', async (req, res) => {
    const users = await UserModel.find({}).sort({ username: 1 });

    res.json(users);
});

/* POST update user badge */
adminUsersRouter.post('/:id/updateBadge', async (req, res) => {
    const badge = parseInt(req.body.badge, 10);
    const user = await UserModel.findByIdAndUpdate(req.params.id, { badge }).orFail();

    res.json(badge);

    let rankColor = webhookColors.white;

    if (badge == 1) {
        rankColor = webhookColors.brown;
    } else if (badge == 2) {
        rankColor = webhookColors.gray;
    } else if (badge == 3) {
        rankColor = webhookColors.lightYellow;
    } else if (badge == 4) {
        rankColor = webhookColors.lightBlue;
    }

    let description = `**Reached rank ${badge}** with ${user.totalPoints} total points`;

    if (badge == 4) description += `\n\n...there's no reward for this (yet) but 1000+ points is pretty impressive`;

    webhookPost([{
        author: {
            name: user.username,
            icon_url: `https://a.ppy.sh/${user.osuId}`,
            url: `https://osu.ppy.sh/u/${user.osuId}`,
        },
        color: rankColor,
        description,
    }]);
});

/* POST update user discordId */
adminUsersRouter.post('/:id/updateDiscordId', async (req, res) => {
    const discordId = parseInt(req.body.discordId, 10);
    await UserModel.findByIdAndUpdate(req.params.id, { discordId }).orFail();

    res.json(discordId);
});

/* POST calculate user points */
adminUsersRouter.post('/:id/calculateUserPoints', async (req, res) => {
    const points = await updateUserPoints(req.params.id);

    res.json(points);
});

/* POST update user points */
adminUsersRouter.post('/updateAllUserPoints', async (req, res) => {
    const users = await UserModel.find({}).select('username').orFail();

    for (const user of users) {
        updateUserPoints(user.id);
    }

    res.json('user points updated');
});

/* POST toggle bypassLogin */
adminUsersRouter.post('/:id/toggleBypassLogin', async (req, res) => {
    const bypassLogin = req.body.bypassLogin;
    const group = bypassLogin ? UserGroup.User : UserGroup.Spectator;

    await UserModel.findByIdAndUpdate(req.params.id, { bypassLogin, group }).orFail();

    res.json({ bypassLogin, group });
});

/* GET find tiered users */
adminUsersRouter.get('/findTieredUsers', async (req, res) => {
    const [osuUsers, taikoUsers, catchUsers, maniaUsers] = await Promise.all([
        UserModel
            .find({ rank: { $gte: 1 }, osuPoints: { $gte: 1 } })
            .orFail(),
        UserModel
            .find({ rank: { $gte: 1 }, taikoPoints: { $gte: 1 } })
            .orFail(),
        UserModel
            .find({ rank: { $gte: 1 }, catchPoints: { $gte: 1 } })
            .orFail(),
        UserModel
            .find({ rank: { $gte: 1 }, maniaPoints: { $gte: 1 } })
            .orFail(),
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

export default adminUsersRouter;
