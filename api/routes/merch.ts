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

    let checkout;
    const lineItems: any = [];

    if (user.hasSpecificMerchOrder) {
        for (const item of config.specificMerchOrder) {
            const product = await client.product.fetch(item.productId);
            let variantId;

            if (product.variants.length > 1) {
                variantId = item.variantId;
            } else {
                variantId = product.variants[0].id;
            }

            lineItems.push({
                variantId,
                quantity: item.quantity,
            });
        }
    } else {
        const vid = req.body.vid;

        lineItems.push({
            variantId: vid,
            quantity: 1,
        });
    }

    checkout = await client.checkout.create({
        lineItems,
    });

    checkout = await client.checkout.addDiscount(checkout.id, config.shopify.discountCode);

    if (user) {
        user.hasMerchAccess = false;
        user.hasSpecificMerchOrder = false;
        await user.save();
    }

    res.json(checkout);

    req.session.destroy((error) => {
        console.log(error);
    });
});

export default merchRouter;
