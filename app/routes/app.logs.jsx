import { authenticate } from "../shopify.server";
import { getEmailLogs } from "../models/AlertProduct.server";

export async function loader({ request }) {
    const { session } = await authenticate.admin(request);
    const { shop } = session;

    const url = new URL(request.url);
    const alertProductId = Number(url.searchParams.get("id"));

    return await getEmailLogs(shop, alertProductId);
}