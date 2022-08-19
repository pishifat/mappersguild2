import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';
import { ContestModel } from '../../models/contest/contest';
import { webhookPost, webhookColors, regrazWebhookPost } from '../../helpers/discordApi';

const adminContestsRouter = express.Router();

adminContestsRouter.use(isLoggedIn);
adminContestsRouter.use(isAdmin);
adminContestsRouter.use(isSuperAdmin);

/* POST update contest isApproved */
adminContestsRouter.post('/:id/toggleIsApproved', async (req, res) => {
    const isApproved = req.body.isApproved;

    const contest = await ContestModel
        .findByIdAndUpdate(req.params.id, { isApproved })
        .populate({ path: 'creators' })
        .orFail();

    res.json({ isApproved });

    webhookPost([{
        title: `New ${contest.mode == 'osu' ? 'osu!' : 'osu!' + contest.mode} beatmapping contest`,
        author: {
            name: `${contest.creators[0].username}`,
            url: `https://osu.ppy.sh/users/${contest.creators[0].osuId}`,
            icon_url: `https://a.ppy.sh/${contest.creators[0].osuId}`,
        },
        color: webhookColors.pink,
        description: `**[${contest.name}](${contest.url})**\n[Mappers' Guild listing](http://mappersguild.com/contests/listing?contest=${contest.id})\n\n` + `${contest.description.length > 250 ? contest.description.slice(0,250) + '... *(truncated)*' : contest.description}`,
    }]);

    regrazWebhookPost([{
        title: `New ${contest.mode == 'osu' ? 'osu!' : 'osu!' + contest.mode} beatmapping contest`,
        author: {
            name: `${contest.creators[0].username}`,
            url: `https://osu.ppy.sh/users/${contest.creators[0].osuId}`,
            icon_url: `https://a.ppy.sh/${contest.creators[0].osuId}`,
        },
        color: webhookColors.pink,
        description: `**[${contest.name}](${contest.url})**\n[Mappers' Guild listing](http://mappersguild.com/contests/listing?contest=${contest.id})\n\n` + `${contest.description.length > 250 ? contest.description.slice(0,250) + '... *(truncated)*' : contest.description}`,
    }]);
});

export default adminContestsRouter;
