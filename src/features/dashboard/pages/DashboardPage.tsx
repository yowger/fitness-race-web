import {
    Calendar,
    TrendingUp,
    Trophy,
    Users,
    Clock,
    ArrowRight,
} from "lucide-react"
import { useUser } from "../../auth/hooks/useUser"
import { useRaces } from "../../races/hooks/useRaces"
import { Link } from "react-router-dom"

export default function DashboardPage() {
    const { data: user } = useUser()
    const { data: myFinishedRaces } = useRaces({
        status: "complete",
        userId: user?.id,
    })
    const { data: myJoinedRaces } = useRaces({
        userId: user?.id,
        status: "upcoming",
    })
    const { data: myHostedRaces } = useRaces({
        createdBy: user?.id,
    })

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-linear-to-br from-blue-600 to-indigo-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">
                                Welcome back, {user?.full_name}!
                            </h1>
                            <p className="text-blue-100 text-lg">
                                Ready to crush your next race?
                            </p>
                        </div>
                        <div className="mt-6 md:mt-0 flex gap-3">
                            <Link to="/dashboard/races/create">
                                <button className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-lg font-semibold transition-colors">
                                    Create Race
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                                    <Trophy className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">
                                        Races Completed
                                    </p>
                                    <p className="text-3xl font-bold">15</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">
                                        Total Distance
                                    </p>
                                    <p className="text-3xl font-bold">120 km</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">
                                        Personal Best
                                    </p>
                                    <p className="text-3xl font-bold">21:45</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">
                                        Upcoming Races
                                    </p>
                                    <p className="text-3xl font-bold">3</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Recent Runs
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                Your latest training sessions
                            </p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 group">
                            View All
                            <ArrowRight
                                size={16}
                                className="group-hover:translate-x-1 transition-transform"
                            />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myFinishedRaces && myFinishedRaces.length > 0 ? (
                            myFinishedRaces.map((race) => (
                                <div
                                    key={race.id}
                                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                                >
                                    <div className="relative">
                                        <img
                                            src={
                                                race.routes?.map_url ||
                                                "https://via.placeholder.com/400x150?text=Map+Image"
                                            }
                                            alt={race.name}
                                            className="w-full h-40 object-cover"
                                        />
                                        <div className="absolute top-3 right-3 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                                            COMPLETED
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            {race.name}
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Calendar
                                                    size={16}
                                                    className="text-blue-600"
                                                />
                                                <span>
                                                    {new Date(
                                                        race.start_time
                                                    ).toLocaleDateString()}{" "}
                                                    |{" "}
                                                    {new Date(
                                                        race.start_time
                                                    ).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Users
                                                    size={16}
                                                    className="text-blue-600"
                                                />
                                                <span>
                                                    {race.participants
                                                        ?.length || 0}{" "}
                                                    /{" "}
                                                    {race.max_participants ||
                                                        "∞"}{" "}
                                                    participants
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <TrendingUp
                                                    size={16}
                                                    className="text-blue-600"
                                                />
                                                <span>
                                                    {(
                                                        race.routes?.distance ||
                                                        0
                                                    ).toFixed(2)}{" "}
                                                    km
                                                </span>
                                            </div>
                                        </div>
                                        <Link
                                            to={`/dashboard/races/${race.id}/complete`}
                                        >
                                            <button className="mt-4 w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors">
                                                View Details
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center text-gray-500">
                                You haven't completed any races yet.
                            </div>
                        )}
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Upcoming Races
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                Races you're participating in
                            </p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 group">
                            View All
                            <ArrowRight
                                size={16}
                                className="group-hover:translate-x-1 transition-transform"
                            />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myJoinedRaces && myJoinedRaces.length > 0 ? (
                            myJoinedRaces.map((race) => (
                                <div
                                    key={race.id}
                                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    <div className="relative">
                                        <img
                                            src={
                                                race.routes?.map_url ||
                                                "https://via.placeholder.com/400x150?text=Map+Image"
                                            }
                                            alt={race.name}
                                            className="w-full h-40 object-cover"
                                        />
                                        <div className="absolute top-3 right-3 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                                            {race.status.toUpperCase()}
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            {race.name}
                                        </h3>

                                        <div className="space-y-2 text-sm mb-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Calendar
                                                    size={16}
                                                    className="text-blue-600"
                                                />
                                                <span>
                                                    {new Date(
                                                        race.start_time
                                                    ).toLocaleDateString()}{" "}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Users
                                                    size={16}
                                                    className="text-blue-600"
                                                />
                                                <span>
                                                    {race.participants
                                                        ?.length || 0}{" "}
                                                    /{" "}
                                                    {race.max_participants ||
                                                        "∞"}{" "}
                                                    participants
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <TrendingUp
                                                    size={16}
                                                    className="text-blue-600"
                                                />
                                                <span>
                                                    {(
                                                        race.routes?.distance ||
                                                        0
                                                    ).toFixed(2)}{" "}
                                                    km
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                                            <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                                                {race.created_by_user
                                                    ?.full_name?.[0] || "?"}
                                            </div>
                                            <span>
                                                Hosted by{" "}
                                                {race.created_by_user
                                                    ?.full_name || "Unknown"}
                                            </span>
                                        </div>

                                        <Link
                                            to={`/dashboard/races/${race.id}`}
                                        >
                                            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors">
                                                View Race
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center text-gray-500">
                                You haven't joined any races yet.
                            </div>
                        )}
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Your Hosted Races
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                Races you're organizing
                            </p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 group">
                            View All
                            <ArrowRight
                                size={16}
                                className="group-hover:translate-x-1 transition-transform"
                            />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myHostedRaces && myHostedRaces.length > 0 ? (
                            myHostedRaces.map((race) => (
                                <div
                                    key={race.id}
                                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    <div className="relative">
                                        <img
                                            src={
                                                race.routes?.map_url ||
                                                "https://via.placeholder.com/400x150?text=Map+Image"
                                            }
                                            alt={race.name}
                                            className="w-full h-40 object-cover"
                                        />
                                        {/* <div className="absolute top-3 left-3 px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                            <Trophy size={12} />
                                            HOST
                                        </div> */}
                                        <div className="absolute top-3 right-3 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                                            {race.status.toUpperCase()}
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            {race.name}
                                        </h3>

                                        <div className="space-y-2 text-sm mb-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Calendar
                                                    size={16}
                                                    className="text-blue-600"
                                                />
                                                <span>
                                                    {new Date(
                                                        race.start_time
                                                    ).toLocaleDateString()}{" "}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Users
                                                    size={16}
                                                    className="text-blue-600"
                                                />
                                                <span>
                                                    {race.participants
                                                        ?.length || 0}{" "}
                                                    /{" "}
                                                    {race.max_participants ||
                                                        "∞"}{" "}
                                                    participants
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <TrendingUp
                                                    size={16}
                                                    className="text-blue-600"
                                                />
                                                <span>
                                                    {(
                                                        race.routes?.distance ||
                                                        0
                                                    ).toFixed(2)}{" "}
                                                    km
                                                </span>
                                            </div>
                                        </div>

                                        {race.max_participants && (
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                    <span>
                                                        Registration Progress
                                                    </span>
                                                    <span className="font-semibold">
                                                        {Math.round(
                                                            ((race.participants
                                                                ?.length || 0) /
                                                                race.max_participants) *
                                                                100
                                                        )}
                                                        %
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{
                                                            width: `${
                                                                ((race
                                                                    .participants
                                                                    ?.length ||
                                                                    0) /
                                                                    race.max_participants) *
                                                                100
                                                            }%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        <Link
                                            to={`/dashboard/races/${race.id}`}
                                        >
                                            <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm transition-colors">
                                                Manage Race
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center text-gray-500">
                                You haven't hosted any races yet.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    )
}
