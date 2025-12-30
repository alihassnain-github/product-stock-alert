import { useEffect, useState } from "react";
import db from "../db.server";
import { validateSetting, getSetting } from "../models/Setting.server"
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useActionData, useLoaderData, useSubmit } from "react-router";

export async function loader({ request }) {
    const { session } = await authenticate.admin(request);
    const { shop } = session;

    return await getSetting(shop);
}

export async function action({ request }) {

    const { session, redirect } = await authenticate.admin(request);
    const { shop } = session;

    console.log("Shop: ", shop);

    const data = {
        ...Object.fromEntries(await request.formData()),
        shop,
    };

    console.log("Data: ", data);

    const errors = validateSetting(data);

    if (errors) {
        return new Response(JSON.stringify({ errors }), {
            status: 422,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    await db.Setting.create({ data });

    return redirect("/app/settings");

}

export default function SettingsPage() {

    const setting = useLoaderData();
    const [initialFormState, setInitialFormState] = useState(setting);
    const [formState, setFormState] = useState(setting);
    const errors = useActionData()?.errors || {};
    const isDirty =
        JSON.stringify(formState) !== JSON.stringify(initialFormState);

    const submit = useSubmit();

    // const [enableNotifications, setEnableNotifications] = useState(false);

    // function handleChange() {
    //     setEnableNotifications(!enableNotifications);
    // }

    function handleSave() {
        const data = {
            notificationEmail: formState.notificationEmail,
            enableNotifications: formState.enableNotifications,
        };

        submit(data, { method: "post" });
    }

    function handleReset() {
        setFormState(initialFormState);
        window.shopify.saveBar.hide("setting-form");
    }

    useEffect(() => {
        if (isDirty) {
            window.shopify.saveBar.show("setting-form");
        } else {
            window.shopify.saveBar.hide("setting-form");
        }
        return () => {
            window.shopify.saveBar.hide("setting-form");
        };
    }, [isDirty]);

    useEffect(() => {
        setInitialFormState(setting);
        setFormState(setting);
    }, [setting]);

    return (
        <form data-save-bar onSubmit={handleSave} onReset={handleReset}>
            <s-page heading="Settings">
                <s-section heading="Notifications">
                    <s-stack gap="base">
                        <s-switch id="app-switch" name="enableNotifications" label={`${formState.notificationEmail ? "Disable" : "Enable"} notifications`} checked={formState.notificationEmail} onChange={(e) => {
                            console.log(e.target.checked);
                        }} />
                    </s-stack>
                </s-section>
                <s-section heading="Email Settings">
                    <s-stack gap="base">
                        <s-email-field
                            required
                            label="Email"
                            name="notificationEmail"
                            error={errors.email}
                            value={formState.notificationEmail}
                            onInput={(e) =>
                                setFormState({ ...formState, notificationEmail: e.target.value })
                            }
                            autocomplete="off"
                            placeholder="bernadette.lapresse@jadedpixel.com"
                            details="Used for sending notifications"
                        />
                        <s-button variant="primary" type="button">Send Test Email</s-button>
                    </s-stack>
                </s-section>
            </s-page>
        </form>
    );
}

export const headers = (headersArgs) => {
    return boundary.headers(headersArgs);
};