import db from "../db.server";

export async function getSetting(shop) {
    return await db.setting.findUnique({
        where: { shop }
    });
}

export function validateSetting(data) {
    const errors = {};
    if (!data.notificationEmail) {
        errors.notificationEmail = "Email is required";
    } else {
        const regex = /^(?!\.)(?!.*\.\.)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        if (!regex.test(data.notificationEmail)) {
            errors.notificationEmail = "Please enter a valid email"
        }
    }

    if (Object.keys(errors).length) {
        return errors;
    }
}