import express from 'express';
import Client from 'shopify-buy';
import config from '../../config.json';
import { hasMerchAccess, isLoggedIn } from '../helpers/middlewares';

const merchRouter = express.Router();

merchRouter.use(isLoggedIn);
merchRouter.use(hasMerchAccess);

/* GET merch listing. */
merchRouter.get('/query', async (req, res) => {
    const client = Client.buildClient({
        domain: config.shopify.domain,
        storefrontAccessToken: config.shopify.storeFrontToken,
    });

    const productIds = config.shopify.secretProductIds;
    const merch = [];

    for (const gid of productIds) {
        const product = await client.product.fetch(gid);
        merch.push(product);
    }

    res.json({
        merch,
    });
});

/* POST checkout */
merchRouter.post('/checkout', async (req, res) => {
    const client = Client.buildClient({
        domain: config.shopify.domain,
        storefrontAccessToken: config.shopify.storeFrontToken,
    });

    const vid = req.body.vid;
    const checkout = await client.checkout.create({
        lineItems: [{
            variantId: vid,
            quantity: 1,
        }],
    });

    res.json(checkout);
});

export default merchRouter;
