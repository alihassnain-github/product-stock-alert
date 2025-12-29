import { useState } from "react";

export default function SettingsPage() {

    const [enableNotifications, setEnableNotifications] = useState(false);

    function handleChange() {
        setEnableNotifications(!enableNotifications);
    }

    return (
        <s-page heading="Settings">
            <s-section heading="Notifications">
                <s-stack gap="base">
                    <s-switch id="basic-switch" label={`${enableNotifications ? "Disable" : "Enable"} notifications`} checked={enableNotifications} onChange={handleChange} />
                </s-stack>
            </s-section>
            <s-section heading="Email Settings">
                <s-stack gap="base">
                    <s-email-field
                        required
                        label="Email"
                        autocomplete="off"
                        placeholder="bernadette.lapresse@jadedpixel.com"
                        details="Used for sending notifications"
                    />
                    <s-button variant="primary">Send Test Email</s-button>
                </s-stack>
            </s-section>
        </s-page>
    );
}