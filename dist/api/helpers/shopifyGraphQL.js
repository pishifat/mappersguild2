"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProducts = exports.createCart = void 0;
const config_json_1 = __importDefault(require("../../config.json"));
const node_fetch_1 = __importDefault(require("node-fetch"));
async function createCart(cartLines, discountCodes) {
    // Create cart with simple fetch
    const cartResponse = await node_fetch_1.default(`https://${config_json_1.default.shopify.domain}/api/2025-01/graphql.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': config_json_1.default.shopify.storeFrontToken,
        },
        body: JSON.stringify({
            query: `mutation cartCreate($cartInput: CartInput!) { cartCreate(input: $cartInput) { cart { id checkoutUrl } userErrors { message } } }`,
            variables: { cartInput: { lines: cartLines } },
        }),
    });
    const cartResult = await cartResponse.json();
    if (cartResult.errors) {
        throw new Error(`Cart creation failed: ${JSON.stringify(cartResult.errors)}`);
    }
    const cart = cartResult.data.cartCreate.cart;
    // Apply discount if provided
    if (discountCodes && cart) {
        await node_fetch_1.default(`https://${config_json_1.default.shopify.domain}/api/2025-01/graphql.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': config_json_1.default.shopify.storeFrontToken,
            },
            body: JSON.stringify({
                query: `mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) { cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) { userErrors { message } } }`,
                variables: { cartId: cart.id, discountCodes },
            }),
        });
    }
    return cart;
}
exports.createCart = createCart;
async function getProducts(productIds) {
    const response = await node_fetch_1.default(`https://${config_json_1.default.shopify.domain}/api/2025-01/graphql.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': config_json_1.default.shopify.storeFrontToken,
        },
        body: JSON.stringify({
            query: `query getProducts($ids: [ID!]!) { nodes(ids: $ids) { ... on Product { id title variants(first: 10) { edges { node { id title availableForSale } } } } } }`,
            variables: { ids: productIds }
        }),
    });
    const result = await response.json();
    return result.data.nodes.filter((node) => node !== null);
}
exports.getProducts = getProducts;
