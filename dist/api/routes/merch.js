"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shopify_buy_1 = __importDefault(require("shopify-buy"));
const config_json_1 = __importDefault(require("../../config.json"));
const middlewares_1 = require("../helpers/middlewares");
const user_1 = require("../models/user");
const merchRouter = express_1.default.Router();
merchRouter.use(middlewares_1.isLoggedIn);
merchRouter.use(middlewares_1.hasMerchAccess);
/* GET merch listing. */
merchRouter.get('/query', async (req, res) => {
    const client = shopify_buy_1.default.buildClient({
        domain: config_json_1.default.shopify.domain,
        storefrontAccessToken: config_json_1.default.shopify.storeFrontToken,
    });
    const productIds = config_json_1.default.shopify.secretProductIds;
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
    const user = await user_1.UserModel.findById(req.session.mongoId).orFail();
    const client = shopify_buy_1.default.buildClient({
        domain: config_json_1.default.shopify.domain,
        storefrontAccessToken: config_json_1.default.shopify.storeFrontToken,
    });
    let checkout;
    const lineItems = [];
    if (user.hasSpecificMerchOrder) {
        for (const item of config_json_1.default.specificMerchOrder) {
            const product = await client.product.fetch(item.productId);
            let variantId;
            if (product.variants.length > 1) {
                variantId = item.variantId;
            }
            else {
                variantId = product.variants[0].id;
            }
            lineItems.push({
                variantId,
                quantity: item.quantity,
            });
        }
    }
    else {
        const vid = req.body.vid;
        lineItems.push({
            variantId: vid,
            quantity: 1,
        });
    }
    checkout = await client.checkout.create({
        lineItems,
    });
    checkout = await client.checkout.addDiscount(checkout.id, config_json_1.default.shopify.discountCode);
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
exports.default = merchRouter;
