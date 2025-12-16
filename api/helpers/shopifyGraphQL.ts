import config from '../../config.json';
import fetch from 'node-fetch';

export async function createCart(cartLines: any[], discountCodes?: string[]) {
    // Create cart with simple fetch
    const cartResponse = await fetch(`https://${config.shopify.domain}/api/2025-01/graphql.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': config.shopify.storeFrontToken,
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
        await fetch(`https://${config.shopify.domain}/api/2025-01/graphql.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': config.shopify.storeFrontToken,
            },
            body: JSON.stringify({
                query: `mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) { cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) { userErrors { message } } }`,
                variables: { cartId: cart.id, discountCodes },
            }),
        });
    }

    return cart;
}

export async function getProducts(productIds: string[]) {
    const response = await fetch(`https://${config.shopify.domain}/api/2025-01/graphql.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': config.shopify.storeFrontToken,
        },
        body: JSON.stringify({
            query: `query getProducts($ids: [ID!]!) { nodes(ids: $ids) { ... on Product { id title variants(first: 10) { edges { node { id title availableForSale } } } } } }`,
            variables: { ids: productIds }
        }),
    });

    const result = await response.json();
    return result.data.nodes.filter((node: any) => node !== null);
}