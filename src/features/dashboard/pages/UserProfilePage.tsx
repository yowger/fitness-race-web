import { useState } from "react"
import {
    Trophy,
    Award,
    Calendar,
    Medal,
    Flag,
    Plus,
    Users,
    MapPin,
    Eye,
    Zap,
    Target,
    Clock,
    Search,
} from "lucide-react"

const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString() : "—"

const formatDistance = (distance?: number) =>
    distance ? `${distance.toFixed(2)} km` : "—"

const formatTime = (ms: number | null) =>
    ms ? new Date(ms).toISOString().substr(11, 8) : "DNF"

const daysUntil = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const getRaceStatusStyle = (status: string) => {
    switch (status) {
        case "upcoming":
            return "bg-blue-100 text-blue-700"
        case "ongoing":
            return "bg-green-100 text-green-700"
        case "completed":
            return "bg-zinc-200 text-zinc-700"
        default:
            return "bg-gray-100 text-gray-600"
    }
}

import "../styles/dashboardPage.css"
import { useProfileById } from "../../auth/hooks/useUser"
import { getAvatarUrl } from "../../../lib/avatar"
import {
    useRaces,
    useRunnerProfileStats,
    useRunnerResultsPaginated,
} from "../../races/hooks/useRaces"

export default function RunnerProfilePage({ id }: { id: string }) {
    const { data: user } = useProfileById(id)
    const { data: myUpcomingRaces } = useRaces({
        status: "upcoming",
        userId: user?.id,
    })
    const { data } = useRunnerResultsPaginated({
        userId: user?.id || "",
    })
    const { data: myHostedRaces } = useRaces({
        createdBy: user?.id,
    })
    const { data: stats } = useRunnerProfileStats(user?.id)
    const [activeTab, setActiveTab] = useState("overview")

    const getPositionBadge = (position: number) => {
        if (position === 1)
            return {
                icon: Trophy,
                color: "from-yellow-400 to-yellow-600",
                text: "1st",
            }
        if (position === 2)
            return {
                icon: Medal,
                color: "from-gray-300 to-gray-500",
                text: "2nd",
            }
        if (position === 3)
            return {
                icon: Award,
                color: "from-orange-400 to-orange-600",
                text: "3rd",
            }
        return null
    }

    if (!user) {
        return <div className="p-6">User not found</div>
    }

    return (
        <div className="min-h-screen bg-gray-50 font-body">
            <div className="relative h-64 overflow-hidden">
                <img
                    src={
                        "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=1200&q=80"
                    }
                    alt="Cover"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 cover-gradient"></div>
                <div className="absolute inset-0 bg-linear-to-b from-transparent to-gray-50"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10">
                <div className="fade-in bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-8">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="relative">
                            <img
                                src={getAvatarUrl(user?.full_name || "", {
                                    size: 64,
                                })}
                                alt={user?.full_name || ""}
                                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                            />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="font-display text-5xl text-zinc-900 mb-1">
                                        {user?.full_name}
                                    </h1>

                                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                                        <div className="flex items-center gap-2 mt-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                Joined{" "}
                                                {user?.created_at?.slice(0, 10)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t-2 border-gray-200">
                        <div className="text-center">
                            <div className="font-display text-4xl text-cyan-600 mb-1">
                                {stats?.totalRaces || 0}
                            </div>
                            <div className="font-body text-sm text-zinc-600 uppercase tracking-wider">
                                Total Races
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="font-display text-4xl text-green-600 mb-1">
                                {stats?.totalDistance || 0}
                            </div>
                            <div className="font-body text-sm text-zinc-600 uppercase tracking-wider">
                                Distance
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="font-display text-4xl text-orange-600 mb-1">
                                {stats?.totalTime || 0}
                            </div>
                            <div className="font-body text-sm text-zinc-600 uppercase tracking-wider">
                                Total Time
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="font-display text-4xl text-purple-600 mb-1">
                                {stats?.averagePace || 0}
                            </div>
                            <div className="font-body text-sm text-zinc-600 uppercase tracking-wider">
                                Avg Pace
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="border-b-2 border-gray-200 mb-8 fade-in-delay-1">
                    <div className="flex gap-8 font-heading text-xl">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`tab-button pb-4 ${
                                activeTab === "overview"
                                    ? "active text-zinc-900"
                                    : "text-zinc-500"
                            }`}
                        >
                            OVERVIEW
                        </button>
                        <button
                            onClick={() => setActiveTab("upcoming")}
                            className={`tab-button pb-4 ${
                                activeTab === "upcoming"
                                    ? "active text-zinc-900"
                                    : "text-zinc-500"
                            }`}
                        >
                            UPCOMING
                        </button>
                        {/* <button
                            onClick={() => setActiveTab("hostedRaces")}
                            className={`tab-button pb-4 ${
                                activeTab === "hostedRaces"
                                    ? "active text-zinc-900"
                                    : "text-zinc-500"
                            }`}
                        >
                            HOSTED RACE
                        </button> */}
                        <button
                            onClick={() => setActiveTab("races")}
                            className={`tab-button pb-4 ${
                                activeTab === "races"
                                    ? "active text-zinc-900"
                                    : "text-zinc-500"
                            }`}
                        >
                            HOSTED RACES
                        </button>
                    </div>
                </div>

                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="fade-in-delay-2">
                                <h2 className="font-display text-3xl text-zinc-900 mb-4">
                                    Recent Races
                                </h2>
                                <div className="space-y-4">
                                    {/* {data?.results?.slice(0, 3).map((race) => { */}
                                    {data?.results?.map((race) => {
                                        const badge = getPositionBadge(
                                            race.result.position || 0
                                        )

                                        return (
                                            <div
                                                key={race.race_id}
                                                className="race-card bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm"
                                            >
                                                <div className="flex">
                                                    {/* Banner */}
                                                    <div className="w-32 h-32 flex-shrink-0">
                                                        <img
                                                            src={
                                                                race.race
                                                                    .banner_url ??
                                                                "/placeholder-race.jpg"
                                                            }
                                                            alt={race.race.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 p-5">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <h3 className="font-heading text-xl text-zinc-900 mb-1">
                                                                    {
                                                                        race
                                                                            .race
                                                                            .name
                                                                    }
                                                                </h3>

                                                                <div className="flex items-center gap-3 text-sm text-zinc-500">
                                                                    <span className="flex items-center gap-1">
                                                                        <Calendar className="w-4 h-4" />
                                                                        {formatDate(
                                                                            race
                                                                                .race
                                                                                .start_time
                                                                        )}
                                                                    </span>

                                                                    <span className="flex items-center gap-1">
                                                                        <Flag className="w-4 h-4" />
                                                                        {formatDistance(
                                                                            race
                                                                                .race
                                                                                .route
                                                                                ?.distance
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {badge && (
                                                                <div
                                                                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center shine shadow-lg`}
                                                                >
                                                                    <badge.icon className="w-6 h-6 text-white" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Stats */}
                                                        <div className="flex items-center gap-6 mt-3">
                                                            <div>
                                                                <div className="font-body text-xs text-zinc-500">
                                                                    Time
                                                                </div>
                                                                <div className="font-display text-xl text-zinc-900">
                                                                    {formatTime(
                                                                        race
                                                                            .result
                                                                            .finish_time
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div className="font-body text-xs text-zinc-500">
                                                                    Position
                                                                </div>
                                                                <div className="font-display text-xl text-cyan-600">
                                                                    {race.result
                                                                        .position ??
                                                                        "—"}{" "}
                                                                    /{" "}
                                                                    {
                                                                        race.total_participants
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                                {/* <button className="w-full mt-4 py-3 border-2 border-gray-300 rounded-lg font-heading text-lg text-zinc-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                    VIEW ALL RACES
                                    <ChevronRight className="w-5 h-5" />
                                </button> */}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "races" && (
                    <div className="fade-in-delay-2 space-y-6">
                        {myHostedRaces?.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-lg border-2 border-gray-200 shadow-sm">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                                    <Calendar className="w-10 h-10 text-gray-400" />
                                </div>
                                <p className="font-display text-3xl text-zinc-900 mb-2">
                                    No Hosted Races Yet
                                </p>
                                <p className="font-body text-base text-zinc-600 mb-6">
                                    Create a race to manage participants and
                                    results
                                </p>
                                <button className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-green-600 text-white font-heading text-lg rounded-lg hover:shadow-xl transition-all inline-flex items-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    CREATE YOUR FIRST RACE
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {myHostedRaces?.map((race) => {
                                const statusStyle = getRaceStatusStyle(
                                    race.status
                                )
                                const participantPercentage =
                                    race.max_participants
                                        ? ((race.participants?.length ?? 0) /
                                              race.max_participants) *
                                          100
                                        : 0

                                return (
                                    <div
                                        key={race.id}
                                        className="race-card bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm"
                                    >
                                        {/* Banner with overlay */}
                                        <div className="relative h-48">
                                            <img
                                                src={
                                                    race.banner_url ??
                                                    "/placeholder-race.jpg"
                                                }
                                                alt={race.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                                            {/* Status badge */}
                                            <div className="absolute top-4 right-4">
                                                <span
                                                    className={`px-4 py-2 rounded-full font-heading text-sm shadow-lg ${statusStyle}`}
                                                >
                                                    {race.status.toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Quick stats overlay */}
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <h3 className="font-display text-2xl text-white mb-2 drop-shadow-lg">
                                                    {race.name}
                                                </h3>
                                                <div className="flex items-center gap-3 text-sm text-white/90">
                                                    <span className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(
                                                            race.start_time
                                                        )}
                                                    </span>
                                                    {race.routes?.distance && (
                                                        <span className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded">
                                                            <Flag className="w-4 h-4" />
                                                            {formatDistance(
                                                                race.routes
                                                                    .distance
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            {/* Participants Progress */}
                                            <div className="mb-6">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-body text-sm text-zinc-600 flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-cyan-600" />
                                                        Participants
                                                    </span>
                                                    <span className="font-heading text-lg text-zinc-900">
                                                        {race.participants
                                                            ?.length ?? 0}
                                                        {race.max_participants && (
                                                            <span className="text-zinc-500">
                                                                /
                                                                {
                                                                    race.max_participants
                                                                }
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                                {race.max_participants && (
                                                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-cyan-600 to-green-600 rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${Math.min(
                                                                    participantPercentage,
                                                                    100
                                                                )}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-3 gap-3 mb-6">
                                                <div className="text-center p-3 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg border border-cyan-200">
                                                    <div className="font-display text-2xl text-cyan-700">
                                                        {race.participants
                                                            ?.length ?? 0}
                                                    </div>
                                                    <div className="font-body text-xs text-zinc-600 uppercase">
                                                        Runners
                                                    </div>
                                                </div>
                                                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                                                    <div className="font-display text-2xl text-green-700">
                                                        {race.routes?.distance
                                                            ? formatDistance(
                                                                  race.routes
                                                                      .distance
                                                              )
                                                            : "—"}
                                                    </div>
                                                    <div className="font-body text-xs text-zinc-600 uppercase">
                                                        Distance
                                                    </div>
                                                </div>
                                                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                                    <div className="font-display text-2xl text-purple-700">
                                                        {new Date(
                                                            race.start_time
                                                        ).toLocaleTimeString(
                                                            "en-US",
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                                hour12: true,
                                                            }
                                                        )}
                                                    </div>
                                                    <div className="font-body text-xs text-zinc-600 uppercase">
                                                        Start
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <button className="flex-1 py-3 border-2 border-gray-300 rounded-lg font-heading text-base text-zinc-700 hover:bg-gray-50 transition-colors">
                                                    VIEW
                                                </button>
                                                <button className="flex-1 py-3 bg-gradient-to-r from-zinc-800 to-zinc-900 text-white rounded-lg font-heading text-base hover:shadow-lg transition-all">
                                                    MANAGE
                                                </button>
                                                {race.status ===
                                                    "completed" && (
                                                    <button className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-green-600 text-white rounded-lg font-heading text-base hover:shadow-xl transition-all flex items-center justify-center gap-2">
                                                        <Trophy className="w-4 h-4" />
                                                        RESULTS
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {activeTab === "upcoming" && (
                    <div className="fade-in-delay-2 space-y-6">
                        {myUpcomingRaces?.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-lg border-2 border-gray-200 shadow-sm">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                                    <Calendar className="w-10 h-10 text-gray-400" />
                                </div>
                                <p className="font-display text-3xl text-zinc-900 mb-2">
                                    No Upcoming Races
                                </p>
                                <p className="font-body text-base text-zinc-600 mb-6">
                                    Join a race to see it here and start your
                                    training
                                </p>
                                <button className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-green-600 text-white font-heading text-lg rounded-lg hover:shadow-xl transition-all inline-flex items-center gap-2">
                                    <Search className="w-5 h-5" />
                                    BROWSE RACES
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {myUpcomingRaces?.map((race) => {
                                const days = daysUntil(race.start_time)
                                const isUrgent = days <= 3
                                const isToday = days === 0

                                return (
                                    <div
                                        key={race.id}
                                        className={`race-card bg-white border-2 rounded-xl overflow-hidden shadow-sm ${
                                            isUrgent
                                                ? "border-red-300 ring-2 ring-red-100"
                                                : "border-gray-200"
                                        }`}
                                    >
                                        {/* Banner with countdown overlay */}
                                        <div className="relative h-48">
                                            <img
                                                src={
                                                    race.banner_url ??
                                                    "/placeholder-race.jpg"
                                                }
                                                alt={race.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                                            {/* Countdown badge - prominent */}
                                            <div className="absolute top-4 right-4">
                                                {isToday ? (
                                                    <div className="px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-xl animate-pulse">
                                                        <div className="font-heading text-white text-lg flex items-center gap-2">
                                                            <Zap className="w-5 h-5" />
                                                            RACE DAY!
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={`px-5 py-3 rounded-lg shadow-xl ${
                                                            isUrgent
                                                                ? "bg-gradient-to-r from-red-500 to-red-600"
                                                                : "bg-gradient-to-r from-cyan-600 to-green-600"
                                                        }`}
                                                    >
                                                        <div className="font-display text-3xl text-white leading-none mb-1">
                                                            {days}
                                                        </div>
                                                        <div className="font-body text-xs text-white/90 uppercase tracking-wider">
                                                            {days === 1
                                                                ? "Day Left"
                                                                : "Days Left"}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Race name overlay */}
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <h3 className="font-display text-2xl text-white mb-2 drop-shadow-lg">
                                                    {race.name}
                                                </h3>
                                                <div className="flex items-center gap-3 text-sm text-white/90">
                                                    <span className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(
                                                            race.start_time
                                                        )}
                                                    </span>
                                                    {race.routes?.distance && (
                                                        <span className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded">
                                                            <Flag className="w-4 h-4" />
                                                            {formatDistance(
                                                                race.routes
                                                                    .distance
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            {/* Location */}
                                            {race.routes?.start_address && (
                                                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="flex items-start gap-3">
                                                        <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <div className="font-body font-semibold text-zinc-900 mb-1">
                                                                Starting Point
                                                            </div>
                                                            <div className="font-body text-sm text-zinc-600">
                                                                {
                                                                    race.routes
                                                                        .start_address
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Race Details Grid */}
                                            <div className="grid grid-cols-3 gap-3 mb-6">
                                                <div className="text-center p-3 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg border border-cyan-200">
                                                    <Clock className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
                                                    <div className="font-display text-xl text-cyan-700">
                                                        {new Date(
                                                            race.start_time
                                                        ).toLocaleTimeString(
                                                            "en-US",
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                                hour12: true,
                                                            }
                                                        )}
                                                    </div>
                                                    <div className="font-body text-xs text-zinc-600 uppercase">
                                                        Start Time
                                                    </div>
                                                </div>
                                                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                                                    <Users className="w-5 h-5 text-green-600 mx-auto mb-1" />
                                                    <div className="font-display text-xl text-green-700">
                                                        {race.participants
                                                            ?.length ?? 0}
                                                    </div>
                                                    <div className="font-body text-xs text-zinc-600 uppercase">
                                                        Registered
                                                    </div>
                                                </div>
                                                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                                    <Target className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                                                    <div className="font-display text-xl text-purple-700">
                                                        {race.routes?.distance
                                                            ? formatDistance(
                                                                  race.routes
                                                                      .distance
                                                              )
                                                            : "—"}
                                                    </div>
                                                    <div className="font-body text-xs text-zinc-600 uppercase">
                                                        Distance
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Weather & Tips */}
                                            {isUrgent && (
                                                <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                                                            <Zap className="w-4 h-4 text-white" />
                                                        </div>
                                                        <div>
                                                            <div className="font-heading text-base text-orange-900 mb-1">
                                                                RACE PREPARATION
                                                            </div>
                                                            <div className="font-body text-sm text-orange-800">
                                                                {isToday
                                                                    ? "🎯 Race starts today! Check your gear and arrive early."
                                                                    : `⏰ ${days} day${
                                                                          days >
                                                                          1
                                                                              ? "s"
                                                                              : ""
                                                                      } left. Start your prep routine and stay hydrated.`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Route Preview (if available) */}
                                            {/* {race.routes?.name && (
                                                <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-cyan-600" />
                                                        <span className="font-body text-sm text-zinc-700">
                                                            <span className="font-semibold">
                                                                Route:
                                                            </span>{" "}
                                                            {race.routes.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            )} */}

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <button className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-green-600 text-white rounded-lg font-heading text-base hover:shadow-xl transition-all flex items-center justify-center gap-2">
                                                    <Eye className="w-5 h-5" />
                                                    VIEW DETAILS
                                                </button>
                                                {/* {isUrgent && (
                                                    <button className="flex-1 py-3 border-2 border-orange-500 text-orange-700 bg-orange-50 rounded-lg font-heading text-base hover:bg-orange-100 transition-all flex items-center justify-center gap-2">
                                                        <MapPin className="w-5 h-5" />
                                                        GET DIRECTIONS
                                                    </button>
                                                )} */}
                                            </div>

                                            {/* Quick Actions */}
                                            {/* <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                                                <button className="text-sm text-zinc-600 hover:text-cyan-600 font-medium flex items-center gap-1 transition-colors">
                                                    <Share2 className="w-4 h-4" />
                                                    Share
                                                </button>
                                                <button className="text-sm text-zinc-600 hover:text-cyan-600 font-medium flex items-center gap-1 transition-colors">
                                                    <Bell className="w-4 h-4" />
                                                    Set Reminder
                                                </button>
                                                <button className="text-sm text-zinc-600 hover:text-cyan-600 font-medium flex items-center gap-1 transition-colors">
                                                    <Calendar className="w-4 h-4" />
                                                    Add to Calendar
                                                </button>
                                            </div> */}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
