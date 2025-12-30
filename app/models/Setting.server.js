import db from "../db.server";

export async function getSetting(shop) {
    return await db.setting.findUnique({
        where: { shop }
    });
}

export function validateSetting(data) {
    const errors = {};
    if (!data.email) {
        errors.email = "Email is required";
    }

    const regex = /^(?!\.)(?!.*\.\.)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!regex.test(data.email)) {
        errors.email = "Please enter a valid email"
    }

    if (Object.keys(errors).length) {
        return errors;
    }
}