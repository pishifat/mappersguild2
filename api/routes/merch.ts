import express from 'express';
import config from '../../config.json';
import { hasMerchAccess, isLoggedIn } from '../helpers/middlewares';
import { UserModel } from '../models/user';
import { createCart, getProducts } from '../helpers/shopifyGraphQL';

const merchRouter = express.Router();

merchRouter.use(isLoggedIn);
merchRouter.use(hasMerchAccess);

/* GET merch listing. */
merchRouter.get('/query', async (req, res) => {
    const products = await getProducts(config.shopify.secretProductIds);
    res.json({ merch: products });
});

/* POST checkout */
merchRouter.post('/checkout', async (req, res) => {
    const user = await UserModel.findById(req.session.mongoId).orFail();
    const cartLines: any = [];

    const getProduct = async (productId: string) => {
        const products = await getProducts([productId]);

        return products[0];
    };

    if (user.hasSpecificMerchOrder) {
        for (const item of config.shopify.specificMerchOrder) {
            const product = await getProduct(item.productId);
            const variantId = product.variants.edges.length > 1 ? item.variantId : product.variants.edges[0].node.id;
            cartLines.push({ merchandiseId: variantId, quantity: item.quantity });
        }
    } else {
        const product = await getProduct(req.body.pid);
        const variantId = product.variants.edges.length > 1 ? product.variantId : product.variants.edges[0].node.id; // this probably doesn't work if there are variants, but i'll fix it when it's relevant
        cartLines.push({ merchandiseId: variantId, quantity: 1 });
    }

    const discountCode = config.shopify.discountCode;
    const cart = await createCart(cartLines, discountCode);

    user.hasMerchAccess = false;
    user.hasSpecificMerchOrder = false;
    await user.save();

    res.json(cart.checkoutUrl);

    req.session.destroy((error) => {
        console.log(error);
    });
});

export default merchRouter;
