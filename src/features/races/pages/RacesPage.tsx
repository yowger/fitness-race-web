import { useState } from "react"
import {
    Users,
    Calendar,
    MapPin,
    TrendingUp,
    ChevronRight,
    Search,
    Pin,
} from "lucide-react"
import { useRaces, type Race } from "../hooks/useRaces"
import { Link } from "react-router-dom"

export default function RacesPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<
        "upcoming" | "ongoing" | "finished" | "all"
    >("all")

    const { data: races, isLoading } = useRaces({
        status: statusFilter === "all" ? undefined : statusFilter,
        name: searchTerm || undefined,
    })

    const filteredRaces = races || []

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
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "upcoming":
                return { color: "text-blue-700 bg-blue-50", label: "Upcoming" }
            case "ongoing":
                return { color: "text-green-700 bg-green-50", label: "Ongoing" }
            case "finished":
                return { color: "text-gray-700 bg-gray-100", label: "Finished" }
            default:
                return { color: "text-gray-700 bg-gray-100", label: "Unknown" }
        }
    }

    const participantPercentage = (race: Race) => {
        const max = race.max_participants || 1
        const count = race.participants?.length || 0
        return Math.round((count / max) * 100)
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl text-gray-800 font-normal">
                            Race Events
                        </h1>
                        <Link to="/dashboard/races/create">
                            <button className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                                Create Race
                            </button>
                        </Link>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <SearchTermIcon />
                            <input
                                type="text"
                                placeholder="Search races"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-full pl-12 pr-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            {["all", "upcoming", "ongoing", "finished"].map(
                                (filter) => (
                                    <button
                                        key={filter}
                                        onClick={() =>
                                            setStatusFilter(
                                                filter as
                                                    | "upcoming"
                                                    | "ongoing"
                                                    | "finished"
                                                    | "all"
                                            )
                                        }
                                        className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                            statusFilter === filter
                                                ? "bg-blue-600 text-white shadow-sm"
                                                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        {filter.charAt(0).toUpperCase() +
                                            filter.slice(1)}
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-600 font-medium">
                            Loading races...
                        </p>
                    </div>
                )}

                {!isLoading && filteredRaces.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredRaces.map((race) => (
                            <RaceCard
                                key={race.id}
                                race={race}
                                formatDate={formatDate}
                                formatTime={formatTime}
                                getStatusConfig={getStatusConfig}
                                participantPercentage={participantPercentage}
                            />
                        ))}
                    </div>
                )}

                {!isLoading && filteredRaces.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <TrendingUp size={40} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">
                            No races found
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Try adjusting your search or filter criteria
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm("")
                                setStatusFilter("all")
                            }}
                            className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}

function SearchTermIcon() {
    return (
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
    )
}

function RaceCard({
    race,
    formatDate,
    formatTime,
    getStatusConfig,
    participantPercentage,
}: {
    race: Race
    formatDate: (s: string) => string
    formatTime: (s: string) => string
    getStatusConfig: (s: string) => { color: string; label: string }
    participantPercentage: (r: Race) => number
}) {
    const statusConfig = getStatusConfig(race.status)
    const spotsLeft =
        (race.max_participants || 0) - (race.participants?.length || 0)
    const percentage = participantPercentage(race)

    return (
        <Link to={`/dashboard/races/${race.id}`}>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                        src={race.banner_url || race.routes?.map_url}
                        alt={race.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                        >
                            {statusConfig.label}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {race.name}
                    </h3>

                    <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-gray-700">
                            <Calendar
                                className="text-gray-400 mr-2"
                                size={16}
                            />
                            <span>
                                {formatDate(race.start_time)} at{" "}
                                {formatTime(race.start_time)}
                            </span>
                        </div>
                        {race.routes?.start_address && (
                            <div className="flex items-center text-sm text-gray-700">
                                <Pin className="text-gray-400 mr-2" size={16} />
                                <span>{race.routes?.start_address}</span>
                            </div>
                        )}
                        <div className="flex items-center text-sm text-gray-700">
                            <MapPin className="text-gray-400 mr-2" size={16} />
                            <span>{race.routes?.distance?.toFixed(2)} km</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                            <Users className="text-gray-400 mr-2" size={16} />
                            <div className="flex-1">
                                <span>
                                    {race.participants?.length || 0}/
                                    {race.max_participants} registered
                                </span>
                                <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                            <div className="text-2xl font-medium text-gray-900">
                                {race?.price
                                    ? `₱${race.price?.toLocaleString()}`
                                    : "Free"}
                            </div>
                            <div className="text-xs text-gray-500">
                                Entry fee
                            </div>
                        </div>

                        <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-full text-sm font-medium transition-colors flex items-center gap-1">
                            View details
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                        Organized by{" "}
                        <span className="text-gray-700 font-medium">
                            {race.created_by_user.full_name}
                        </span>
                    </div>

                    {spotsLeft <= 50 &&
                        spotsLeft > 0 &&
                        race.status === "upcoming" && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-orange-700 bg-orange-50 px-3 py-2 rounded-lg">
                                <TrendingUp size={14} />
                                <span>Only {spotsLeft} spots remaining</span>
                            </div>
                        )}
                </div>
            </div>
        </Link>
    )
}
