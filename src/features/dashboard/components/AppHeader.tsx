import { Bell, ChevronRight, Check, CheckCheck } from "lucide-react"
import { SidebarTrigger } from "../../../components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "../../../components/ui/dropdown-menu"
import {
    useNotifications,
    useMarkNotificationAsRead,
    useMarkAllNotificationsAsRead,
} from "../../notifications/api/useNotifications"
import { Link } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"

interface AppHeaderProps {
    username?: string
    onLogout?: () => void
    onProfile?: () => void
}

const AppHeader = ({
    username = "User",
    onLogout,
    onProfile,
}: AppHeaderProps) => {
    const { data: notifications } = useNotifications({
        limit: 5,
        unreadOnly: false,
    })

    const markAsReadMutation = useMarkNotificationAsRead()
    const markAllAsReadMutation = useMarkAllNotificationsAsRead()

    const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0

    const handleNotificationClick = (
        notificationId: string,
        isRead: boolean,
    ) => {
        if (!isRead) {
            markAsReadMutation.mutate(notificationId)
        }
    }

    const handleMarkAllAsRead = () => {
        markAllAsReadMutation.mutate()
    }

    return (
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="flex items-center gap-3">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold text-gray-800">
                    Dashboard
                </h1>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="relative focus:outline-none">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-105">
                            <Bell className="w-5 h-5 text-gray-700" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg animate-pulse">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </div>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        className="w-96 p-0 shadow-xl"
                        align="end"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                            <h3 className="font-semibold text-gray-900">
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                            {notifications && notifications.length > 0 ? (
                                <>
                                    {notifications.map((n) => (
                                        <DropdownMenuItem
                                            key={n.id}
                                            onClick={() =>
                                                handleNotificationClick(
                                                    n.id,
                                                    n.is_read,
                                                )
                                            }
                                            className={` gap-1 px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-0 ${
                                                !n.is_read
                                                    ? "bg-blue-50/50 hover:bg-blue-100/50"
                                                    : "hover:bg-gray-50"
                                            }`}
                                        >
                                            {/* Unread indicator dot */}
                                            {!n.is_read && (
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></span>
                                            )}

                                            <div
                                                className={
                                                    !n.is_read ? "ml-3" : ""
                                                }
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <span
                                                        className={`text-sm leading-snug ${
                                                            !n.is_read
                                                                ? "font-semibold text-gray-900"
                                                                : "font-medium text-gray-700"
                                                        }`}
                                                    >
                                                        {n.title}
                                                    </span>
                                                    {!n.is_read && (
                                                        <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                                    )}
                                                </div>

                                                {n.message && (
                                                    <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                                                        {n.message}
                                                    </p>
                                                )}

                                                <span className="text-xs text-gray-500 mt-1 inline-block">
                                                    {formatDistanceToNow(
                                                        new Date(n.created_at),
                                                        { addSuffix: true },
                                                    )}
                                                </span>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}

                                    <DropdownMenuSeparator className="my-0" />

                                    <Link
                                        to="/dashboard/notifications"
                                        className="flex items-center justify-center gap-1 py-3 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                    >
                                        View all notifications
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                    <Bell className="w-12 h-12 text-gray-300 mb-3" />
                                    <p className="text-sm font-medium">
                                        No notifications yet
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        We'll notify you when something arrives
                                    </p>
                                </div>
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-700 hidden sm:block">
                            {username}
                        </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                            onClick={onProfile}
                            className="cursor-pointer"
                        >
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={onLogout}
                            className="cursor-pointer text-red-600 focus:text-red-600"
                        >
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}

export default AppHeader
