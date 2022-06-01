import express from 'express';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';
import { ContestModel } from '../../models/contest/contest';
import { webhookPost, webhookColors } from '../../helpers/discordApi';

const adminContestsRouter = express.Router();

adminContestsRouter.use(isLoggedIn);
adminContestsRouter.use(isAdmin);
adminContestsRouter.use(isSuperAdmin);

/* POST update contest isApproved */
adminContestsRouter.post('/:id/toggleIsApproved', async (req, res) => {
    const isApproved = req.body.isApproved;

    const contest = await ContestModel
        .findByIdAndUpdate(req.params.id, { isApproved })
        .populate({ path: 'creator' })
        .orFail();

    res.json({ isApproved });

    webhookPost([{
        title: `New beatmapping contest: "${contest.name}"`,
        author: {
            name: `${contest.creator.username}`,
            url: `https://osu.ppy.sh/users/${contest.creator.osuId}`,
            icon_url: `https://a.ppy.sh/${contest.creator.osuId}`,
        },
        color: webhookColors.pink,
        description: contest.description,
    }]);
});

export default adminContestsRouter;
