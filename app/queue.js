import redis from "./redis";
import { Queue } from "bullmq";

const InventoryAlertsQueue = new Queue("inventory-alerts", {
    connection: redis,
});

export default InventoryAlertsQueue;