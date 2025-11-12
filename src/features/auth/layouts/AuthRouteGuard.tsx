import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useSession } from "../hooks/useSession"

const AuthRouteGuard = () => {
    const { session } = useSession()
    const location = useLocation()

    if (!session) {
        return (
            <Navigate
                to="/auth/sign-in"
                replace
                state={{ from: location.pathname }}
            />
        )
    }

    return <Outlet />
}

export default AuthRouteGuard
