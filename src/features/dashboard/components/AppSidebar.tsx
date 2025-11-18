import { Home, User, Map, Footprints } from "lucide-react"

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

const items = [
    {
        title: "Overview",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Profile",
        url: "/dashboard/profile",
        icon: User,
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
]

export function AppSidebar() {
    const location = useLocation()

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => {
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
