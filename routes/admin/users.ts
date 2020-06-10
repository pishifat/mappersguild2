import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';
import { UserService } from '../../models/user';
import { updateUserPoints } from '../../helpers/points';
import { canFail } from '../../helpers/helpers';
import { webhookPost, webhookColors } from '../../helpers/discordApi';

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
    const users = await UserService.queryAll({ sort: { username: 1 } });

    res.json(users);
});

/* POST update user badge */
adminUsersRouter.post('/:id/updateBadge', canFail(async (req, res) => {
    const badge = parseInt(req.body.badge, 10);
    const user = await UserService.updateOrFail(req.params.id, { badge });

    res.json(badge);

    let rankColor = webhookColors.white;

    if (badge == 1) {
        rankColor = webhookColors.brown;
    } else if (badge == 2) {
        rankColor = webhookColors.gray;
    } else if (badge == 3) {
        rankColor = webhookColors.lightYellow;
    }

    webhookPost([{
        author: {
            name: user.username,
            icon_url: `https://a.ppy.sh/${user.osuId}`,
            url: `https://osu.ppy.sh/u/${user.osuId}`,
        },
        color: rankColor,
        description: `**Reached rank ${badge}** with ${user.totalPoints} total points`,
    }]);
}));

/* POST update user badge */
adminUsersRouter.post('/:id/calculateUserPoints', async (req, res) => {
    const points = await updateUserPoints(req.params.id);

    res.json(points);
});

/* POST update user points */
adminUsersRouter.post('/updateAllUserPoints', canFail(async (req, res) => {
    const users = await UserService.queryAllOrFail({ select: 'username' });

    for (const user of users) {
        updateUserPoints(user.id);
    }

    res.json('user points updated');
}));

export default adminUsersRouter;
