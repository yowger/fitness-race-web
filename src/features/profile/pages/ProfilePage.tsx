import { useParams } from "react-router-dom"
import RunnerProfilePage from "../../dashboard/pages/UserProfilePage"

export default function ProfilePage() {
    const { id } = useParams()

    if (!id) {
        return <div>No user ID provided</div>
    }

    return <RunnerProfilePage id={id} />
}
