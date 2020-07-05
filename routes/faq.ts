import express from 'express';
import { UserModel } from '../models/user';

const faqRouter = express.Router();

/* GET faq */
faqRouter.get('/', async (req, res) => {
    let response: object = {
        title: 'Frequently Asked Questions',
        isFaq: true,
    };
    const user = await UserModel.findById(req.session?.mongoId);

    if (user) {
        response = {
            ...response,
            loggedInAs: user.osuId,
            userMongoId: req.session?.mongoId,
            pointsInfo: user.pointsInfo,
        };
    }

    res.render('faq', response);
});

export default faqRouter;
