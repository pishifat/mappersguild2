import express from 'express';
import { UserService } from '../models-ts/user';

const faqRouter = express.Router();

/* GET faq */
faqRouter.get('/', async (req, res) => {
    let response: object = {
        title: 'Frequently Asked Questions',
        isFaq: true,
    };
    const u = await UserService.queryById(req.session?.mongoId);

    if (u && !UserService.isError(u)) {
        response = {
            ...response,
            loggedInAs: u.osuId,
            isNotSpectator: u.group != 'spectator',
            userTotalPoints: u.totalPoints,
        };
    }

    res.render('faq', response);
});

export default faqRouter;
