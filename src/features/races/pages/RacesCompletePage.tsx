import { useState } from "react"
import {
    Trophy,
    Medal,
    Download,
    Clock,
    TrendingUp,
    Award,
    Users,
    Search,
    Calendar,
    MapPin,
    Activity,
} from "lucide-react"

import "../styles/racesCompletePage.css"
import { useParams } from "react-router-dom"
import {
    useRace,
    useResults,
    useTracking,
    type Tracking,
} from "../hooks/useRaces"
import { formatDate } from "../../../lib/time"

interface RaceResults {
    id: string
    bib: string
    name: string
    time: string
    pace: string
    position: number
    splits: string[]
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371
    const toRad = (v: number) => (v * Math.PI) / 180

    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2

    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatTime(ms: number) {
    if (ms <= 0 || isNaN(ms)) return "00:00:00"

    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return [
        hours.toString().padStart(2, "0"),
        minutes.toString().padStart(2, "0"),
        seconds.toString().padStart(2, "0"),
    ].join(":")
}

function formatPace(secPerKm: number) {
    if (!isFinite(secPerKm)) return "-"

    const m = Math.floor(secPerKm / 60)
    const s = Math.floor(secPerKm % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
}

function computePaceAndSplits(points: Tracking[]) {
    if (points.length < 2) {
        return { pace: "–", splits: [] as string[] }
    }

    const ordered = [...points].sort(
        (a, b) =>
            new Date(a.recorded_at).getTime() -
            new Date(b.recorded_at).getTime()
    )

    let totalDistance = 0
    const splits: number[] = []
    let nextKm = 1

    let splitStartTime = new Date(ordered[0].recorded_at).getTime()

    for (let i = 1; i < ordered.length; i++) {
        const d = haversine(
            ordered[i - 1].latitude,
            ordered[i - 1].longitude,
            ordered[i].latitude,
            ordered[i].longitude
        )

        totalDistance += d

        if (totalDistance >= nextKm) {
            const now = new Date(ordered[i].recorded_at).getTime()
            splits.push(now - splitStartTime)
            splitStartTime = now
            nextKm++
        }
    }

    const totalTime =
        new Date(ordered.at(-1)!.recorded_at).getTime() -
        new Date(ordered[0].recorded_at).getTime()

    const paceSecPerKm =
        totalDistance > 0 ? totalTime / 1000 / totalDistance : 0

    return {
        pace: formatPace(paceSecPerKm),
        splits: splits.map((ms) => formatTime(ms)),
    }
}

function safeElapsedTime(durationMs?: number) {
    if (!durationMs || durationMs <= 0) return "N/A"
    return formatTime(durationMs)
}

export default function RaceResultsPage() {
    const { id: raceId } = useParams()
    const { data: race } = useRace(raceId!)
    const { data: results } = useResults(raceId!)
    const { data: raceTracking } = useTracking(raceId!)

    const resultsData: RaceResults[] =
        results?.map((result) => {
            const userId = result.users?.id ?? ""

            const userTracking =
                raceTracking?.filter((t) => t.user_id === userId) ?? []

            const { pace, splits } = computePaceAndSplits(userTracking)

            return {
                id: userId,
                bib: String(result.bib_number ?? 0),
                name: result.users?.full_name || "Unknown",
                time: safeElapsedTime(result.finish_time),
                pace,
                position: result.position ?? 0,
                splits,
            }
        }) ?? []

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedRunner, setSelectedRunner] = useState<RaceResults | null>(
        null
    )

    const filteredResults = resultsData.filter((runner) => {
        const matchesSearch =
            runner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            runner.bib.includes(searchTerm)
        return matchesSearch
    })

    const podium = resultsData
        .filter((runner) => {
            const originalResult = results?.find(
                (r) => r.users?.id === runner.id
            )
            return originalResult?.status === "Finished"
        })
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .slice(0, 3)

    const finishedResults =
        results?.filter((r) => r.status === "Finished") ?? []

    const finishTimesInSec = finishedResults.map(
        (r) => (r.finish_time ?? 0) / 1000
    )

    const avgTimeSec =
        finishTimesInSec.reduce((sum, t) => sum + t, 0) /
            finishTimesInSec.length || 0

    const fastestTimeSec = Math.min(...finishTimesInSec, Infinity)

    function formatSeconds(sec: number) {
        const hours = Math.floor(sec / 3600)
        const minutes = Math.floor((sec % 3600) / 60)
        const seconds = Math.floor(sec % 60)
        return [hours, minutes, seconds]
            .map((v) => String(v).padStart(2, "0"))
            .join(":")
    }

    const avgPaceSecPerKm =
        finishedResults
            .map((r) => {
                const userTracking =
                    raceTracking?.filter((t) => t.user_id === r.users?.id) ?? []
                const { pace } = computePaceAndSplits(userTracking)
                const [min, sec] = pace.split(":").map(Number)
                return min * 60 + sec
            })
            .reduce((sum, p) => sum + p, 0) / finishedResults.length || 0

    const avgPaceFormatted = formatPace(avgPaceSecPerKm)

    const finishRate = (finishedResults.length / (results?.length ?? 1)) * 100

    const statistics = {
        averageTime: formatSeconds(avgTimeSec),
        fastestTime: formatSeconds(fastestTimeSec),
        averagePace: avgPaceFormatted,
        finishRate: Number(finishRate.toFixed(1)),
    }

    function exportResults(data: RaceResults[]) {
        if (!data || data.length === 0) return

        const header = ["Position", "BIB", "Runner", "Time", "Pace"]
        const rows = data.map((r) => [
            r.position,
            r.bib,
            r.name,
            r.time,
            r.pace,
        ])

        const csvContent = [header, ...rows]
            .map((row) => row.join(","))
            .join("\n")

        const bom = "\uFEFF"
        const blob = new Blob([bom + csvContent], {
            type: "text/csv;charset=utf-8;",
        })
        const url = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", `race-results.csv`)
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="min-h-screen bg-gray-50 font-body">
            <div className="relative overflow-hidden grain-texture">
                <div className="absolute inset-0 hero-gradient"></div>
                <img
                    src={race?.banner_url}
                    alt={race?.name}
                    className="w-full h-[50vh] object-cover opacity-30"
                />

                <div className="absolute inset-0 flex items-end bg-linear-to-t from-gray-50 via-transparent">
                    <div className="w-full max-w-7xl mx-auto px-6 pb-12">
                        <div className="fade-in">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="px-6 py-2 bg-green-600 text-white font-heading text-lg uppercase rounded-full">
                                    {race?.status}
                                </span>
                                <span className="px-6 py-2 bg-cyan-50 border border-cyan-600 text-cyan-700 font-heading text-lg rounded-full">
                                    {race?.routes?.distance?.toFixed(2)} km
                                </span>
                            </div>

                            <h1 className="font-display text-7xl md:text-8xl leading-none mb-4 text-zinc-900">
                                {race?.name}
                            </h1>

                            <div className="flex flex-wrap gap-6 text-zinc-600 font-body text-lg">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-cyan-600" />
                                    <span>
                                        {formatDate(race?.actual_start_time)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-cyan-600" />
                                    <span>{race?.routes?.start_address}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-cyan-600" />
                                    <span>
                                        {finishedResults.length} Finishers
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                {/* Statistics Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 fade-in">
                    <div className="stat-card p-6 bg-white border-2 border-gray-200 rounded-lg shadow-sm text-center">
                        <Clock className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
                        <div className="font-body text-sm text-zinc-600 mb-1">
                            Average Time
                        </div>
                        <div className="font-display text-3xl text-zinc-900">
                            {statistics.averageTime}
                        </div>
                    </div>

                    <div className="stat-card p-6 bg-white border-2 border-green-200 rounded-lg shadow-sm text-center">
                        <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="font-body text-sm text-zinc-600 mb-1">
                            Fastest Time
                        </div>
                        <div className="font-display text-3xl text-green-600">
                            {statistics.fastestTime}
                        </div>
                    </div>

                    <div className="stat-card p-6 bg-white border-2 border-orange-200 rounded-lg shadow-sm text-center">
                        <Activity className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                        <div className="font-body text-sm text-zinc-600 mb-1">
                            Average Pace
                        </div>
                        <div className="font-display text-3xl text-orange-600">
                            {statistics.averagePace}
                        </div>
                    </div>

                    <div className="stat-card p-6 bg-white border-2 border-purple-200 rounded-lg shadow-sm text-center">
                        <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <div className="font-body text-sm text-zinc-600 mb-1">
                            Finish Rate
                        </div>
                        <div className="font-display text-3xl text-purple-600">
                            {statistics.finishRate}%
                        </div>
                    </div>
                </div>

                {/* Podium Section */}
                <div className="mb-16">
                    <h2 className="font-display text-5xl text-zinc-900 mb-8 text-center fade-in-delay-1">
                        Top Finishers
                    </h2>

                    <div className="flex items-end justify-center gap-8 max-w-4xl mx-auto">
                        {podium[0] && (
                            <div className="podium-2 flex-1 text-center">
                                <div className="relative inline-block mb-4">
                                    <div className="w-24 h-24 rounded-full medal-silver flex items-center justify-center shine">
                                        <Medal className="w-12 h-12 text-white" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-gray-400 rounded-full flex items-center justify-center font-heading text-lg">
                                        2
                                    </div>
                                </div>
                                <div className="bg-white border-2 border-gray-300 rounded-t-2xl p-6 min-h-[280px] flex flex-col justify-between">
                                    <div>
                                        <div className="font-heading text-sm text-zinc-500 mb-1">
                                            BIB #{podium[1].bib}
                                        </div>
                                        <h3 className="font-display text-2xl text-zinc-900 mb-2">
                                            {podium[1].name}
                                        </h3>
                                        {/* <div className="inline-block px-3 py-1 bg-gray-100 text-zinc-600 text-xs rounded-full font-body mb-4">
                                        {podium[1].category}
                                    </div> */}
                                        <div className="font-display text-4xl text-zinc-900 mb-1">
                                            {podium[1].time}
                                        </div>
                                        <div className="font-body text-sm text-zinc-500">
                                            {podium[1].pace} /km
                                        </div>
                                    </div>
                                    {/* <button className="certificate-btn mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 text-zinc-900 font-heading text-sm rounded-lg transition-colors flex items-center justify-center gap-2">
                                        <Download className="w-4 h-4" />
                                        CERTIFICATE
                                    </button> */}
                                </div>
                            </div>
                        )}

                        {podium[0] && (
                            <div className="podium-1 flex-1 text-center">
                                <div className="relative inline-block mb-4 trophy-float">
                                    <div className="w-32 h-32 rounded-full medal-gold flex items-center justify-center shine">
                                        <Trophy className="w-16 h-16 text-white" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-white border-2 border-yellow-500 rounded-full flex items-center justify-center font-heading text-xl">
                                        1
                                    </div>
                                </div>
                                <div className="bg-white border-2 border-yellow-400 rounded-t-2xl p-6 min-h-[320px] flex flex-col justify-between shadow-lg">
                                    <div>
                                        <div className="font-heading text-sm text-zinc-500 mb-1">
                                            BIB #{podium[0].bib}
                                        </div>
                                        <h3 className="font-display text-3xl text-zinc-900 mb-2">
                                            {podium[0].name}
                                        </h3>
                                        {/* <div className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-body mb-4">
                                        {podium[0].category}
                                    </div> */}
                                        <div className="font-display text-5xl text-yellow-600 mb-1">
                                            {podium[0].time}
                                        </div>
                                        <div className="font-body text-sm text-zinc-500">
                                            {podium[0].pace} /km
                                        </div>
                                    </div>
                                    {/* <button className="certificate-btn mt-4 w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-heading text-base rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                                        <Download className="w-4 h-4" />
                                        CERTIFICATE
                                    </button> */}
                                </div>
                            </div>
                        )}

                        {podium[2] && (
                            <div className="podium-3 flex-1 text-center">
                                <div className="relative inline-block mb-4">
                                    <div className="w-24 h-24 rounded-full medal-bronze flex items-center justify-center shine">
                                        <Award className="w-12 h-12 text-white" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-orange-700 rounded-full flex items-center justify-center font-heading text-lg">
                                        3
                                    </div>
                                </div>
                                <div className="bg-white border-2 border-orange-300 rounded-t-2xl p-6 min-h-[240px] flex flex-col justify-between">
                                    <div>
                                        <div className="font-heading text-sm text-zinc-500 mb-1">
                                            BIB #{podium[2].bib}
                                        </div>
                                        <h3 className="font-display text-2xl text-zinc-900 mb-2">
                                            {podium[2].name}
                                        </h3>
                                        {/* <div className="inline-block px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-body mb-4">
                                        {podium[2].category}
                                    </div> */}
                                        <div className="font-display text-4xl text-zinc-900 mb-1">
                                            {podium[2].time}
                                        </div>
                                        <div className="font-body text-sm text-zinc-500">
                                            {podium[2].pace} /km
                                        </div>
                                    </div>
                                    <button className="certificate-btn mt-4 w-full py-2 bg-orange-100 hover:bg-orange-200 text-orange-900 font-heading text-sm rounded-lg transition-colors flex items-center justify-center gap-2">
                                        <Download className="w-4 h-4" />
                                        CERTIFICATE
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Complete Results Section */}
                <div className="fade-in-delay-3">
                    <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        {/* Search and Filter Bar */}
                        <div className="p-6 border-b border-gray-200 bg-gray-50">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or bib number..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg font-body focus:outline-none focus:border-cyan-600 transition-colors"
                                    />
                                </div>
                                {/* 
                                <div className="flex items-center gap-2">
                                    <Filter className="w-5 h-5 text-zinc-600" />
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) =>
                                            setCategoryFilter(e.target.value)
                                        }
                                        className="px-4 py-3 border-2 border-gray-300 rounded-lg font-body focus:outline-none focus:border-cyan-600 transition-colors"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat === "all"
                                                    ? "All Categories"
                                                    : cat}
                                            </option>
                                        ))}
                                    </select>
                                </div> */}

                                <button
                                    onClick={() =>
                                        exportResults(filteredResults)
                                    }
                                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-heading text-lg rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Download className="w-5 h-5" />
                                    EXPORT
                                </button>
                            </div>

                            <div className="mt-4 flex items-center justify-between text-sm text-zinc-600">
                                <span>
                                    Showing {filteredResults.length} of{" "}
                                    {resultsData.length} results
                                </span>
                                {/* <button className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium">
                                    <Share2 className="w-4 h-4" />
                                    Share Results
                                </button> */}
                            </div>
                        </div>

                        {/* Results Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b-2 border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-heading text-sm text-zinc-700">
                                            POSITION
                                        </th>
                                        <th className="px-6 py-4 text-left font-heading text-sm text-zinc-700">
                                            BIB
                                        </th>
                                        <th className="px-6 py-4 text-left font-heading text-sm text-zinc-700">
                                            RUNNER
                                        </th>
                                        <th className="px-6 py-4 text-left font-heading text-sm text-zinc-700">
                                            TIME
                                        </th>
                                        <th className="px-6 py-4 text-left font-heading text-sm text-zinc-700">
                                            PACE
                                        </th>
                                        <th className="px-6 py-4 text-center font-heading text-sm text-zinc-700">
                                            ACTIONS
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredResults.map((runner) => (
                                        <tr
                                            key={runner.id}
                                            className="result-row border-b border-gray-200 cursor-pointer"
                                            onClick={() =>
                                                setSelectedRunner(runner)
                                            }
                                        >
                                            {/* POSITION */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-display text-2xl text-zinc-900">
                                                        {runner.position}
                                                    </span>
                                                    {runner.position <= 3 && (
                                                        <div
                                                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                                                runner.position ===
                                                                1
                                                                    ? "medal-gold"
                                                                    : runner.position ===
                                                                      2
                                                                    ? "medal-silver"
                                                                    : "medal-bronze"
                                                            }`}
                                                        >
                                                            <span className="text-white text-xs">
                                                                ★
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* BIB */}
                                            <td className="px-6 py-5">
                                                <span className="font-heading text-lg text-cyan-600">
                                                    #{runner.bib}
                                                </span>
                                            </td>

                                            {/* RUNNER */}
                                            <td className="px-6 py-5">
                                                <div className="font-body font-semibold text-zinc-900">
                                                    {runner.name}
                                                </div>
                                            </td>

                                            {/* TIME */}
                                            <td className="px-6 py-5">
                                                <span className="font-display text-xl text-zinc-900">
                                                    {runner.time}
                                                </span>
                                            </td>

                                            {/* PACE */}
                                            <td className="px-6 py-5">
                                                <span className="font-body text-zinc-700">
                                                    {runner.pace}{" "}
                                                    <span className="text-zinc-500 text-sm">
                                                        /km
                                                    </span>
                                                </span>
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                                        <Download className="w-4 h-4 text-zinc-700" />
                                                    </button>
                                                    {/* <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                                        <Share2 className="w-4 h-4 text-zinc-700" />
                                                    </button> */}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Runner Detail Modal */}
                {selectedRunner && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                        onClick={() => setSelectedRunner(null)}
                    >
                        <div
                            className="bg-white border-2 border-cyan-200 rounded-lg p-8 max-w-3xl w-full shadow-2xl fade-in"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                            selectedRunner.position === 1
                                                ? "medal-gold"
                                                : selectedRunner.position === 2
                                                ? "medal-silver"
                                                : selectedRunner.position === 3
                                                ? "medal-bronze"
                                                : "bg-gray-200"
                                        }`}
                                    >
                                        <span className="font-display text-2xl text-white">
                                            {selectedRunner.position}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-heading text-sm text-cyan-600 mb-1">
                                            BIB #{selectedRunner.bib}
                                        </div>
                                        <h3 className="font-display text-4xl text-zinc-900 mb-2">
                                            {selectedRunner.name}
                                        </h3>
                                        {/* <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-gray-100 text-zinc-700 text-sm rounded-full font-body">
                                                {selectedRunner.category}
                                            </span>
                                            {selectedRunner.team && (
                                                <span className="text-zinc-600 font-body">
                                                    {selectedRunner.team}
                                                </span>
                                            )}
                                        </div> */}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedRunner(null)}
                                    className="text-zinc-400 hover:text-zinc-900 text-3xl leading-none"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 rounded-lg">
                                    <div className="font-body text-sm text-zinc-600 mb-1">
                                        Finish Time
                                    </div>
                                    <div className="font-display text-3xl text-cyan-700">
                                        {selectedRunner.time}
                                    </div>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg">
                                    <div className="font-body text-sm text-zinc-600 mb-1">
                                        Avg Pace
                                    </div>
                                    <div className="font-display text-3xl text-green-700">
                                        {selectedRunner.pace}
                                    </div>
                                </div>
                                {/* <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg">
                                    <div className="font-body text-sm text-zinc-600 mb-1">
                                        Cat. Position
                                    </div>
                                    <div className="font-display text-3xl text-orange-700">
                                        #{selectedRunner.categoryPosition}
                                    </div>
                                </div> */}
                            </div>

                            {/* Splits */}
                            <div className="mb-6">
                                <h4 className="font-heading text-xl text-zinc-900 mb-3">
                                    SPLIT TIMES
                                </h4>
                                <div className="grid grid-cols-4 gap-3">
                                    {selectedRunner.splits.map(
                                        (split, index) => (
                                            <div
                                                key={index}
                                                className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center"
                                            >
                                                <div className="font-body text-xs text-zinc-500 mb-1">
                                                    KM {index + 1}
                                                </div>
                                                <div className="font-display text-xl text-zinc-900">
                                                    {split}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* <div className="flex gap-3">
                                <button className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-green-600 text-white font-heading text-lg rounded-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                                    <Download className="w-5 h-5" />
                                    DOWNLOAD CERTIFICATE
                                </button>
                                <button className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-zinc-900 font-heading text-lg rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <Share2 className="w-5 h-5" />
                                    SHARE RESULT
                                </button>
                            </div> */}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
