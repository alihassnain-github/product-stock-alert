import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
    const { shop, topic, payload } = await authenticate.webhook(request);

    console.log("=== WEBHOOK RECEIVED ===");
    console.log("Shop:", shop);
    console.log("Topic:", topic);
    console.log("Payload:", payload);

    const inventoryItem = `gid://shopify/InventoryItem/${payload.inventory_item_id}`;

    const alertProduct = await db.alertProduct.findFirst({ where: { shop, inventoryItem } });

    if (!alertProduct) return new Response();

    if (payload.available <= alertProduct.threshold) {
        // call redis to update the queue
    }

    return new Response();
};
