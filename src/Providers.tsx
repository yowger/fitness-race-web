import { Outlet } from "react-router-dom"
import { SessionProvider } from "./features/auth/components/SessionContext"

export default function Providers() {
    return (
        <SessionProvider>
            <Outlet />
        </SessionProvider>
    )
}
