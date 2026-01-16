import { useState } from "react"
import {
    Users,
    Calendar,
    MapPin,
    TrendingUp,
    ChevronRight,
    Search,
    Flag,
    DollarSign,
    User,
    Zap,
    Award,
    Plus,
} from "lucide-react"
import { useRaces, type Race } from "../hooks/useRaces"
import { Link } from "react-router-dom"

export default function RacesPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<
        "upcoming" | "ongoing" | "complete" | "finished" | "all"
    >("all")

    const { data: races, isLoading } = useRaces({
        status: statusFilter === "all" ? undefined : statusFilter,
        approvalStatus: "approved",
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
                return {
                    color: "bg-cyan-50 text-cyan-700 border-cyan-200",
                    label: "Upcoming",
                }
            case "ongoing":
                return {
                    color: "bg-green-50 text-green-700 border-green-200",
                    label: "Live",
                }
            case "finished":
                return {
                    color: "bg-gray-100 text-gray-700 border-gray-300",
                    label: "Finished",
                }
            case "complete":
                return {
                    color: "bg-purple-50 text-purple-700 border-purple-200",
                    label: "Complete",
                }
            default:
                return {
                    color: "bg-gray-100 text-gray-700 border-gray-300",
                    label: "Unknown",
                }
        }
    }

    const participantPercentage = (race: Race) => {
        const max = race.max_participants || 1
        const count = race.participants?.length || 0
        return Math.round((count / max) * 100)
    }

    // Calculate stats
    const stats = {
        total: filteredRaces.length,
        upcoming: filteredRaces.filter((r) => r.status === "upcoming").length,
        ongoing: filteredRaces.filter((r) => r.status === "ongoing").length,
        complete: filteredRaces.filter((r) => r.status === "complete").length,
    }

    return (
        <div className="min-h-screen bg-gray-50 font-body">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Antonio:wght@700&family=Work+Sans:wght@400;500;600;700&display=swap');
                
                .font-display {
                    font-family: 'Antonio', sans-serif;
                    letter-spacing: -0.02em;
                }
                
                .font-heading {
                    font-family: 'Bebas Neue', sans-serif;
                    letter-spacing: 0.02em;
                }
                
                .font-body {
                    font-family: 'Work Sans', sans-serif;
                }

                .fade-in {
                    animation: fadeIn 0.6s ease-out;
                }

                .fade-in-delay-1 {
                    animation: fadeIn 0.6s ease-out 0.2s both;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .race-card {
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .race-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 12px 28px rgba(8, 145, 178, 0.2);
                }

                .stat-card {
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(8, 145, 178, 0.15);
                }

                .filter-button {
                    transition: all 0.3s ease;
                }

                .filter-button.active {
                    background: linear-gradient(135deg, #0891b2, #16a34a);
                    color: #fff;
                    font-weight: 600;
                    box-shadow: 0 4px 12px rgba(8, 145, 178, 0.3);
                }

                .create-race-btn {
                    position: relative;
                    overflow: hidden;
                }

                .create-race-btn::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    transform: translate(-50%, -50%);
                    transition: width 0.6s, height 0.6s;
                }

                .create-race-btn:hover::after {
                    width: 300px;
                    height: 300px;
                }
            `}</style>

            {/* Header */}
            <header className="bg-white border-b-2 border-gray-200 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-6 fade-in">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-600 to-green-600 flex items-center justify-center">
                                <Flag className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="font-display text-5xl text-zinc-900">
                                    Race Events
                                </h1>
                                <p className="font-body text-base text-zinc-600 mt-1">
                                    Discover and join exciting races near you
                                </p>
                            </div>
                        </div>

                        <Link to="/dashboard/races/create">
                            <button className="create-race-btn flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-600 to-green-600 text-white font-heading text-xl rounded-lg hover:shadow-xl transition-all shadow-lg">
                                <Plus className="w-6 h-6" />
                                CREATE RACE
                            </button>
                        </Link>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 fade-in">
                        <div className="stat-card bg-gradient-to-br from-cyan-50 to-cyan-100 border-2 border-cyan-200 rounded-lg p-4 text-center">
                            <Award className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                            <div className="font-display text-3xl text-cyan-700">
                                {stats.total}
                            </div>
                            <div className="font-body text-xs text-zinc-600 uppercase tracking-wider">
                                Total Races
                            </div>
                        </div>
                        <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4 text-center">
                            <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                            <div className="font-display text-3xl text-blue-700">
                                {stats.upcoming}
                            </div>
                            <div className="font-body text-xs text-zinc-600 uppercase tracking-wider">
                                Upcoming
                            </div>
                        </div>
                        <div className="stat-card bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-4 text-center">
                            <Zap className="w-6 h-6 text-green-600 mx-auto mb-2" />
                            <div className="font-display text-3xl text-green-700">
                                {stats.ongoing}
                            </div>
                            <div className="font-body text-xs text-zinc-600 uppercase tracking-wider">
                                Live Now
                            </div>
                        </div>
                        <div className="stat-card bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-4 text-center">
                            <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                            <div className="font-display text-3xl text-purple-700">
                                {stats.complete}
                            </div>
                            <div className="font-body text-xs text-zinc-600 uppercase tracking-wider">
                                Completed
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4 fade-in-delay-1">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search races by name, location, or organizer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border-2 border-gray-300 rounded-lg pl-12 pr-4 py-3 font-body text-base text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            {[
                                "all",
                                "upcoming",
                                "ongoing",
                                // "finished",
                                "complete",
                            ].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() =>
                                        setStatusFilter(
                                            filter as
                                                | "upcoming"
                                                | "ongoing"
                                                // | "finished"
                                                | "complete"
                                                | "all"
                                        )
                                    }
                                    className={`filter-button px-6 py-3 rounded-lg font-heading text-base whitespace-nowrap ${
                                        statusFilter === filter
                                            ? "active"
                                            : "bg-white border-2 border-gray-300 text-zinc-700 hover:bg-gray-50"
                                    }`}
                                >
                                    {filter.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-100 mb-4">
                            <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="font-heading text-xl text-zinc-600">
                            LOADING RACES...
                        </p>
                    </div>
                )}

                {!isLoading && filteredRaces.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRaces.map((race, index) => (
                            <RaceCard
                                key={race.id}
                                race={race}
                                formatDate={formatDate}
                                formatTime={formatTime}
                                getStatusConfig={getStatusConfig}
                                participantPercentage={participantPercentage}
                                index={index}
                            />
                        ))}
                    </div>
                )}

                {!isLoading && filteredRaces.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-lg border-2 border-gray-200 shadow-sm">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-6">
                            <TrendingUp className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="font-display text-4xl text-zinc-900 mb-3">
                            No Races Found
                        </h3>
                        <p className="font-body text-lg text-zinc-600 mb-8">
                            Try adjusting your search or filter criteria
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm("")
                                setStatusFilter("all")
                            }}
                            className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-green-600 text-white font-heading text-lg rounded-lg hover:shadow-xl transition-all"
                        >
                            CLEAR FILTERS
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}

function RaceCard({
    race,
    formatDate,
    formatTime,
    getStatusConfig,
    participantPercentage,
    index,
}: {
    race: Race
    formatDate: (s: string) => string
    formatTime: (s: string) => string
    getStatusConfig: (s: string) => { color: string; label: string }
    participantPercentage: (r: Race) => number
    index: number
}) {
    const statusConfig = getStatusConfig(race.status)
    const spotsLeft =
        (race.max_participants || 0) - (race.participants?.length || 0)
    const percentage = participantPercentage(race)
    const isAlmostFull =
        spotsLeft <= 50 && spotsLeft > 0 && race.status === "upcoming"
    const isFree = !race.price || race.price === 0

    return (
        <Link to={`/dashboard/races/${race.id}`}>
            <div
                className="race-card bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm cursor-pointer group"
                style={{ animationDelay: `${(index % 9) * 0.1}s` }}
            >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-cyan-100 to-green-100">
                    <img
                        src={
                            race.banner_url ||
                            race.routes?.map_url ||
                            "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=400&q=80"
                        }
                        alt={race.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                        <span
                            className={`px-4 py-2 rounded-lg text-sm font-heading border-2 ${statusConfig.color} shadow-lg`}
                        >
                            {statusConfig.label}
                        </span>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border-2 border-gray-200">
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-heading text-base text-zinc-900">
                                {isFree
                                    ? "FREE"
                                    : `₱${race.price?.toLocaleString()}`}
                            </span>
                        </div>
                    </div>

                    {/* Distance Badge */}
                    {race.routes?.distance && (
                        <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg">
                            <div className="flex items-center gap-2">
                                <Flag className="w-4 h-4 text-white" />
                                <span className="font-heading text-base text-white">
                                    {race.routes.distance.toFixed(1)} KM
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    <h3 className="font-display text-2xl text-zinc-900 mb-3 line-clamp-2 group-hover:text-cyan-600 transition-colors">
                        {race.name}
                    </h3>

                    {/* Description */}
                    {/* {race.description && (
                        <p className="font-body text-sm text-zinc-600 mb-4 line-clamp-2">
                            {race.description}
                        </p>
                    )} */}

                    {/* Details */}
                    <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-4 h-4 text-cyan-600" />
                            </div>
                            <div className="font-body text-zinc-700">
                                {formatDate(race.start_time)} at{" "}
                                {formatTime(race.start_time)}
                            </div>
                        </div>

                        {race.routes?.start_address && (
                            <div className="flex items-start gap-3 text-sm">
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-4 h-4 text-orange-600" />
                                </div>
                                <div className="font-body text-zinc-700 line-clamp-2 flex-1">
                                    {race.routes.start_address}
                                </div>
                            </div>
                        )}

                        {/* Participants Progress */}
                        <div className="pt-3">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-green-600" />
                                    <span className="font-body text-sm text-zinc-700 font-semibold">
                                        {race.participants?.length || 0}/
                                        {race.max_participants} Registered
                                    </span>
                                </div>
                                <span className="font-heading text-sm text-green-600">
                                    {percentage}%
                                </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-600 to-green-600 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Almost Full Warning */}
                    {isAlmostFull && (
                        <div className="mb-4 flex items-center gap-2 text-sm text-orange-700 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                            <Zap className="w-4 h-4" />
                            <span className="font-body font-semibold">
                                Only {spotsLeft} spots left!
                            </span>
                        </div>
                    )}

                    {/* Organizer */}
                    <div className="pt-4 border-t-2 border-gray-200 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-green-600 flex items-center justify-center text-white font-heading text-sm flex-shrink-0">
                                {race.created_by_user?.avatar_url ? (
                                    <img
                                        src={race.created_by_user.avatar_url}
                                        alt={race.created_by_user.full_name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <User className="w-5 h-5" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-body text-xs text-zinc-500 uppercase tracking-wider">
                                    Organized by
                                </p>
                                <p className="font-body text-sm font-semibold text-zinc-900 truncate">
                                    {race.created_by_user?.full_name ||
                                        "Unknown"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-green-600 text-white font-heading text-lg rounded-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                        VIEW DETAILS
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </Link>
    )
}
