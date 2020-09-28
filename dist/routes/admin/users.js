"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../../helpers/middlewares");
const user_1 = require("../../models/user");
const points_1 = require("../../helpers/points");
const discordApi_1 = require("../../helpers/discordApi");
const user_2 = require("../../interfaces/user");
const adminUsersRouter = express_1.default.Router();
adminUsersRouter.use(middlewares_1.isLoggedIn);
adminUsersRouter.use(middlewares_1.isAdmin);
adminUsersRouter.use(middlewares_1.isSuperAdmin);
adminUsersRouter.get('/', (req, res) => {
    var _a, _b;
    res.render('admin/users', {
        title: 'Users - Admin',
        script: 'adminUsers.js',
        loggedInAs: (_a = req.session) === null || _a === void 0 ? void 0 : _a.osuId,
        userMongoId: (_b = req.session) === null || _b === void 0 ? void 0 : _b.mongoId,
        pointsInfo: res.locals.userRequest.pointsInfo,
    });
});
adminUsersRouter.get('/load', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_1.UserModel.find({}).sort({ username: 1 });
    res.json(users);
}));
adminUsersRouter.post('/:id/updateBadge', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const badge = parseInt(req.body.badge, 10);
    const user = yield user_1.UserModel.findByIdAndUpdate(req.params.id, { badge }).orFail();
    res.json(badge);
    let rankColor = discordApi_1.webhookColors.white;
    if (badge == 1) {
        rankColor = discordApi_1.webhookColors.brown;
    }
    else if (badge == 2) {
        rankColor = discordApi_1.webhookColors.gray;
    }
    else if (badge == 3) {
        rankColor = discordApi_1.webhookColors.lightYellow;
    }
    else if (badge == 4) {
        rankColor = discordApi_1.webhookColors.lightBlue;
    }
    let description = `**Reached rank ${badge}** with ${user.totalPoints} total points`;
    if (badge == 4)
        description += `\n\n...there's no reward for this (yet) but 1000+ points is pretty impressive`;
    discordApi_1.webhookPost([{
            author: {
                name: user.username,
                icon_url: `https://a.ppy.sh/${user.osuId}`,
                url: `https://osu.ppy.sh/u/${user.osuId}`,
            },
            color: rankColor,
            description,
        }]);
}));
adminUsersRouter.post('/:id/updateGroup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield user_1.UserModel.findByIdAndUpdate(req.params.id, { group: req.body.group }).orFail();
    res.json(req.body.group);
}));
adminUsersRouter.post('/:id/updateDiscordId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield user_1.UserModel.findByIdAndUpdate(req.params.id, { discordId: req.body.discordId }).orFail();
    res.json(req.body.discordId);
}));
adminUsersRouter.post('/:id/calculateUserPoints', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const points = yield points_1.updateUserPoints(req.params.id);
    res.json(points);
}));
adminUsersRouter.post('/updateAllUserPoints', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_1.UserModel.find({}).select('username').orFail();
    for (const user of users) {
        points_1.updateUserPoints(user.id);
    }
    res.json('user points updated');
}));
adminUsersRouter.post('/:id/toggleBypassLogin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bypassLogin = req.body.bypassLogin;
    const group = bypassLogin ? user_2.UserGroup.User : user_2.UserGroup.Spectator;
    yield user_1.UserModel.findByIdAndUpdate(req.params.id, { bypassLogin, group }).orFail();
    res.json({ bypassLogin, group });
}));
adminUsersRouter.get('/findTieredUsers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [osuUsers, taikoUsers, catchUsers, maniaUsers] = yield Promise.all([
        user_1.UserModel
            .find({ rank: { $gte: 1 }, osuPoints: { $gte: 1 } })
            .orFail(),
        user_1.UserModel
            .find({ rank: { $gte: 1 }, taikoPoints: { $gte: 1 } })
            .orFail(),
        user_1.UserModel
            .find({ rank: { $gte: 1 }, catchPoints: { $gte: 1 } })
            .orFail(),
        user_1.UserModel
            .find({ rank: { $gte: 1 }, maniaPoints: { $gte: 1 } })
            .orFail(),
    ]);
    res.json({ osuUsers, taikoUsers, catchUsers, maniaUsers });
}));
adminUsersRouter.post('/findInputUsers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const inputUsers = req.body.inputUsers;
    const usernames = inputUsers.split('\n');
    const users = [];
    for (const username of usernames) {
        const user = yield user_1.UserModel.findOne({ username }).orFail();
        users.push(user);
    }
    res.json({ users });
}));
exports.default = adminUsersRouter;
