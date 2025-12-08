import { Navigate, Outlet } from "react-router-dom"

import { useSession } from "../hooks/useSession"

const AuthGuestRoute = () => {
    const { session } = useSession()

    const user = session?.user

    if (user) {
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}

export default AuthGuestRoute
