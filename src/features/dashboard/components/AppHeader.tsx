import { SidebarTrigger } from "../../../components/ui/sidebar"

const AppHeader = () => {
    return (
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-md border-b border-gray-200">
            {/* Left side */}
            <div className="flex items-center gap-3">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold text-gray-800">
                    Dashboard
                </h1>
            </div>

            {/* Right side — can add avatar, settings, etc. later */}
            <div className="flex items-center gap-4">
                <p className="text-sm text-gray-500">Hi, User</p>
                {/* e.g. <UserAvatar /> */}
            </div>
        </header>
    )
}

export default AppHeader
