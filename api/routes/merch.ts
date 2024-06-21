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

    // prioritize world cup prizes if relevant
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

    if (user.hasSpecificMerchOrder) {   // order based on config specificMerchOrder
        for (const item of config.shopify.specificMerchOrder) {
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
    } else if (user.worldCupMerch.active) {     // order config worldCupMerch based on world cup placements and user input sweater size
        const productIds = config.shopify.worldCupPrizes;
        const merch: any = [];
        let sweaterSelected = false;

        for (const gid of productIds) {
            const product = await client.product.fetch(gid);
            merch.push(product);

            if (product.title.includes('sticker')) {
                lineItems.push({
                    variantId: product.variants[0].id,
                    quantity: 1,
                });
            } else if (product.title.includes('sweater')) {
                const size = req.body.size;

                for (const variant of product.variants) {
                    if (variant.title.includes(size) && variant.title.includes(user.worldCupMerch.sweater.toString()) && !sweaterSelected) {
                        sweaterSelected = true;
                        lineItems.push({
                            variantId: variant.id,
                            quantity: 1,
                        });
                    }
                }
            } else if (product.title.includes('pin')) {
                if (user.worldCupMerch.pin) {
                    lineItems.push({
                        variantId: product.variants[0].id,
                        quantity: 1,
                    });
                }
            } else if (product.title.includes('coin')) {
                for (const variant of product.variants) {
                    if (user.worldCupMerch.coins.includes(parseInt(variant.title))) {
                        lineItems.push({
                            variantId: variant.id,
                            quantity: 1,
                        });
                    }
                }
            } else if (product.title.includes('neck')) {
                if (user.worldCupMerch.additionalItems >= 1) {
                    lineItems.push({
                        variantId: product.variants[0].id,
                        quantity: 1,
                    });
                }
            } else if (product.title.includes('desk')) {
                if (user.worldCupMerch.additionalItems == 2) {
                    lineItems.push({
                        variantId: product.variants[0].id,
                        quantity: 1,
                    });
                }
            }
        }
    } else {    // order single item from selection (previously used for plushies)
        const vid = req.body.vid;

        lineItems.push({
            variantId: vid,
            quantity: 1,
        });
    }

    checkout = await client.checkout.create({
        lineItems,
    });

    const discountCode = user.worldCupMerch.active ? config.shopify.worldCupDiscountCode : config.shopify.discountCode;

    checkout = await client.checkout.addDiscount(checkout.id, discountCode);

    if (user) {
        user.hasMerchAccess = false;
        user.hasSpecificMerchOrder = false;
        user.worldCupMerch.active = false;
        await user.save();
    }

    res.json(checkout);

    req.session.destroy((error) => {
        console.log(error);
    });
});

export default merchRouter;
