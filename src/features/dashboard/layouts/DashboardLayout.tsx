import Cookies from "js-cookie"
import { Outlet } from "react-router-dom"

import { SidebarProvider } from "../../../components/ui/sidebar"
import { AppSidebar } from "../components/AppSidebar"
import AppHeader from "../components/AppHeader"

const DashboardLayout = () => {
    const defaultOpen = Cookies.get("sidebar_state") === "true"

    return (
        <div className="flex min-h-screen">
            <SidebarProvider defaultOpen={defaultOpen}>
                <AppSidebar />

                <div className="flex flex-1 flex-col">
                    <AppHeader />

                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
                        <Outlet />
                    </main>
                </div>
            </SidebarProvider>
        </div>
    )
}

export default DashboardLayout
