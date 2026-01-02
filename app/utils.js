import { isToday, isThisYear, format } from "date-fns";

export function truncate(str, { length = 25 } = {}) {
    if (!str) return "";
    if (str.length <= length) return str;
    return str.slice(0, length) + "…";
}

export function formatDate(date) {
    const d = new Date(date);

    if (isToday(d)) {
        return format(d, "hh:mm a");
    }

    if (isThisYear(d)) {
        return format(d, "hh:mm a dd MMM");
    }

    return format(d, "hh:mm a dd MMM yyyy");
}
