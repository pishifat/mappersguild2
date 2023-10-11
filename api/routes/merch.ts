import express from 'express';
import { hasMerchAccess, isLoggedIn } from '../helpers/middlewares';
import { MerchModel } from '../models/merch';

const merchRouter = express.Router();

merchRouter.use(isLoggedIn);
merchRouter.use(hasMerchAccess);

/* GET merch listing. */
merchRouter.get('/query', async (req, res) => {
    const merch = await MerchModel
        .find({});

    res.json({
        merch,
    });
});

export default merchRouter;
