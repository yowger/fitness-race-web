import { Home, Map, Footprints, BarChartIcon, BellIcon } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "../../../components/ui/sidebar"
import { Link, useLocation } from "react-router-dom"
import type { UserRole } from "../../auth/hooks/useUser"

interface AppSidebarProps {
    role?: UserRole
    unreadCount?: number
}

const menu = {
    runner: [
        { title: "Overview", url: "/dashboard", icon: Home },
        { title: "Races", url: "/dashboard/races", icon: Footprints },
        {
            title: "Notifications",
            url: "/dashboard/notifications",
            icon: BellIcon,
        },
        { title: "Routes", url: "/dashboard/routes", icon: Map },
    ],
    admin: [
        { title: "Overview", url: "/admin", icon: Home },
        { title: "Stats", url: "/admin/stats", icon: BarChartIcon },
        { title: "Races", url: "/dashboard/races", icon: Footprints },
        { title: "Routes", url: "/dashboard/routes", icon: Map },
    ],
}

export function AppSidebar({ role, unreadCount = 0 }: AppSidebarProps) {
    const location = useLocation()
    const menuItems = role === "admin" ? menu.admin : menu.runner

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => {
                                const currentPathname =
                                    location.pathname === item.url

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={currentPathname}
                                        >
                                            <Link
                                                to={item.url}
                                                className="relative flex items-center gap-2"
                                            >
                                                {/* Icon */}
                                                <item.icon
                                                    className={
                                                        item.title ===
                                                            "Notifications" &&
                                                        unreadCount > 0
                                                            ? "text-red-600"
                                                            : ""
                                                    }
                                                />

                                                <span>{item.title}</span>

                                                {/* Unread badge */}
                                                {item.title ===
                                                    "Notifications" &&
                                                    unreadCount > 0 && (
                                                        <span className="w-5 h-5 flex items-center justify-center text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                                                            {unreadCount}
                                                        </span>
                                                    )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
