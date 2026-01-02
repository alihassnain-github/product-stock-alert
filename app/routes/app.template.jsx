import { useEffect, useState } from "react";
import db from "../db.server";
import { getTemplate, validateTemplate } from "../models/Template.server"
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useActionData, useLoaderData, useSubmit, useSearchParams, useNavigate, useLocation, useNavigation } from "react-router";

const defaultData = {
    subject: "[Low Stock Alert] {{product_name}} at {{shop_name}}",
    body: "Hi there,\n\nThis is an automated notification from your Product Stock Alert app for {{shop_name}}.\n\nThe following item has dropped below your preferred threshold and requires attention:\n\n---\nProduct: {{product_name}}\nVariant: {{variant_name}}\nSKU: {{sku}}\n---\n\nInventory Status:\n- Current Quantity: {{quantity}}\n- Your Alert Threshold: {{low_stock_threshold}}\n\nAction Required:\nPlease click the link below to update your inventory or manage this product directly in your Shopify Admin:\n\nManage Inventory: {{inventory_link}}\n\nBest regards,\nProduct Stock Alert Team",
};

export async function loader({ request }) {
    const { session } = await authenticate.admin(request);
    const { shop } = session;

    const template = await getTemplate(shop);
    if (!template) return {
        subject: defaultData.subject,
        body: defaultData.body
    }

    return template;
}

export async function action({ request }) {

    const { session, redirect } = await authenticate.admin(request);
    const { shop } = session;

    const { action, ...data } = {
        ...Object.fromEntries(await request.formData()),
        shop,
    };

    const errors = validateTemplate(data);

    if (errors) {
        return new Response(JSON.stringify({ errors }), {
            status: 422,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    await db.emailTemplate.upsert({
        where: { shop: shop },
        create: data,
        update: data,
    })

    if (action === "reset") {
        return redirect("/app/template?status=reset");
    }

    return redirect("/app/template?status=saved");
}

export default function EmailTemplateForm() {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const template = useLoaderData();
    const [initialFormState, setInitialFormState] = useState(template);
    const [formState, setFormState] = useState(template);
    const errors = useActionData()?.errors || {};
    const isSaving = useNavigation().state === "submitting";
    const isDirty =
        JSON.stringify(formState) !== JSON.stringify(initialFormState);

    const submit = useSubmit();

    function handleTemplateReset() {
        const data = {
            subject: defaultData.subject,
            body: defaultData.body,
            action: "reset",
        };

        submit(data, { method: "post" });
    }

    function handleSave(e) {
        e.preventDefault();

        const data = {
            subject: formState.subject,
            body: formState.body,
        };

        submit(data, { method: "post" });
    }

    function handleReset() {
        setFormState(initialFormState);
    }

    useEffect(() => {
        const saveBar = document.getElementById("product-save-bar");
        isDirty ? saveBar.show() : saveBar.hide();
    }, [isDirty]);

    useEffect(() => {
        const status = searchParams.get("status");

        if (!status) return;

        if (status === "saved") {
            window.shopify.toast.show("Template saved");
        } else if (status === "reset") {
            window.shopify.toast.show("Template reset to defaults");
        }

        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("status");
        navigate(
            {
                pathname: location.pathname,
                search: newSearchParams.toString(),
            },
            { replace: true }
        );
    }, [searchParams, navigate, location]);

    useEffect(() => {
        setInitialFormState(template);
        setFormState(template);
    }, [template]);

    return (
        <form onSubmit={handleSave}>
            <ui-save-bar id="product-save-bar">
                <button variant="primary" disabled={isSaving} loading={isSaving ? "" : false} type="submit"></button>
                <button disabled={isSaving} onClick={handleReset} type="button"></button>
            </ui-save-bar>
            <s-page heading="Email Template">
                <s-button slot="secondary-actions" onClick={handleTemplateReset}>
                    Reset template
                </s-button>
                <s-section heading="Customize Email Template">
                    <s-stack gap="base">
                        <s-text-field
                            required
                            name="subject"
                            label="Email Subject"
                            error={errors.subject}
                            value={formState.subject}
                            onInput={(e) =>
                                setFormState({ ...formState, subject: e.target.value })
                            }
                            autocomplete="off"
                            placeholder="Enter email subject"
                        />
                        <s-text-area
                            required
                            name="body"
                            label="Email Body"
                            error={errors.body}
                            value={formState.body}
                            onInput={(e) =>
                                setFormState({ ...formState, body: e.target.value })
                            }
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
        </form>
    );
}

export const headers = (headersArgs) => {
    return boundary.headers(headersArgs);
};