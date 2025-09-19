"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_json_1 = __importDefault(require("../../config.json"));
const middlewares_1 = require("../helpers/middlewares");
const user_1 = require("../models/user");
const shopifyGraphQL_1 = require("../helpers/shopifyGraphQL");
const merchRouter = express_1.default.Router();
merchRouter.use(middlewares_1.isLoggedIn);
merchRouter.use(middlewares_1.hasMerchAccess);
/* GET merch listing. */
merchRouter.get('/query', async (req, res) => {
    const products = await shopifyGraphQL_1.getProducts(config_json_1.default.shopify.secretProductIds);
    res.json({ merch: products });
});
/* POST checkout */
merchRouter.post('/checkout', async (req, res) => {
    const user = await user_1.UserModel.findById(req.session.mongoId).orFail();
    const cartLines = [];
    const getProduct = async (productId) => {
        const products = await shopifyGraphQL_1.getProducts([productId]);
        return products[0];
    };
    if (user.hasSpecificMerchOrder) {
        for (const item of config_json_1.default.shopify.specificMerchOrder) {
            const product = await getProduct(item.productId);
            const variantId = product.variants.edges.length > 1 ? item.variantId : product.variants.edges[0].node.id;
            cartLines.push({ merchandiseId: variantId, quantity: item.quantity });
        }
    }
    else {
        const product = await getProduct(req.body.pid);
        const variantId = product.variants.edges.length > 1 ? product.variantId : product.variants.edges[0].node.id;
        cartLines.push({ merchandiseId: variantId, quantity: 1 });
    }
    const discountCode = config_json_1.default.shopify.discountCode;
    const cart = await shopifyGraphQL_1.createCart(cartLines, discountCode);
    user.hasMerchAccess = false;
    user.hasSpecificMerchOrder = false;
    await user.save();
    res.json(cart.checkoutUrl);
    req.session.destroy((error) => {
        console.log(error);
    });
});
exports.default = merchRouter;
