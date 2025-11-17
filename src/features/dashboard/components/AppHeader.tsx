import { SidebarTrigger } from "../../../components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"

interface AppHeaderProps {
    username?: string
    onLogout?: () => void
    onProfile?: () => void
}

const AppHeader = ({
    username = "User",
    onLogout,
    onProfile,
}: AppHeaderProps) => {
    return (
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="flex items-center gap-3">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold text-gray-800">
                    Dashboard
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-100 transition">
                        <span className="text-sm text-gray-700">
                            Hi, {username}
                        </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onProfile}>
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onLogout}>
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}

export default AppHeader
