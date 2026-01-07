import { useEffect, useState } from "react";
import db from "../db.server";
import { validateSetting, getSetting } from "../models/Setting.server"
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useActionData, useLoaderData, useLocation, useNavigate, useNavigation, useSearchParams, useSubmit } from "react-router";

export async function loader({ request }) {
    const { session } = await authenticate.admin(request);
    const { shop } = session;

    const setting = await getSetting(shop);
    if (!setting) return {
        notificationEmail: "",
        enableNotifications: true,
    }

    return setting;
}

export async function action({ request }) {

    const { session, redirect } = await authenticate.admin(request);
    const { shop } = session;

    const formData = await request.formData();

    const data = {
        notificationEmail: formData.get("notificationEmail"),
        enableNotifications: formData.get("enableNotifications") === "true",
        shop,
    };

    const errors = validateSetting(data);
    if (errors) {
        return new Response(JSON.stringify({ errors }), {
            status: 422,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    await db.setting.upsert({
        where: { shop: shop },
        create: data,
        update: data,
    })

    return redirect("/app/settings?status=saved");
}

export default function SettingsPage() {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const setting = useLoaderData();
    const [initialFormState, setInitialFormState] = useState(setting);
    const [formState, setFormState] = useState(setting);
    const errors = useActionData()?.errors || {};
    const isSaving = useNavigation().state === "submitting";
    const isDirty =
        JSON.stringify(formState) !== JSON.stringify(initialFormState);

    const submit = useSubmit();

    function handleSave(e) {
        e.preventDefault();

        const data = {
            notificationEmail: formState.notificationEmail,
            enableNotifications: formState.enableNotifications,
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
            window.shopify.toast.show("Settings saved");
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
        setInitialFormState(setting);
        setFormState(setting);
    }, [setting]);

    return (
        <form onSubmit={handleSave}>
            <ui-save-bar id="product-save-bar">
                <button variant="primary" disabled={isSaving} loading={isSaving ? "" : false} type="submit"></button>
                <button disabled={isSaving} onClick={handleReset} type="button"></button>
            </ui-save-bar>
            <s-page heading="Settings">
                <s-section heading="Notifications">
                    <s-stack gap="base">
                        <s-switch
                            id="notifications-switch"
                            name="enableNotifications"
                            label="Enable notifications"
                            checked={formState.enableNotifications}
                            onChange={(e) =>
                                setFormState({ ...formState, enableNotifications: e.target.checked })
                            }
                        />
                    </s-stack>
                </s-section>
                <s-section heading="Email Settings">
                    <s-stack gap="base">
                        <s-email-field
                            required
                            label="Email"
                            name="notificationEmail"
                            error={errors.notificationEmail}
                            value={formState.notificationEmail}
                            onInput={(e) =>
                                setFormState({ ...formState, notificationEmail: e.target.value })
                            }
                            autocomplete="off"
                            placeholder="bernadette.lapresse@jadedpixel.com"
                            details="Email to receive notifications."
                        />
                    </s-stack>
                </s-section>
            </s-page>
        </form>
    );
}

export const headers = (headersArgs) => {
    return boundary.headers(headersArgs);
};