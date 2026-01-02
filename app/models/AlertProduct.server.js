import db from "../db.server";

export async function getAlertProduct(id, graphql) {
    const alertProduct = await db.alertProduct.findFirst({ where: { id } });
    if (!alertProduct) {
        return null;
    }

    return supplementAlertProduct(alertProduct, graphql);
}

export const PAGE_SIZE = 10;

export async function getAlertProducts(shop, graphql, page = 1) {

    const skip = (page - 1) * PAGE_SIZE;

    const totalCount = await db.alertProduct.count({
        where: { shop },
    });

    const alertProducts = await db.alertProduct.findMany({
        where: { shop },
        orderBy: { id: "desc" },
        take: PAGE_SIZE,
        skip: skip,
    });

    if (alertProducts.length === 0) return {
        items: [],
        totalCount,
        hasNextPage: false,
        hasPreviousPage: false,
    };

    const items = await Promise.all(
        alertProducts.map((product) => supplementAlertProduct(product, graphql))
    );

    return {
        items,
        totalCount,
        hasNextPage: totalCount > page * PAGE_SIZE,
        hasPreviousPage: page > 1,
    };
}

async function supplementAlertProduct(alertProduct, graphql) {

    const response = await graphql(
        `
      query supplementAlertProduct($variantId: ID!) {
        productVariant(id: $variantId) {
          title
          sku
          inventoryQuantity
          product {
            title
            featuredImage {
              url
              altText
            }
          }
        }
      }
    `,
        {
            variables: {
                variantId: alertProduct.variantId,
            },
        }
    );

    const {
        data: { productVariant },
    } = await response.json();

    return {
        ...alertProduct,
        productDeleted: !productVariant,
        productTitle: productVariant?.product?.title,
        variantTitle: productVariant?.title,
        productImage: productVariant?.product?.featuredImage?.url,
        productAlt: productVariant?.product?.featuredImage?.altText,
        sku: productVariant?.sku,
        inventory: productVariant?.inventoryQuantity,
    };
}

export function validateAlertProduct(data) {
    const errors = {};

    if (!data.threshold) {
        errors.threshold = "Threshold is required";
    } else {
        const regex = /^(0|[1-9]\d*)$/;
        if (!regex.test(data.threshold)) {
            errors.threshold = "Threshold must be a non-negative whole number";
        }
    }

    if (!data.alertFrequency) {
        errors.alertFrequency = "Alert frequency is required";
    } else {
        const options = ["ONCE", "ALWAYS"];
        if (!options.includes(data.alertFrequency)) {
            errors.alertFrequency = "Invalid alert frequency";
        }
    }

    if (!data.productId) {
        errors.productId = "Product is required";
    }

    if (Object.keys(errors).length) {
        return errors;
    }
}