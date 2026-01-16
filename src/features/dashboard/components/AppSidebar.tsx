import { Home, Map, Footprints, BarChartIcon } from "lucide-react"

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

const menu = {
    runner: [
        {
            title: "Overview",
            url: "/dashboard",
            icon: Home,
        },
        // {
        //     title: "Profile",
        //     url: "/dashboard/profile",
        //     icon: User,
        // },
        {
            title: "Races",
            url: "/dashboard/races",
            icon: Footprints,
        },
        {
            title: "Routes",
            url: "/dashboard/routes",
            icon: Map,
        },
    ],
    admin: [
        {
            title: "Overview",
            url: "/admin",
            icon: Home,
        },
        {
            title: "Stats",
            url: "/admin/stats",
            icon: BarChartIcon,
        },
        {
            title: "Races",
            url: "/dashboard/races",
            icon: Footprints,
        },
        {
            title: "Routes",
            url: "/dashboard/routes",
            icon: Map,
        },
    ],
}

interface AppSidebarProps {
    role?: UserRole
}

export function AppSidebar({ role }: AppSidebarProps) {
    const location = useLocation()
    let menuItems = []

    if (role === "admin") {
        menuItems = menu.admin
    } else {
        menuItems = menu.runner
    }

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
                                            <Link to={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
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
