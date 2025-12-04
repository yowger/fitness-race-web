import { useState } from "react"
import { Users, Clock, Plus, MapPin, ChevronRight } from "lucide-react"
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
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold">Races</h1>
                <Link to="/dashboard/races/create">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        <Plus className="w-4 h-4" />
                        Create Race
                    </button>
                </Link>
            </div>

            <input
                type="text"
                placeholder="Search races..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex gap-2 mt-4 flex-wrap">
                {["upcoming", "ongoing", "finished"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() =>
                            setTabStatus(
                                tab as "upcoming" | "ongoing" | "finished"
                            )
                        }
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                            tabStatus === tab
                                ? "bg-blue-50 text-blue-700"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {isLoading && (
                <div className="py-16 text-center text-gray-500">
                    Loading races...
                </div>
            )}

            {!isLoading && races && races.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                    {races.map((race) => (
                        <RaceCard key={race.id} race={race} />
                    ))}
                </div>
            )}

            {!isLoading && (!races || races.length === 0) && (
                <div className="py-16 text-center text-gray-500">
                    No races found.
                </div>
            )}
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
                    text: "● Live",
                    className: "bg-green-100 text-green-700 border-green-200",
                }
            case "finished":
                return {
                    text: "Completed",
                    className: "bg-gray-100 text-gray-700 border-gray-200",
                }
            default:
                return {
                    text: "Upcoming",
                    className: "bg-blue-100 text-blue-700 border-blue-200",
                }
        }
    }
    const status = getStatus()

    return (
        <div className="group w-full bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all cursor-pointer">
            <div className="relative h-48 bg-gray-100 overflow-hidden">
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={race.routes?.name || race.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-emerald-500 to-teal-500">
                        <MapPin className="w-16 h-16 text-white/50" />
                    </div>
                )}

                <div className="absolute top-3 right-3">
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${status.className}`}
                    >
                        {status.text}
                    </span>
                </div>

                {race.routes?.name && (
                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-3">
                        <div className="flex items-center gap-2 text-white text-sm">
                            <MapPin className="w-4 h-4" />
                            <span className="font-medium">
                                {race.routes.name}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                    <h2 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 line-clamp-1">
                        {race.name}
                    </h2>
                    {race.routes?.distance && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium whitespace-nowrap">
                            {race.routes.distance.toFixed(1)} km
                        </span>
                    )}
                </div>

                {race.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                        {race.description}
                    </p>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{new Date(race.start_time).toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>
                        {participantCount}/{maxParticipants} participants
                    </span>
                    {isFull && (
                        <span className="ml-auto text-xs font-medium text-red-600">
                            Full
                        </span>
                    )}
                </div>

                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
                    <div
                        className={`h-full rounded-full ${
                            isFull ? "bg-red-500" : "bg-blue-500"
                        } transition-all`}
                        style={{
                            width: `${Math.min(participationRate, 100)}%`,
                        }}
                    />
                </div>

                <Link to={`/dashboard/races/${race.id}`}>
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition text-sm font-medium">
                        View Details
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </Link>
            </div>
        </div>
    )
}
