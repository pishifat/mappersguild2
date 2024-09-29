"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_json_1 = __importDefault(require("../../../config.json"));
const shopify_buy_1 = __importDefault(require("shopify-buy"));
const middlewares_1 = require("../../helpers/middlewares");
const adminMerchRouter = express_1.default.Router();
adminMerchRouter.use(middlewares_1.isLoggedIn);
adminMerchRouter.use(middlewares_1.isAdmin);
adminMerchRouter.use(middlewares_1.isSuperAdmin);
/* GET order by osu! ID */
adminMerchRouter.post('/searchOrder', async (req, res) => {
    const userInput = req.body.userInput;
    const client = shopify_buy_1.default.buildClient({
        domain: config_json_1.default.shopify.domain,
        storefrontAccessToken: config_json_1.default.shopify.storeFrontToken,
    });
    const checkout = await client.checkout.fetch(userInput);
    if (checkout && checkout.order && checkout.order.orderNumber) {
        res.json(checkout.order.orderNumber);
    }
    else {
        return res.json({ error: 'Invalid input' });
    }
});
exports.default = adminMerchRouter;
