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
/* POST toggle isFeaturedArtistContest */
adminContestsRouter.post('/:id/toggleIsFeaturedArtistContest', async (req, res) => {
    const isFeaturedArtistContest = req.body.isFeaturedArtistContest;
    await contest_1.ContestModel
        .findByIdAndUpdate(req.params.id, { isFeaturedArtistContest })
        .populate({ path: 'creators' })
        .orFail();
    res.json({ isFeaturedArtistContest });
});
/* POST toggle isEligibleForPoints */
adminContestsRouter.post('/:id/toggleIsEligibleForPoints', async (req, res) => {
    const isEligibleForPoints = req.body.isEligibleForPoints;
    await contest_1.ContestModel
        .findByIdAndUpdate(req.params.id, { isEligibleForPoints })
        .populate({ path: 'creators' })
        .orFail();
    res.json({ isEligibleForPoints });
});
/* POST toggle skipWebhook */
adminContestsRouter.post('/:id/toggleSkipWebhook', async (req, res) => {
    const skipWebhook = req.body.skipWebhook;
    await contest_1.ContestModel
        .findByIdAndUpdate(req.params.id, { skipWebhook })
        .populate({ path: 'creators' })
        .orFail();
    res.json({ skipWebhook });
});
/* POST update contest isApproved */
adminContestsRouter.post('/:id/toggleIsApproved', async (req, res) => {
    const isApproved = req.body.isApproved;
    const contest = await contest_1.ContestModel
        .findByIdAndUpdate(req.params.id, { isApproved })
        .populate({ path: 'creators' })
        .orFail();
    res.json({ isApproved });
    if (!contest.skipWebhook) {
        const title = `New ${contest.mode == 'osu' ? 'osu!' : 'osu!' + contest.mode} beatmapping contest`;
        const author = {
            name: `${contest.creators[0].username}`,
            url: `https://osu.ppy.sh/users/${contest.creators[0].osuId}`,
            icon_url: `https://a.ppy.sh/${contest.creators[0].osuId}`,
        };
        const color = discordApi_1.webhookColors.pink;
        const descriptionIntro = `**[${contest.name}](${contest.url})**\n[Mappers' Guild listing](http://mappersguild.com/contests/listing?contest=${contest.id})\n\n`;
        const descriptionBody = contest.description;
        const descriptionCombined = descriptionIntro + descriptionBody;
        const description = descriptionCombined.length > 1500 ? descriptionCombined.slice(0, 1500) + '... *(truncated)*' : descriptionCombined;
        const image = contest.bannerUrl ? { url: contest.bannerUrl } : undefined;
        discordApi_1.webhookPost([{
                title,
                author,
                color,
                description,
                image,
            }]);
        // Regraz webhook
        discordApi_1.externalWebhookPost([{
                title,
                author,
                color,
                description,
                image,
            }], 'regraz');
        // Riana webhook
        discordApi_1.externalWebhookPost([{
                title,
                author,
                color,
                description,
                image,
            }], 'riana');
    }
});
exports.default = adminContestsRouter;
