import { useState } from "react"
import {
    Users,
    Clock,
    Plus,
    MapPin,
    Calendar,
    User,
    TrendingUp,
    Award,
} from "lucide-react"
import { useRaces, type Race } from "../hooks/useRaces"
import { Link } from "react-router-dom"

export default function RacesPage() {
    const [search, setSearch] = useState("")
    const [tabStatus, setTabStatus] = useState<
        "upcoming" | "ongoing" | "finished"
    >("upcoming")

    const { data: races, isLoading } = useRaces({
        status: tabStatus,
        name: search || undefined,
    })

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Race Events
                            </h1>
                            <p className="text-gray-600">
                                Discover and join exciting racing events
                            </p>
                        </div>
                        <Link to="/dashboard/races/create">
                            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 font-semibold">
                                <Plus className="w-5 h-5" />
                                Create Race
                            </button>
                        </Link>
                    </div>

                    <div className="mt-6">
                        <input
                            type="text"
                            placeholder="Search races by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-6 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                        />
                    </div>

                    <div className="flex gap-3 mt-6">
                        {["upcoming", "ongoing", "finished"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() =>
                                    setTabStatus(
                                        tab as
                                            | "upcoming"
                                            | "ongoing"
                                            | "finished"
                                    )
                                }
                                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                    tabStatus === tab
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                        : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                                }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-600 font-medium">
                            Loading races...
                        </p>
                    </div>
                )}

                {!isLoading && races && races.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {races.map((race) => (
                            <RaceCard key={race.id} race={race} />
                        ))}
                    </div>
                )}

                {!isLoading && (!races || races.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                        <Award className="w-20 h-20 text-gray-300 mb-4" />
                        <p className="text-gray-600 font-medium text-lg mb-2">
                            No races found
                        </p>
                        <p className="text-gray-500 text-sm">
                            Try adjusting your search or create a new race
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

function RaceCard({ race }: { race: Race }) {
    const imageSrc = race.routes?.map_url
    const participantCount = race.participants?.length ?? 0
    const maxParticipants = race.max_participants ?? 1
    const participationRate = (participantCount / maxParticipants) * 100
    const isFull = participationRate >= 100

    const getStatus = () => {
        switch (race.status) {
            case "ongoing":
                return {
                    text: "Live Now",
                    icon: "●",
                    className: "bg-green-500 text-white",
                }
            case "finished":
                return {
                    text: "Completed",
                    icon: "✓",
                    className: "bg-gray-500 text-white",
                }
            default:
                return {
                    text: "Upcoming",
                    icon: "◐",
                    className: "bg-blue-500 text-white",
                }
        }
    }
    const status = getStatus()

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        })
    }

    return (
        <Link to={`/dashboard/races/${race.id}`}>
            <div className="group h-full bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer">
                <div className="relative h-52 bg-linear-to-br from-blue-500 to-blue-600 overflow-hidden">
                    {imageSrc ? (
                        <img
                            src={imageSrc}
                            alt={race.routes?.name || race.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-500 to-purple-600">
                            <MapPin className="w-20 h-20 text-white/30" />
                        </div>
                    )}

                    <div className="absolute top-4 right-4">
                        <span
                            className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${status.className} flex items-center gap-1`}
                        >
                            <span>{status.icon}</span>
                            {status.text}
                        </span>
                    </div>

                    {isFull && (
                        <div className="absolute top-4 left-4">
                            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg">
                                FULL
                            </span>
                        </div>
                    )}

                    {race.routes?.name && (
                        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-4">
                            <div className="flex items-center gap-2 text-white">
                                <MapPin className="w-4 h-4" />
                                <span className="font-semibold text-sm">
                                    {race.routes.name}
                                </span>
                                {race.routes?.distance && (
                                    <span className="ml-auto px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold">
                                        {race.routes.distance.toFixed(1)} km
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-5 space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {race.name}
                    </h2>

                    {race.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {race.description}
                        </p>
                    )}

                    <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">
                                {formatDate(race.start_time)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">
                                {formatTime(race.start_time)}
                            </span>
                        </div>
                    </div>

                    {race.created_by_user && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>Host:</span>
                            <span className="font-semibold text-gray-900">
                                {race.created_by_user.full_name}
                            </span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                                <Users className="w-4 h-4 text-blue-600" />
                                <span className="font-semibold">
                                    {participantCount}/{maxParticipants}
                                </span>
                                <span className="text-gray-500">
                                    participants
                                </span>
                            </div>
                            <span
                                className={`text-xs font-bold ${
                                    isFull ? "text-red-600" : "text-blue-600"
                                }`}
                            >
                                {participationRate.toFixed(0)}%
                            </span>
                        </div>

                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    isFull
                                        ? "bg-gradient-to-r from-red-500 to-red-600"
                                        : "bg-gradient-to-r from-blue-500 to-blue-600"
                                }`}
                                style={{
                                    width: `${Math.min(
                                        participationRate,
                                        100
                                    )}%`,
                                }}
                            />
                        </div>
                    </div>

                    <button className="w-full py-3 bg-gray-50 group-hover:bg-blue-600 text-gray-700 group-hover:text-white rounded-xl transition-all font-semibold text-sm flex items-center justify-center gap-2">
                        View Details
                        <TrendingUp className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </Link>
    )
}
