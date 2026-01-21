import { useState } from "react"
import {
    useMarkAllNotificationsAsRead,
    useMarkNotificationAsRead,
    useNotifications,
} from "../api/useNotifications"
// import { Bell, CheckCheck, Filter, Trash2 } from "lucide-react"
import { Bell, CheckCheck } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Link } from "react-router-dom"

export default function NotificationsPage() {
    // const [filter, setFilter] = useState<"all" | "unread">("all")
    const [filter] = useState<"all" | "unread">("all")

    const { data: notifications, isLoading } = useNotifications({
        limit: 50,
        unreadOnly: filter === "unread",
    })
    console.log("🚀 ~ NotificationsPage ~ notifications:", notifications)

    const markAll = useMarkAllNotificationsAsRead()
    const markOne = useMarkNotificationAsRead()

    const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0

    // const getNotificationIcon = (type: string) => {
    const getNotificationIcon = () => {
        // Customize based on notification type
        return "🔔"
    }

    const getNotificationColor = (type: string) => {
        const colors: Record<string, string> = {
            race_update: "from-blue-500 to-blue-600",
            payment: "from-green-500 to-green-600",
            achievement: "from-yellow-500 to-yellow-600",
            system: "from-gray-500 to-gray-600",
        }
        return colors[type] || "from-blue-500 to-purple-600"
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                                    <Bell className="w-7 h-7 text-white" />
                                </div>
                                Notifications
                            </h1>
                            <p className="text-gray-600 mt-2">
                                {unreadCount > 0
                                    ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                                    : "You're all caught up!"}
                            </p>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAll.mutate()}
                                disabled={markAll.isPending}
                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <CheckCheck className="w-4 h-4" />
                                Mark All Read
                            </button>
                        )}
                    </div>

                    {/* Filter Tabs */}
                    {/* <div className="flex items-center gap-2 p-1 bg-white rounded-xl shadow-sm border border-gray-200">
                        <button
                            onClick={() => setFilter("all")}
                            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                                filter === "all"
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            All
                            {notifications && (
                                <span className="ml-2 text-xs opacity-75">
                                    ({notifications.length})
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setFilter("unread")}
                            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                                filter === "unread"
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            Unread
                            {unreadCount > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </div> */}
                </div>

                {/* Notifications List */}
                {notifications && notifications.length > 0 ? (
                    <div className="space-y-3">
                        {notifications.map((n) => {
                            const raceId = n.data?.race_id

                            // If raceId exists, wrap content in Link
                            const content = (
                                <>
                                    {/* Unread indicator stripe */}
                                    {!n.is_read && (
                                        <div
                                            className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${getNotificationColor(
                                                n.type,
                                            )}`}
                                        />
                                    )}

                                    <div className="p-5 flex gap-4">
                                        {/* Icon */}
                                        <div
                                            className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${getNotificationColor(
                                                n.type,
                                            )} flex items-center justify-center text-white text-xl shadow-md`}
                                        >
                                            {getNotificationIcon()}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 mb-1">
                                                <h3
                                                    className={`text-base font-semibold ${
                                                        n.is_read
                                                            ? "text-gray-700"
                                                            : "text-gray-900"
                                                    }`}
                                                >
                                                    {n.title}
                                                </h3>

                                                {!n.is_read && (
                                                    <span className="flex-shrink-0 w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" />
                                                )}
                                            </div>

                                            {n.message && (
                                                <p
                                                    className={`text-sm mb-2 ${
                                                        n.is_read
                                                            ? "text-gray-500"
                                                            : "text-gray-700"
                                                    }`}
                                                >
                                                    {n.message}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-4">
                                                <span className="text-xs text-gray-500 font-medium">
                                                    {formatDistanceToNow(
                                                        new Date(n.created_at),
                                                        { addSuffix: true },
                                                    )}
                                                </span>

                                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium">
                                                    {n.type
                                                        .replace(/_/g, " ")
                                                        .toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-200 pointer-events-none" />
                                </>
                            )

                            return raceId ? (
                                <Link
                                    key={n.id}
                                    to={`/dashboard/races/${raceId}`}
                                    onClick={() =>
                                        !n.is_read && markOne.mutate(n.id)
                                    }
                                    className={`bg-white block group relative overflow-hidden rounded-2xl border transition-all duration-200 cursor-pointer ${
                                        n.is_read
                                            ? "bg-white border-gray-200 hover:border-gray-300"
                                            : "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:border-blue-300 shadow-md hover:shadow-lg"
                                    }`}
                                >
                                    {content}
                                </Link>
                            ) : (
                                <div
                                    key={n.id}
                                    onClick={() =>
                                        !n.is_read && markOne.mutate(n.id)
                                    }
                                    className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 cursor-pointer ${
                                        n.is_read
                                            ? "bg-white border-gray-200 hover:border-gray-300"
                                            : "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:border-blue-300 shadow-md hover:shadow-lg"
                                    }`}
                                >
                                    {content}
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    // Empty State
                    <div className="flex flex-col items-center justify-center py-20 px-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <Bell className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {filter === "unread"
                                ? "No unread notifications"
                                : "No notifications yet"}
                        </h3>
                        <p className="text-gray-500 text-center max-w-md">
                            {filter === "unread"
                                ? "You've read all your notifications. Great job staying on top of things!"
                                : "When you receive notifications, they'll appear here."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
