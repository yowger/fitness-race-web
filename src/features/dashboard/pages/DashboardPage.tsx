import RunnerProfilePage from "./UserProfilePage"
import { useUser } from "../../auth/hooks/useUser"

const DashboardPage = () => {
    const { data: user, isLoading } = useUser()

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (!user) {
        return <div>No user data</div>
    }

    return <RunnerProfilePage id={user.id} />
}

export default DashboardPage
