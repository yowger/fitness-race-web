import { Outlet } from "react-router-dom"

import { useSession } from "../hooks/useSession"

const AuthRouteGuard = () => {
    const { session } = useSession()

    if (!session) {
        return <p>Not authenticated, please login.</p>
    }

    return <Outlet />
}

export default AuthRouteGuard
