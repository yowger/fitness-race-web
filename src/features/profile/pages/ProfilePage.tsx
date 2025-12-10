// import { useNavigate } from "react-router-dom"
import { LogOut, User, Mail } from "lucide-react"

import { useSession } from "../../auth/hooks/useSession"
import { supabase } from "../../../lib/supabase"
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
} from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"

const ProfilePage = () => {
    const { user, session } = useSession()
    // const navigate = useNavigate()

    const handleLogout = async () => {
        await supabase.auth.signOut()

        // const sessionKey = Object.keys(localStorage).find(
        //     (key) => key.startsWith("sb-") && key.endsWith("-auth-token")
        // )
        // if (sessionKey) localStorage.removeItem(sessionKey)

        // navigate("/auth/sign-in", { replace: true })

        window.location.reload()
    }

    const getInitials = (name: string | undefined) => {
        if (!name) return "U"
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    if (!session || !user) {
        return (
            <div className="flex h-full items-center justify-center text-gray-400">
                No user session found.
            </div>
        )
    }

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <Card className="bg-white/5 border border-white/10 rounded-3xl">
                <CardHeader>
                    <h1 className="text-2xl font-semibold">Profile</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Manage your account information
                    </p>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold shadow-md">
                            {getInitials(user.full_name)}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">
                                {user.full_name}
                            </h2>
                            <p className="text-sm text-gray-400">
                                {user.email}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50">
                            <User size={20} className="text-blue-600 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                    Full Name
                                </p>
                                <p className="text-sm font-medium text-slate-900">
                                    {user.full_name}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50">
                            <Mail
                                size={20}
                                className="text-purple-600 mt-0.5"
                            />
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                    Email
                                </p>
                                <p className="text-sm font-medium text-slate-900 truncate">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>

                {/* <CardContent className="space-y-2">
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-3"
                    >
                        <Settings size={20} className="text-gray-600" />
                        Account Settings
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-3"
                    >
                        <Shield size={20} className="text-gray-600" />
                        Security & Privacy
                    </Button>
                </CardContent> */}

                <CardFooter className="pt-4">
                    <Button
                        variant="destructive"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-5 h-5" />
                        Log Out
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default ProfilePage
