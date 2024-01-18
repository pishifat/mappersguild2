import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';
import { ContestModel } from '../../models/contest/contest';
import { webhookPost, webhookColors, externalWebhookPost } from '../../helpers/discordApi';

const adminContestsRouter = express.Router();

adminContestsRouter.use(isLoggedIn);
adminContestsRouter.use(isAdmin);
adminContestsRouter.use(isSuperAdmin);

/* POST toggle isFeaturedArtistContest */
adminContestsRouter.post('/:id/toggleIsFeaturedArtistContest', async (req, res) => {
    const isFeaturedArtistContest = req.body.isFeaturedArtistContest;

    await ContestModel
        .findByIdAndUpdate(req.params.id, { isFeaturedArtistContest })
        .populate({ path: 'creators' })
        .orFail();

    res.json({ isFeaturedArtistContest });
});

/* POST toggle isEligibleForPoints */
adminContestsRouter.post('/:id/toggleIsEligibleForPoints', async (req, res) => {
    const isEligibleForPoints = req.body.isEligibleForPoints;

    await ContestModel
        .findByIdAndUpdate(req.params.id, { isEligibleForPoints })
        .populate({ path: 'creators' })
        .orFail();

    res.json({ isEligibleForPoints });
});

/* POST toggle skipWebhook */
adminContestsRouter.post('/:id/toggleSkipWebhook', async (req, res) => {
    const skipWebhook = req.body.skipWebhook;

    await ContestModel
        .findByIdAndUpdate(req.params.id, { skipWebhook })
        .populate({ path: 'creators' })
        .orFail();

    res.json({ skipWebhook });
});

/* POST update contest isApproved */
adminContestsRouter.post('/:id/toggleIsApproved', async (req, res) => {
    const isApproved = req.body.isApproved;

    const contest = await ContestModel
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
        const color = webhookColors.pink;
        const descriptionIntro = `**[${contest.name}](${contest.url})**\n[Mappers' Guild listing](http://mappersguild.com/contests/listing?contest=${contest.id})\n\n`;
        const descriptionBody = contest.description;
        const descriptionCombined = descriptionIntro + descriptionBody;
        const description = descriptionCombined.length > 1500 ? descriptionCombined.slice(0,1500) + '... *(truncated)*' : descriptionCombined;
        const image = contest.bannerUrl ? { url: contest.bannerUrl } : undefined;

        webhookPost([{
            title,
            author,
            color,
            description,
            image,
        }]);

        // Regraz webhook
        externalWebhookPost([{
            title,
            author,
            color,
            description,
            image,
        }],
        'regraz');

        // Riana webhook
        externalWebhookPost([{
            title,
            author,
            color,
            description,
            image,
        }],
        'riana');
    }
});

export default adminContestsRouter;
