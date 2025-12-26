import { format } from "date-fns"

export const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    return format(new Date(dateString), "MMM d, yyyy")
}

export const formatTime = (dateString?: string) => {
    if (!dateString) return ""
    return format(new Date(dateString), "h:mm a")
}

export function formatLastUpdate(timestamp?: number) {
    if (!timestamp) return "—"

    const diff = Date.now() - timestamp

    if (diff < 5000) return "Just now"
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`

    return `${Math.floor(diff / 3600000)}h ago`
}
