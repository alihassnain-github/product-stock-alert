import db from "../db.server";
import { getAlertProduct, validateAlertProduct } from "../models/AlertProduct.server";
import { useActionData, useLoaderData, useLocation, useNavigate, useNavigation, useParams, useSearchParams, useSubmit } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useEffect, useState } from "react";

export async function loader({ request, params }) {
    const { admin } = await authenticate.admin(request);

    if (params.id === "new") {
        return {
            threshold: "",
            alertFrequency: "ONCE",
        };
    }

    return await getAlertProduct(Number(params.id), admin.graphql);
}

export async function action({ request, params }) {
    const { session, redirect } = await authenticate.admin(request);
    const { shop } = session;

    const data = {
        ...Object.fromEntries(await request.formData()),
        shop,
    };

    if (data.action === "delete") {
        await db.alertProduct.delete({ where: { id: Number(params.id) } });
        return redirect("/app");
    }

    const errors = validateAlertProduct(data);

    if (errors) {
        return new Response(JSON.stringify({ errors }), {
            status: 422,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    const alertProduct =
        params.id === "new"
            ? await db.alertProduct.create({ data: { ...data, threshold: Number(data.threshold) } })
            : await db.alertProduct.update({ where: { id: Number(params.id) }, data: { ...data, threshold: Number(data.threshold) } });

    return redirect(`/app/products/${alertProduct.id}${params.id === "new" ? "?status=created" : "?status=saved"}`);
}

export default function AddProductForm() {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();

    const alertProduct = useLoaderData();
    const [initialFormState, setInitialFormState] = useState(alertProduct);
    const [formState, setFormState] = useState(alertProduct);
    const errors = useActionData()?.errors || {};
    const isSaving = useNavigation().state === "submitting";
    const isDirty = JSON.stringify(formState) !== JSON.stringify(initialFormState);

    async function selectProduct() {
        const products = await window.shopify.resourcePicker({
            type: "product",
            action: "select",
        })

        if (products) {
            const { images, id, variants, title } = products[0];

            console.log("The product: ", variants[0].inventoryItem);


            setFormState({
                ...formState,
                productId: id,
                variantId: variants[0].id,
                inventoryItem: variants[0].inventoryItem.id,
                productTitle: title,
                productAlt: images[0]?.altText,
                productImage: images[0]?.originalSrc,
            });

        }
    }

    function removeProduct() {
        setFormState({
            threshold: formState.threshold,
            alertFrequency: formState.alertFrequency,
        });
    }

    const productUrl = formState.productId
        ? `shopify://admin/products/${formState.productId.split("/").at(-1)}`
        : "";

    const submit = useSubmit();

    function handleSave(e) {
        e.preventDefault();

        const data = {
            threshold: formState.threshold,
            alertFrequency: formState.alertFrequency,
            productId: formState.productId || "",
            variantId: formState.variantId || "",
            inventoryItem: formState.inventoryItem || "",
        };

        submit(data, { method: "post" });
    }

    function handleDelete() {
        submit({ action: "delete" }, { method: "post" });
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

        if (status === "created") {
            window.shopify.toast.show("Alert created successfully");
        } else if (status === "saved") {
            window.shopify.toast.show("Alert updated");
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
        setInitialFormState(alertProduct);
        setFormState(alertProduct);
    }, [id, alertProduct]);

    return (
        <form onSubmit={handleSave}>
            <ui-save-bar id="product-save-bar">
                <button variant="primary" disabled={isSaving} loading={isSaving ? "" : false} type="submit"></button>
                <button disabled={isSaving} onClick={handleReset} type="button"></button>
            </ui-save-bar>
            <s-page heading={initialFormState.id ? "Edit product alert" : "Add product alert"}>
                <s-link
                    href="/app"
                    slot="breadcrumb-actions"
                    onClick={(e) => (isDirty ? e.preventDefault() : navigate("/app/"))}
                >
                    Home
                </s-link>
                {initialFormState.id &&
                    <s-button slot="secondary-actions" onClick={handleDelete}>Delete</s-button>}
                <s-section heading="Alert Trigger Settings">
                    <s-stack gap="base">
                        <s-number-field
                            name="threshold"
                            label="Low Stock Threshold"
                            required
                            value={formState.threshold}
                            onInput={(e) =>
                                setFormState({ ...formState, threshold: e.target.value })
                            }
                            error={errors.threshold}
                            autocomplete="off"
                            details="Alert me when inventory reaches or drops below this number."
                            step={1}
                            min={0}
                            max={100}
                        />
                        <s-select
                            label="Alert Frequency"
                            name="alertFrequency"
                            error={errors.alertFrequency}
                            value={formState.alertFrequency}
                            onChange={(e) =>
                                setFormState({ ...formState, alertFrequency: e.target.value })
                            }
                        >
                            <s-option value="ONCE" selected={formState.alertFrequency === "ONCE"}>Once per restock</s-option>
                            <s-option value="ALWAYS" selected={formState.alertFrequency === "ALWAYS"}>Every time inventory changes</s-option>
                        </s-select>
                    </s-stack>
                </s-section>
                <s-section heading="Product">
                    <s-stack gap="base">
                        {formState.productId ? (
                            <s-stack
                                direction="inline"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <s-stack
                                    direction="inline"
                                    gap="small-100"
                                    alignItems="center"
                                >
                                    <s-clickable
                                        href={productUrl}
                                        target="_blank"
                                        accessibilityLabel={`Go to the product page for ${formState.productTitle}`}
                                        borderRadius="base"
                                    >
                                        <s-stack
                                            direction="inline"
                                            gap="small-100"
                                            alignItems="center"
                                        >
                                            <s-box
                                                padding="small-200"
                                                border="base"
                                                borderRadius="base"
                                                background="subdued"
                                                inlineSize="38px"
                                                blockSize="38px"
                                            >
                                                {formState.productImage ? (
                                                    <s-image src={formState.productImage}></s-image>
                                                ) : (
                                                    <s-icon size="large" type="product" />
                                                )}
                                            </s-box>
                                            <s-link href={productUrl} target="_blank">
                                                {formState.productTitle}
                                            </s-link>
                                        </s-stack>
                                    </s-clickable>
                                </s-stack>
                                <s-stack direction="inline" gap="small">
                                    {formState.productId ? (
                                        <s-button
                                            type="button"
                                            onClick={removeProduct}
                                            accessibilityLabel="Remove the product"
                                            variant="secondary"
                                            tone="critical"
                                        >
                                            Remove
                                        </s-button>
                                    ) : null}
                                    <s-button
                                        type="button"
                                        onClick={selectProduct}
                                        accessibilityLabel="Change the product the QR code should be for"
                                    >
                                        Change
                                    </s-button>
                                </s-stack>
                            </s-stack>
                        ) : (
                            <>
                                <s-button
                                    type="button"
                                    onClick={selectProduct}
                                    accessibilityLabel="Select the product the QR code should be for"
                                >
                                    Select product
                                </s-button>
                                {errors.productId ? (
                                    <s-text tone="critical">
                                        <span className="error-message">
                                            <s-icon type="info" size="small"></s-icon>
                                            {errors.productId}
                                        </span>
                                    </s-text>
                                ) : null}
                            </>
                        )}
                    </s-stack>
                </s-section>
            </s-page>
        </form>
    )
}

export const headers = (headersArgs) => {
    return boundary.headers(headersArgs);
};