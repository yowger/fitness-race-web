import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Outlet } from "react-router-dom"

import { SessionProvider } from "./features/auth/components/SessionContext"
import { Toaster } from "./components/ui/sonner"

const queryClient = new QueryClient()

export default function Providers() {
    return (
        <QueryClientProvider client={queryClient}>
            <SessionProvider>
                <Outlet />
                <Toaster />
            </SessionProvider>
        </QueryClientProvider>
    )
}
