import express from 'express';
import Client from 'shopify-buy';
import config from '../../config.json';
import { hasMerchAccess, isLoggedIn } from '../helpers/middlewares';
import { UserModel } from '../models/user';

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
    const merch: any = [];

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
    const user = await UserModel.findById(req.session.mongoId).orFail();

    const client = Client.buildClient({
        domain: config.shopify.domain,
        storefrontAccessToken: config.shopify.storeFrontToken,
    });

    const vid = req.body.vid;
    let checkout = await client.checkout.create({
        lineItems: [{
            variantId: vid,
            quantity: 1,
        }],
    });

    checkout = await client.checkout.addDiscount(checkout.id, config.shopify.discountCode);

    if (user) {
        user.hasMerchAccess = false;
        await user.save();
    }

    res.json(checkout);

    req.session.destroy((error) => {
        console.log(error);
    });
});

export default merchRouter;
