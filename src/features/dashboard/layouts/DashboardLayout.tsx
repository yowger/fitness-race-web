import Cookies from "js-cookie"
import { Outlet, useNavigate } from "react-router-dom"

import { SidebarProvider } from "../../../components/ui/sidebar"
import { AppSidebar } from "../components/AppSidebar"
import AppHeader from "../components/AppHeader"
import { useSession } from "../../auth/hooks/useSession"
import { supabase } from "../../../lib/supabase"

const DashboardLayout = () => {
    const { user } = useSession()
    const username = user?.full_name || ""
    const navigate = useNavigate()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate("/auth/sign-in", { replace: true })
    }

    const handleProfile = () => {
        navigate("/dashboard/profile")
    }

    const defaultOpen = Cookies.get("sidebar_state") === "true"

    return (
        <div className="flex min-h-screen">
            <SidebarProvider defaultOpen={defaultOpen}>
                <AppSidebar />

                <div className="flex flex-1 flex-col">
                    <AppHeader
                        username={username}
                        onProfile={handleProfile}
                        onLogout={handleLogout}
                    />

                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
                        <Outlet />
                    </main>
                </div>
            </SidebarProvider>
        </div>
    )
}

export default DashboardLayout
