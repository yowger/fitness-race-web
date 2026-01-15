import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useSession } from "../hooks/useSession"

const AuthRouteGuard = () => {
    const { session } = useSession()
    const location = useLocation()

    const user = session?.user

    if (!user) {
        return (
            <Navigate
                to="/auth/sign-in"
                replace
                state={{ from: location.pathname }}
            />
        )
    }

    if (user.role === "admin") {
        return <Navigate to="/admin/dashboard" replace />
    }

    return <Outlet />
}

export default AuthRouteGuard
