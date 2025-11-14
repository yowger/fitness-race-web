import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Outlet } from "react-router-dom"

import { SessionProvider } from "./features/auth/components/SessionContext"

const queryClient = new QueryClient()

export default function Providers() {
    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <Outlet />
            </QueryClientProvider>
        </SessionProvider>
    )
}
