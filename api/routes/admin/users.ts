import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin, hasMerchAccess } from '../../helpers/middlewares';
import { getUserInfoFromId, getClientCredentialsGrant, isOsuResponseError } from '../../helpers/osuApi';
import { UserModel } from '../../models/user';
import { updateUserPoints } from '../../helpers/points';
import { UserGroup, User } from '../../../interfaces/user';
import { defaultErrorMessage } from '../../helpers/helpers';

const adminUsersRouter = express.Router();

adminUsersRouter.use(isLoggedIn);
adminUsersRouter.use(isAdmin);
adminUsersRouter.use(isSuperAdmin);

/* GET users */
adminUsersRouter.get('/load', async (req, res) => {
    const users = await UserModel.find({}).sort({ username: 1 });

    res.json(users);
});

/* GET search for one user */
adminUsersRouter.get('/searchUser/:userInput', async (req, res) => {
    const user = await UserModel
        .findOne()
        .byUsernameOrOsuId(req.params.userInput);

    res.json(user);
});

/* POST update user queuedBadge */
adminUsersRouter.post('/:id/updateQueuedBadge', async (req, res) => {
    const badge = parseInt(req.body.badge, 10);

    if (badge == 0) {
        await UserModel.findByIdAndUpdate(req.params.id, { queuedBadge: badge, badge }).orFail();
    } else {
        await UserModel.findByIdAndUpdate(req.params.id, { queuedBadge: badge }).orFail();
    }

    res.json(badge);
});

/* POST update user badge */
adminUsersRouter.post('/:id/updateBadge', async (req, res) => {
    const badge = parseInt(req.body.badge, 10);

    await UserModel.findByIdAndUpdate(req.params.id, { badge }).orFail();

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

/* POST toggle isWorldCupHelper */
adminUsersRouter.post('/:id/toggleIsWorldCupHelper', async (req, res) => {
    const isWorldCupHelper = req.body.isWorldCupHelper;

    await UserModel.findByIdAndUpdate(req.params.id, { isWorldCupHelper }).orFail();

    res.json({ isWorldCupHelper });
});

/* POST toggle hasMerchAccess */
adminUsersRouter.post('/:id/toggleHasMerchAccess', async (req, res) => {
    const hasMerchAccess = req.body.hasMerchAccess;

    await UserModel.findByIdAndUpdate(req.params.id, { hasMerchAccess }).orFail();

    res.json({ hasMerchAccess });
});

/* POST toggle hasSpecificMerchOrder */
adminUsersRouter.post('/:id/toggleHasSpecificMerchOrder', async (req, res) => {
    const hasSpecificMerchOrder = req.body.hasSpecificMerchOrder;

    await UserModel.findByIdAndUpdate(req.params.id, { hasSpecificMerchOrder }).orFail();

    res.json({ hasSpecificMerchOrder });
});

/* POST toggle worldCupMerch.active */
adminUsersRouter.post('/:id/toggleWorldCupMerchActive', async (req, res) => {
    const active = req.body.active;

    const user = await UserModel.findById(req.params.id).orFail();

    if (!user.worldCupMerch.active) {
        user.worldCupMerch = {
            active,
            coins: [],
            pin: false,
            sweater: 0,
            additionalItems: 0,
        };
    } else {
        user.worldCupMerch.active = active;
    }

    await user.save();

    res.json(user);
});

/* POST save worldCupMerch */
adminUsersRouter.post('/:id/saveWorldCupMerch', async (req, res) => {
    const worldCupMerch = req.body.worldCupMerch;
    const finalCoins: number = [];

    if (worldCupMerch.coins.length) {
        const coinsSplit = worldCupMerch.coins.split(',');

        for (const coin of coinsSplit) {
            finalCoins.push(parseInt(coin.trim()));
        }
    }

    const user = await UserModel.findById(req.params.id).orFail();

    user.worldCupMerch = {
        active: true,
        coins: finalCoins,
        pin: Boolean(worldCupMerch.pin),
        sweater: parseInt(worldCupMerch.sweater),
        additionalItems: parseInt(worldCupMerch.additionalItems),
    },

    await user.save();

    res.json(user);
});

/* POST reset hasMerchAccess */
adminUsersRouter.post('/resetMerchUsers', async (req, res) => {
    const osuIdInput = req.body.osuIdInput;
    const osuIdsSeparated = osuIdInput.split(',');
    const osuIds = osuIdsSeparated.map(id => id.trim());
    let query = {};

    switch (req.body.field) {
        case 'HasMerchAccess':
            query = { hasMerchAccess: true, osuId: { $nin: osuIds } };
            break;
        case 'HasSpecificMerchOrder':
            query = { hasSpecificMerchOrder: true, osuId: { $nin: osuIds } };
            break;
        case 'WorldCupMerch':
            query = { 'worldCupMerch.active': true, osuId: { $nin: osuIds } };
            break;
        default:
            return res.json({ error: 'no field' });
    }

    const users = await UserModel.find(query);

    for (const user of users) {
        switch (req.body.field) {
            case 'HasMerchAccess':
                user.hasMerchAccess = false;
                break;
            case 'HasSpecificMerchOrder':
                user.hasSpecificMerchOrder = false;
                break;
            case 'WorldCupMerch':
                user.worldCupMerch = {
                    active: false,
                    coins: [],
                    pin: false,
                    sweater: 0,
                    additionalItems: 0,
                };
                break;
            default:
                return res.json({ error: 'no field' });
        }

        await user.save();
    }

    res.json(users.length);
});

/* POST loadMerchUsers */
adminUsersRouter.post('/loadMerchUsers', async (req, res) => {
    let query = {};

    switch (req.body.field) {
        case 'HasMerchAccess':
            query = { hasMerchAccess: true };
            break;
        case 'HasSpecificMerchOrder':
            query = { hasSpecificMerchOrder: true };
            break;
        case 'WorldCupMerch':
            query = { 'worldCupMerch.active': true };
            break;
        default:
            return res.json({ error: 'no field' });
    }

    const users = await UserModel.find(query);

    res.json(users);
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

/* POST search user through osu api */
adminUsersRouter.post('/searchUser', async (req, res) => {
    const osuId = parseInt(req.body.osuId);

    if (isNaN(osuId)) {
        return res.json({ error: 'invalid osu id' });
    }

    const response = await getClientCredentialsGrant();

    if (isOsuResponseError(response)) {
        return res.json(defaultErrorMessage);
    }

    const token = response.access_token;
    const userInfo = await getUserInfoFromId(token, osuId);

    if (isOsuResponseError(userInfo)) {
        return res.json(defaultErrorMessage);
    }

    res.json(userInfo);
});

export default adminUsersRouter;
