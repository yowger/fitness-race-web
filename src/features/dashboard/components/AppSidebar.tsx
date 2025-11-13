import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "../../../components/ui/sidebar"

const items = [
    {
        title: "Home",
        url: "#",
        icon: Home,
    },
    {
        title: "Inbox",
        url: "#",
        icon: Inbox,
    },
    {
        title: "Calendar",
        url: "#",
        icon: Calendar,
    },
    {
        title: "Search",
        url: "#",
        icon: Search,
    },
    {
        title: "Settings",
        url: "#",
        icon: Settings,
    },
]

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}

{
    /* <aside className="w-64 bg-slate-800 p-6 space-y-4">
                    <h1 className="text-2xl font-bold">RunTrackr</h1>
                    <nav className="space-y-2">
                        <NavLink
                            to="/dashboard"
                            end
                            className="block hover:text-emerald-400"
                        >
                            Overview
                        </NavLink>
                        <NavLink
                            to="/dashboard/profile"
                            className="block hover:text-emerald-400"
                        >
                            Profile
                        </NavLink>
                        <NavLink
                            to="/dashboard/runs"
                            className="block hover:text-emerald-400"
                        >
                            Runs
                        </NavLink>
                        <NavLink
                            to="/dashboard/routes"
                            className="block hover:text-emerald-400"
                        >
                            Routes
                        </NavLink>
                    </nav>
                </aside> */
}
