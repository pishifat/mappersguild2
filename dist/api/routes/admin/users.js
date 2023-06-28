"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../../helpers/middlewares");
const user_1 = require("../../models/user");
const points_1 = require("../../helpers/points");
const user_2 = require("../../../interfaces/user");
const adminUsersRouter = express_1.default.Router();
adminUsersRouter.use(middlewares_1.isLoggedIn);
adminUsersRouter.use(middlewares_1.isAdmin);
adminUsersRouter.use(middlewares_1.isSuperAdmin);
/* GET users */
adminUsersRouter.get('/load', async (req, res) => {
    const users = await user_1.UserModel.find({}).sort({ username: 1 });
    res.json(users);
});
/* POST update user queuedBadge */
adminUsersRouter.post('/:id/updateBadge', async (req, res) => {
    const badge = parseInt(req.body.badge, 10);
    if (badge == 0) {
        await user_1.UserModel.findByIdAndUpdate(req.params.id, { queuedBadge: badge, badge }).orFail();
    }
    else {
        await user_1.UserModel.findByIdAndUpdate(req.params.id, { queuedBadge: badge }).orFail();
    }
    res.json(badge);
});
/* POST update user group */
adminUsersRouter.post('/:id/updateGroup', async (req, res) => {
    await user_1.UserModel.findByIdAndUpdate(req.params.id, { group: req.body.group }).orFail();
    res.json(req.body.group);
});
/* POST update user discordId */
adminUsersRouter.post('/:id/updateDiscordId', async (req, res) => {
    await user_1.UserModel.findByIdAndUpdate(req.params.id, { discordId: req.body.discordId }).orFail();
    res.json(req.body.discordId);
});
/* POST calculate user points */
adminUsersRouter.post('/:id/calculateUserPoints', async (req, res) => {
    const points = await points_1.updateUserPoints(req.params.id);
    res.json(points);
});
/* POST toggle isShowcaseMapper */
adminUsersRouter.post('/:id/toggleIsShowcaseMapper', async (req, res) => {
    const isShowcaseMapper = req.body.isShowcaseMapper;
    await user_1.UserModel.findByIdAndUpdate(req.params.id, { isShowcaseMapper }).orFail();
    res.json({ isShowcaseMapper });
});
/* POST toggle isMentorshipAdmin */
adminUsersRouter.post('/:id/toggleIsMentorshipAdmin', async (req, res) => {
    const isMentorshipAdmin = req.body.isMentorshipAdmin;
    await user_1.UserModel.findByIdAndUpdate(req.params.id, { isMentorshipAdmin }).orFail();
    res.json({ isMentorshipAdmin });
});
/* GET find FA showcase users */
adminUsersRouter.get('/findShowcaseUsers', async (req, res) => {
    const [osuUsers, taikoUsers, catchUsers, maniaUsers] = await Promise.all([
        user_1.UserModel
            .find({ isShowcaseMapper: true, group: { $nin: [user_2.UserGroup.Secret, user_2.UserGroup.Admin] }, osuPoints: { $gte: 1 } })
            .orFail(),
        user_1.UserModel
            .find({ isShowcaseMapper: true, group: { $nin: [user_2.UserGroup.Secret, user_2.UserGroup.Admin] }, taikoPoints: { $gte: 1 } })
            .orFail(),
        user_1.UserModel
            .find({ isShowcaseMapper: true, group: { $nin: [user_2.UserGroup.Secret, user_2.UserGroup.Admin] }, catchPoints: { $gte: 1 } })
            .orFail(),
        user_1.UserModel
            .find({ isShowcaseMapper: true, group: { $nin: [user_2.UserGroup.Secret, user_2.UserGroup.Admin] }, maniaPoints: { $gte: 1 } })
            .orFail(),
    ]);
    res.json({ osuUsers, taikoUsers, catchUsers, maniaUsers });
});
/* GET find Contest Helper users */
adminUsersRouter.get('/findContestHelperUsers', async (req, res) => {
    const [osuUsers, taikoUsers, catchUsers, maniaUsers] = await Promise.all([
        user_1.UserModel.find({ isContestHelper: true, osuPoints: { $gte: 1 } }),
        user_1.UserModel.find({ isContestHelper: true, taikoPoints: { $gte: 1 } }),
        user_1.UserModel.find({ isContestHelper: true, catchPoints: { $gte: 1 } }),
        user_1.UserModel.find({ isContestHelper: true, maniaPoints: { $gte: 1 } }),
    ]);
    res.json({ osuUsers, taikoUsers, catchUsers, maniaUsers });
});
/* POST find input users for DiscordHighlightGenerator */
adminUsersRouter.post('/findInputUsers', async (req, res) => {
    const inputUsers = req.body.inputUsers;
    const usernames = inputUsers.split('\n');
    const users = [];
    for (const username of usernames) {
        const user = await user_1.UserModel.findOne({ username }).orFail();
        users.push(user);
    }
    res.json({ users });
});
exports.default = adminUsersRouter;
