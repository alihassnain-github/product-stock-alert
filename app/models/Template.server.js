import db from "../db.server";

export async function getTemplate(shop) {
    return await db.emailtemplate.findUnique({
        where: { shop }
    })
}

export function validateTemplate(data) {
    const errors = {};
    if (!data.subject) {
        errors.subject = "Subject is required";
    }
    if (!data.body) {
        errors.body = "Body is required";
    }

    if (Object.keys(errors).length) {
        return errors;
    }
}