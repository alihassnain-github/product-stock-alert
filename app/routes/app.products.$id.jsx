import { useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export default function AddProductForm() {

    const navigate = useNavigate();

    return (
        <s-page heading="Add product alert">
            <s-link
                href="/app"
                slot="breadcrumb-actions"
                onClick={() => {
                    navigate("/app/")
                }}
            >
                Home
            </s-link>
            <s-section heading="Alert Trigger Settings">
                <s-stack gap="base">
                    <s-number-field
                        required
                        autocomplete="off"
                        label="Low Stock Threshold"
                        details="Alert me when inventory reaches or drops below this number."
                        placeholder="0"
                        step={1}
                        min={0}
                        max={100}
                    />
                    <s-select label="Alert Frequency">
                        <s-option value="once" selected>Once per restock</s-option>
                        <s-option value="every-time">Every time inventory changes</s-option>
                    </s-select>
                </s-stack>
            </s-section>
            <s-section heading="Product">
                <s-stack gap="base">
                    <s-button>Select product</s-button>
                </s-stack>
            </s-section>
        </s-page>
    )
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};