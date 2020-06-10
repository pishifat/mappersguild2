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
const helpers_1 = require("../../helpers/helpers");
const discordApi_1 = require("../../helpers/discordApi");
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
    const users = yield user_1.UserService.queryAll({ sort: { username: 1 } });
    res.json(users);
}));
adminUsersRouter.post('/:id/updateBadge', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const badge = parseInt(req.body.badge, 10);
    const user = yield user_1.UserService.updateOrFail(req.params.id, { badge });
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
    discordApi_1.webhookPost([{
            author: {
                name: user.username,
                icon_url: `https://a.ppy.sh/${user.osuId}`,
                url: `https://osu.ppy.sh/u/${user.osuId}`,
            },
            color: rankColor,
            description: `**Reached rank ${badge}** with ${user.totalPoints} total points`,
        }]);
})));
adminUsersRouter.post('/:id/calculateUserPoints', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const points = yield points_1.updateUserPoints(req.params.id);
    res.json(points);
}));
adminUsersRouter.post('/updateAllUserPoints', helpers_1.canFail((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_1.UserService.queryAllOrFail({ select: 'username' });
    for (const user of users) {
        points_1.updateUserPoints(user.id);
    }
    res.json('user points updated');
})));
exports.default = adminUsersRouter;
