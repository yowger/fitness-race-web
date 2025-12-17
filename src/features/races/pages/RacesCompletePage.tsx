import { useState } from "react"
import Map, { Marker, Source, Layer } from "@vis.gl/react-maplibre"
import {
    MapPin,
    Flag,
    MapPinned,
    CheckCircle,
    Download,
    Clock,
    Users,
    TrendingUp,
    Calendar,
    Award,
    Trophy,
} from "lucide-react"
import { useRace, useResults } from "../hooks/useRaces"
import { useParams } from "react-router-dom"

export default function RacesCompletePage() {
    const { id: raceId } = useParams()
    const [activeTab, setActiveTab] = useState<"all" | "finished" | "dnf">(
        "all"
    )

    const { data: race, isLoading: raceLoading } = useRace(raceId!)
    const { data: results, isLoading: resultsLoading } = useResults(raceId!)

    if (raceLoading || resultsLoading) return <div>Loading...</div>
    if (!race || !results) return <div>No race data found</div>

    // Map route coordinates
    const coords =
        race.routes?.geojson?.features?.[0]?.geometry?.coordinates || []
    const firstCoord = coords[0] || [0, 0]
    const lastCoord = coords[coords.length - 1] || [0, 0]

    // Process participants
    const finishedParticipants = results
        .filter((r) => r.status === "Finished")
        .sort((a, b) => (a.finish_time || 0) - (b.finish_time || 0))

    const dnfParticipants = results.filter((r) => r.status !== "Finished")
    const totalParticipants = results.length
    const finishedCount = finishedParticipants.length
    const dnfCount = dnfParticipants.length
    const completionRate = ((finishedCount / totalParticipants) * 100).toFixed(
        1
    )
    const leaderTime = finishedParticipants[0]?.finish_time
    const averageTime =
        finishedParticipants.length > 0
            ? Math.floor(
                  finishedParticipants.reduce(
                      (sum, p) => sum + (p.finish_time || 0),
                      0
                  ) / finishedParticipants.length
              )
            : 0

    const displayedParticipants =
        activeTab === "all"
            ? [...finishedParticipants, ...dnfParticipants]
            : activeTab === "finished"
            ? finishedParticipants
            : dnfParticipants

    const msToHMS = (ms?: number | null) => {
        if (!ms) return "—"
        const totalSeconds = Math.floor(ms / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60
        const pad = (n: number) => n.toString().padStart(2, "0")
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    }

    const calculateGap = (time?: number | null, leader?: number) => {
        if (!time || !leader) return "—"
        const diff = time - leader
        if (diff === 0) return "—"
        const seconds = Math.floor(diff / 1000)
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `+${mins}:${secs.toString().padStart(2, "0")}`
    }

    const calculatePace = (timeMs?: number, distanceKm: number = 42.2) => {
        if (!timeMs) return "—"
        const totalMinutes = timeMs / 60000
        const paceMinPerKm = totalMinutes / distanceKm
        const mins = Math.floor(paceMinPerKm)
        const secs = Math.round((paceMinPerKm - mins) * 60)
        return `${mins}:${secs.toString().padStart(2, "0")} /km`
    }

    // Export CSV
    const exportResults = () => {
        const csvContent = [
            ["Position", "Bib", "Name", "Time", "Gap", "Pace", "Status"],
            ...finishedParticipants.map((p, i) => [
                i + 1,
                p.bib_number,
                p.users.full_name,
                msToHMS(p.finish_time),
                calculateGap(p.finish_time, leaderTime),
                calculatePace(p.finish_time),
                p.status,
            ]),
            ...dnfParticipants.map((p) => [
                "DNF",
                p.bib_number,
                p.users.full_name,
                "—",
                "—",
                "—",
                p.status,
            ]),
        ]
            .map((row) => row.join(","))
            .join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${race.name.replace(/\s+/g, "_")}_Results.csv`
        a.click()
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-normal text-gray-900 mb-2">
                            {race.name}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                                <Calendar size={16} />
                                {new Date(race.start_time).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin size={16} />
                                {race.name || "N/A"}
                            </div>
                            <div className="flex items-center gap-1">
                                <TrendingUp size={16} />
                                {race.routes?.distance || "N/A"} km
                            </div>
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={exportResults}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            <Download size={16} />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Top Finishers Podium */}
                <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <Trophy className="text-yellow-600" size={20} /> Top
                        Finishers
                    </h2>

                    <div className="flex items-end justify-center gap-4">
                        {/* 2nd Place */}
                        {finishedParticipants[1] && (
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 rounded-full bg-linear-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-2xl font-bold mb-2 shadow-lg">
                                    2
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-md w-48 text-center">
                                    <p className="font-medium text-gray-900 mb-1">
                                        {
                                            finishedParticipants[1].users
                                                .full_name
                                        }
                                    </p>
                                    <p className="text-xs text-gray-600 mb-2">
                                        Bib #
                                        {finishedParticipants[1].bib_number}
                                    </p>
                                    <p className="text-2xl font-light text-gray-900 font-mono">
                                        {msToHMS(
                                            finishedParticipants[1].finish_time
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {calculatePace(
                                            finishedParticipants[1].finish_time
                                        )}
                                    </p>
                                </div>
                                <div className="w-24 h-16 bg-linear-to-t from-gray-300 to-gray-200 mt-2 rounded-t-lg shadow-inner" />
                            </div>
                        )}

                        {/* 1st Place */}
                        {finishedParticipants[0] && (
                            <div className="flex flex-col items-center -mt-8">
                                <div className="text-4xl mb-2">🏆</div>
                                <div className="w-24 h-24 rounded-full bg-linear-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-3xl font-bold mb-2 shadow-xl">
                                    1
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-xl w-52 text-center border-2 border-yellow-400">
                                    <p className="font-medium text-gray-900 mb-1 text-lg">
                                        {
                                            finishedParticipants[0].users
                                                .full_name
                                        }
                                    </p>
                                    <p className="text-xs text-gray-600 mb-2">
                                        Bib #
                                        {finishedParticipants[0].bib_number}
                                    </p>
                                    <p className="text-3xl font-light text-gray-900 font-mono">
                                        {msToHMS(
                                            finishedParticipants[0].finish_time
                                        )}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {calculatePace(
                                            finishedParticipants[0].finish_time
                                        )}
                                    </p>
                                </div>
                                <div className="w-28 h-24 bg-linear-to-t from-yellow-500 to-yellow-400 mt-2 rounded-t-lg shadow-inner" />
                            </div>
                        )}

                        {/* 3rd Place */}
                        {finishedParticipants[2] && (
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold mb-2 shadow-lg">
                                    3
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-md w-48 text-center">
                                    <p className="font-medium text-gray-900 mb-1">
                                        {
                                            finishedParticipants[2].users
                                                .full_name
                                        }
                                    </p>
                                    <p className="text-xs text-gray-600 mb-2">
                                        Bib #
                                        {finishedParticipants[2].bib_number}
                                    </p>
                                    <p className="text-2xl font-light text-gray-900 font-mono">
                                        {msToHMS(
                                            finishedParticipants[2].finish_time
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {calculatePace(
                                            finishedParticipants[2].finish_time
                                        )}
                                    </p>
                                </div>
                                <div className="w-24 h-12 bg-linear-to-t from-orange-500 to-orange-400 mt-2 rounded-t-lg shadow-inner" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg border p-5 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">
                                Total Participants
                            </p>
                            <p className="text-3xl font-normal text-gray-900">
                                {totalParticipants}
                            </p>
                        </div>
                        <Users className="text-blue-600" size={24} />
                    </div>

                    <div className="bg-white rounded-lg border p-5 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">
                                Finished
                            </p>
                            <p className="text-3xl font-normal text-gray-900">
                                {finishedCount}
                            </p>
                        </div>
                        <CheckCircle className="text-green-600" size={24} />
                    </div>

                    <div className="bg-white rounded-lg border p-5 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">
                                Completion Rate
                            </p>
                            <p className="text-3xl font-normal text-gray-900">
                                {completionRate}%
                            </p>
                        </div>
                        <Award className="text-purple-600" size={24} />
                    </div>

                    <div className="bg-white rounded-lg border p-5 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">
                                Average Time
                            </p>
                            <p className="text-2xl font-normal text-gray-900 font-mono">
                                {msToHMS(averageTime)}
                            </p>
                        </div>
                        <Clock className="text-orange-600" size={24} />
                    </div>
                </div>

                {/* Map */}
                <div className="bg-white rounded-lg border overflow-hidden mb-6 shadow-sm">
                    <div className="border-b px-6 py-4">
                        <h2 className="text-lg font-medium text-gray-900">
                            Race Route
                        </h2>
                    </div>
                    <div className="h-[450px]">
                        <Map
                            mapStyle="https://api.maptiler.com/maps/streets-v4/style.json?key=l60bj9KIXXKDXbsOvzuz"
                            initialViewState={{
                                longitude: firstCoord[0],
                                latitude: firstCoord[1],
                                zoom: 14,
                            }}
                            attributionControl={false}
                        >
                            <Source
                                id="route"
                                type="geojson"
                                data={{
                                    type: "FeatureCollection",
                                    features: [
                                        {
                                            type: "Feature",
                                            geometry: {
                                                type: "LineString",
                                                coordinates: coords,
                                            },
                                            properties: {},
                                        },
                                    ],
                                }}
                            >
                                <Layer
                                    id="route-line"
                                    type="line"
                                    paint={{
                                        "line-width": 4,
                                        "line-color": "#1a73e8",
                                    }}
                                />
                            </Source>

                            <Marker
                                longitude={firstCoord[0]}
                                latitude={firstCoord[1]}
                            >
                                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center shadow-xl border-2 border-white">
                                    <MapPinned
                                        className="text-white"
                                        size={20}
                                    />
                                </div>
                            </Marker>

                            <Marker
                                longitude={lastCoord[0]}
                                latitude={lastCoord[1]}
                            >
                                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-xl border-2 border-white">
                                    <Flag className="text-white" size={20} />
                                </div>
                            </Marker>
                        </Map>
                    </div>
                </div>

                {/* Results Table */}
                <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
                    <div className="border-b px-6 py-4 flex items-center justify-between">
                        <h2 className="text-lg font-medium text-gray-900">
                            Complete Results
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab("all")}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${
                                    activeTab === "all"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-700"
                                }`}
                            >
                                All ({totalParticipants})
                            </button>
                            <button
                                onClick={() => setActiveTab("finished")}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${
                                    activeTab === "finished"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-700"
                                }`}
                            >
                                Finished ({finishedCount})
                            </button>
                            <button
                                onClick={() => setActiveTab("dnf")}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${
                                    activeTab === "dnf"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-700"
                                }`}
                            >
                                DNF ({dnfCount})
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Pos
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Bib
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Gap
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Pace
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {displayedParticipants.map((p) => {
                                    return (
                                        <tr
                                            key={p.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {p.position || "—"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {p.bib_number}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {p.users.full_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-mono">
                                                {msToHMS(p.finish_time)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-mono">
                                                {calculateGap(
                                                    p.finish_time,
                                                    leaderTime
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-mono">
                                                {calculatePace(p.finish_time)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                        p.status === "Finished"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {p.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
