"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../../helpers/middlewares");
const contest_1 = require("../../models/contest/contest");
const discordApi_1 = require("../../helpers/discordApi");
const adminContestsRouter = express_1.default.Router();
adminContestsRouter.use(middlewares_1.isLoggedIn);
adminContestsRouter.use(middlewares_1.isAdmin);
adminContestsRouter.use(middlewares_1.isSuperAdmin);
/* POST update contest isApproved */
adminContestsRouter.post('/:id/toggleIsApproved', async (req, res) => {
    const isApproved = req.body.isApproved;
    const contest = await contest_1.ContestModel
        .findByIdAndUpdate(req.params.id, { isApproved })
        .populate({ path: 'creator' })
        .orFail();
    res.json({ isApproved });
    discordApi_1.webhookPost([{
            title: `New beatmapping contest: "${contest.name}"`,
            author: {
                name: `${contest.creator.username}`,
                url: `https://osu.ppy.sh/users/${contest.creator.osuId}`,
                icon_url: `https://a.ppy.sh/${contest.creator.osuId}`,
            },
            color: discordApi_1.webhookColors.pink,
            description: contest.description,
        }]);
});
exports.default = adminContestsRouter;
