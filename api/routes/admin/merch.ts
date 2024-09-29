import express from 'express';
import config from '../../../config.json';
import Client from 'shopify-buy';
import { isLoggedIn, isAdmin, isSuperAdmin } from '../../helpers/middlewares';

const adminMerchRouter = express.Router();

adminMerchRouter.use(isLoggedIn);
adminMerchRouter.use(isAdmin);
adminMerchRouter.use(isSuperAdmin);

/* GET order by osu! ID */
adminMerchRouter.post('/searchOrder', async (req, res) => {
    const userInput = req.body.userInput;

    const client = Client.buildClient({
        domain: config.shopify.domain,
        storefrontAccessToken: config.shopify.storeFrontToken,
    });

    const checkout = await client.checkout.fetch(userInput);

    if (checkout && checkout.order && checkout.order.orderNumber) {
        res.json(checkout.order.orderNumber);
    } else {
        return res.json({ error: 'Invalid input' });
    }
});


export default adminMerchRouter;
