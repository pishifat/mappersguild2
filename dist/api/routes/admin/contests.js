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
        discordApi_1.webhookPost([{
                title: `New ${contest.mode == 'osu' ? 'osu!' : 'osu!' + contest.mode} beatmapping contest`,
                author: {
                    name: `${contest.creators[0].username}`,
                    url: `https://osu.ppy.sh/users/${contest.creators[0].osuId}`,
                    icon_url: `https://a.ppy.sh/${contest.creators[0].osuId}`,
                },
                color: discordApi_1.webhookColors.pink,
                description: `**[${contest.name}](${contest.url})**\n[Mappers' Guild listing](http://mappersguild.com/contests/listing?contest=${contest.id})\n\n` + `${contest.description.length > 250 ? contest.description.slice(0, 250) + '... *(truncated)*' : contest.description}`,
            }]);
        // Regraz webhook
        discordApi_1.externalWebhookPost([{
                title: `New ${contest.mode == 'osu' ? 'osu!' : 'osu!' + contest.mode} beatmapping contest`,
                author: {
                    name: `${contest.creators[0].username}`,
                    url: `https://osu.ppy.sh/users/${contest.creators[0].osuId}`,
                    icon_url: `https://a.ppy.sh/${contest.creators[0].osuId}`,
                },
                color: discordApi_1.webhookColors.pink,
                description: `**[${contest.name}](${contest.url})**\n[Mappers' Guild listing](http://mappersguild.com/contests/listing?contest=${contest.id})\n\n` + `${contest.description.length > 250 ? contest.description.slice(0, 250) + '... *(truncated)*' : contest.description}`,
            }], 'regraz');
        // Riana webhook
        discordApi_1.externalWebhookPost([{
                title: `New ${contest.mode == 'osu' ? 'osu!' : 'osu!' + contest.mode} beatmapping contest`,
                author: {
                    name: `${contest.creators[0].username}`,
                    url: `https://osu.ppy.sh/users/${contest.creators[0].osuId}`,
                    icon_url: `https://a.ppy.sh/${contest.creators[0].osuId}`,
                },
                color: discordApi_1.webhookColors.pink,
                description: `**[${contest.name}](${contest.url})**\n[Mappers' Guild listing](http://mappersguild.com/contests/listing?contest=${contest.id})\n\n` + `${contest.description.length > 250 ? contest.description.slice(0, 250) + '... *(truncated)*' : contest.description}`,
            }], 'riana');
    }
});
exports.default = adminContestsRouter;
