import RunnerProfilePage from "./UserProfilePage"
import { useUser } from "../../auth/hooks/useUser"
import { Navigate } from "react-router-dom"

const DashboardPage = () => {
    const { data: user, isLoading } = useUser()

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (!user) {
        return <div>No user data</div>
    }

    if (user.role === "admin") {
        return <Navigate to="/admin" replace />
    }

    return <RunnerProfilePage id={user.id} />
}

export default DashboardPage
