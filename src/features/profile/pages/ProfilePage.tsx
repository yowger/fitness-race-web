import { useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import { useSession } from "../../auth/hooks/useSession"
import { supabase } from "../../../lib/supabase"

const ProfilePage = () => {
    const { session } = useSession()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate("/auth/sign-in", { replace: true })
    }

    if (!session) {
        return (
            <div className="flex h-full items-center justify-center text-gray-400">
                No user session found.
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="max-w-2xl mx-auto bg-white/5 rounded-xl border border-white/10 p-6">
                <h1 className="text-2xl font-semibold text-white mb-4">
                    Profile
                </h1>

                <div className="text-emerald-200 mb-8">
                    <p>
                        Logged in as{" "}
                        <span className="font-medium text-white">
                            {session.user.email}
                        </span>
                    </p>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Log Out
                </button>
            </div>
        </div>
    )
}

export default ProfilePage
