import { authenticate } from "../shopify.server";
import InventoryAlertsQueue from "../queue";
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

        const shouldTriggerOnce =
            alertProduct.alertFrequency === "ONCE" &&
            !alertProduct.isTriggered;

        const shouldTriggerAlways =
            alertProduct.alertFrequency === "ALWAYS";

        if (shouldTriggerOnce || shouldTriggerAlways) {
            await InventoryAlertsQueue.add("send-inventory-alert", {
                shop,
                alertProductId: alertProduct.id,
            }, { removeOnComplete: true, removeOnFail: { count: 100 } });
        }

        if (shouldTriggerOnce) {
            await db.alertProduct.update({
                where: { id: alertProduct.id },
                data: { isTriggered: true },
            });
        }
    }

    return new Response();
};
