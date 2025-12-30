import { useState } from "react";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

const defaultData = {
    subject: "[Low Stock Alert] {{product_name}} at {{shop_name}}",
    body: "Hi there,\n\nThis is an automated notification from your Product Stock Alert app for {{shop_name}}.\n\nThe following item has dropped below your preferred threshold and requires attention:\n\n---\nProduct: {{product_name}}\nVariant: {{variant_name}}\nSKU: {{sku}}\n---\n\nInventory Status:\n- Current Quantity: {{quantity}}\n- Your Alert Threshold: {{low_stock_threshold}}\n\nAction Required:\nPlease click the link below to update your inventory or manage this product directly in your Shopify Admin:\n\nManage Inventory: {{inventory_link}}\n\nBest regards,\nProduct Stock Alert Team",
};

export default function EmailTemplateForm() {

    const [formData, setFormData] = useState({ ...defaultData });

    function handleChange(e) {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    function handleReset() {
        setFormData({ ...defaultData })
    }

    return (
        <s-page heading="Email Template">
            <s-link slot="secondary-actions" onClick={handleReset}>
                Reset email template
            </s-link>
            <s-section heading="Customize Email Template">
                <s-stack gap="base">
                    <s-text-field
                        required
                        name="subject"
                        value={formData.subject}
                        onInput={handleChange}
                        autocomplete="off"
                        label="Email Subject"
                        placeholder="Enter email subject"
                    />
                    <s-text-area
                        required
                        name="body"
                        value={formData.body}
                        onInput={handleChange}
                        label="Email Body"
                        placeholder="Enter email body"
                        rows={10}
                    />
                </s-stack>
            </s-section>
            <s-section slot="aside" heading="Available Variables">
                <s-unordered-list>
                    <s-list-item>
                        <code>{"{{shop_name}}"}</code> - Store name (e.g., shopName)
                    </s-list-item>
                    <s-list-item>
                        <code>{"{{product_name}}"}</code> - Main title
                    </s-list-item>
                    <s-list-item>
                        <code>{"{{variant_name}}"}</code> - Size, color, etc.
                    </s-list-item>
                    <s-list-item>
                        <code>{"{{quantity}}"}</code> - Current stock left
                    </s-list-item>
                    <s-list-item>
                        <code>{"{{low_stock_threshold}}"}</code> - Your alert limit
                    </s-list-item>
                    <s-list-item>
                        <code>{"{{sku}}"}</code> - Product SKU code
                    </s-list-item>
                    <s-list-item>
                        <code>{"{{inventory_link}}"}</code> - Direct link to update inventory
                    </s-list-item>
                </s-unordered-list>
            </s-section>
        </s-page>
    );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};