import { useParams } from "react-router-dom"
import { useRace } from "../hooks/useRaces"
import Map, { Marker, Source, Layer } from "@vis.gl/react-maplibre"
import { io, type Socket } from "socket.io-client"
import { useEffect, useRef, useState } from "react"
import {
    Flag,
    Play,
    User,
    Users,
    Clock,
    TrendingUp,
    Zap,
    Target,
} from "lucide-react"
import { getBoundsFromCoords } from "../../../lib/geo"
import { useUser } from "../../auth/hooks/useUser"

const SOCKET_URL = import.meta.env.VITE_PUBLIC_SOCKET_URL

type LiveState = {
    lat: number
    lng: number
    speed: number
    distance: number
}

type ParticipantState = {
    userId: string
    coords: [number, number]
    speed: number
    timestamp: number
    distance: number
}

export default function RacesRun() {
    const { data: user } = useUser()
    const { id: raceId } = useParams()
    const { data: race } = useRace(raceId!)
    const socketRef = useRef<Socket | null>(null)

    const [myState, setMyState] = useState<LiveState | null>(null)
    const [participants, setParticipants] = useState<ParticipantState[]>([])
    const [totalDistance, setTotalDistance] = useState(0)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [avgPace, setAvgPace] = useState(0)
    const prevCoordsRef = useRef<[number, number] | null>(null)
    const startTimeRef = useRef<number | null>(null)

    const coords =
        race?.routes?.geojson.features?.[0]?.geometry?.coordinates ?? []
    const flatCoords: [number, number][] = Array.isArray(coords[0])
        ? (coords as [number, number][])
        : []

    const firstCoord = flatCoords[0]
    const lastCoord = flatCoords[flatCoords.length - 1]

    // Calculate distance between two coordinates (Haversine formula)
    const haversineDistance = (
        [lng1, lat1]: [number, number],
        [lng2, lat2]: [number, number]
    ) => {
        const R = 6371000 // Earth's radius in meters
        const toRad = (x: number) => (x * Math.PI) / 180
        const dLat = toRad(lat2 - lat1)
        const dLon = toRad(lng2 - lng1)
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) ** 2
        return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    }

    // Format time
    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
                .toString()
                .padStart(2, "0")}`
        }
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const progressPercentage = race?.routes?.distance
        ? Math.min((totalDistance / race.routes.distance) * 100, 100)
        : 0

    useEffect(() => {
        const s = io(SOCKET_URL)
        socketRef.current = s

        s.emit("joinRace", { raceId })

        // Listen for other participants
        s.on("participantUpdate", (data: ParticipantState[]) => {
            setParticipants(data)
        })

        return () => {
            s.emit("leaveRace", { raceId })
            s.disconnect()
        }
    }, [raceId])

    useEffect(() => {
        if (!navigator.geolocation) return

        startTimeRef.current = Date.now()

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude, speed } = pos.coords
                const coords: [number, number] = [longitude, latitude]

                // Calculate distance
                if (prevCoordsRef.current) {
                    const meters = haversineDistance(
                        prevCoordsRef.current,
                        coords
                    )
                    setTotalDistance((d) => d + meters / 1000)
                }
                prevCoordsRef.current = coords

                const next = {
                    lat: latitude,
                    lng: longitude,
                    speed: speed ? speed * 3.6 : 0,
                    distance: totalDistance,
                }

                setMyState(next)

                socketRef.current?.emit("participantUpdate", {
                    raceId,
                    userId: user?.id ?? "",
                    coords: [longitude, latitude],
                    speed: speed ?? 0,
                    timestamp: Date.now(),
                })
            },
            console.error,
            {
                enableHighAccuracy: true,
                maximumAge: 1000,
                timeout: 10000,
            }
        )

        return () => navigator.geolocation.clearWatch(watchId)
    }, [raceId, totalDistance])

    // Timer
    useEffect(() => {
        const interval = setInterval(() => {
            if (startTimeRef.current) {
                const elapsed = Math.floor(
                    (Date.now() - startTimeRef.current) / 1000
                )
                setElapsedTime(elapsed)

                if (totalDistance > 0) {
                    const minutes = elapsed / 60
                    const pace = minutes / totalDistance
                    setAvgPace(pace)
                }
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [totalDistance])

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

                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.7;
                        transform: scale(1.3);
                    }
                }

                .pulse-dot {
                    animation: pulse 2s ease-in-out infinite;
                }
            `}</style>

            {/* Header */}
            <div className="bg-white border-b-2 border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-600 to-green-600 flex items-center justify-center">
                                <Flag className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="font-display text-4xl text-zinc-900">
                                    {race?.name || "Live Race"}
                                </h1>
                                <p className="font-body text-base text-zinc-600 mt-1">
                                    Real-time race tracking
                                </p>
                            </div>
                        </div>

                        {/* Live Badge */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 border-2 border-green-200 rounded-lg">
                            <div className="w-3 h-3 bg-green-600 rounded-full pulse-dot"></div>
                            <span className="font-heading text-lg text-green-700">
                                LIVE
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Map Section */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm">
                            <div className="h-[600px] relative">
                                <Map
                                    mapStyle="https://api.maptiler.com/maps/streets-v4/style.json?key=l60bj9KIXXKDXbsOvzuz"
                                    attributionControl={false}
                                    style={{ width: "100%", height: "100%" }}
                                    onLoad={(e) => {
                                        if (flatCoords.length > 1) {
                                            e.target.fitBounds(
                                                getBoundsFromCoords(flatCoords),
                                                {
                                                    padding: 60,
                                                    duration: 800,
                                                }
                                            )
                                        }
                                    }}
                                >
                                    {/* Route Line */}
                                    <Source
                                        id="route"
                                        type="geojson"
                                        data={{
                                            type: "Feature",
                                            geometry: {
                                                type: "LineString",
                                                coordinates: flatCoords,
                                            },
                                            properties: {},
                                        }}
                                    >
                                        <Layer
                                            id="route-line"
                                            type="line"
                                            paint={{
                                                "line-color": "#0891b2",
                                                "line-width": 5,
                                                "line-opacity": 0.8,
                                            }}
                                        />
                                    </Source>

                                    {/* Start Marker */}
                                    {firstCoord && (
                                        <Marker
                                            longitude={firstCoord[0]}
                                            latitude={firstCoord[1]}
                                        >
                                            <div className="p-3 bg-green-600 rounded-full text-white shadow-lg border-2 border-white">
                                                <Play className="w-5 h-5" />
                                            </div>
                                        </Marker>
                                    )}

                                    {/* Finish Marker */}
                                    {lastCoord && (
                                        <Marker
                                            longitude={lastCoord[0]}
                                            latitude={lastCoord[1]}
                                        >
                                            <div className="p-3 bg-red-600 rounded-full text-white shadow-lg border-2 border-white">
                                                <Flag className="w-5 h-5" />
                                            </div>
                                        </Marker>
                                    )}

                                    {/* Your Position */}
                                    {myState && (
                                        <Marker
                                            longitude={myState.lng}
                                            latitude={myState.lat}
                                        >
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-cyan-600 rounded-full opacity-30 pulse-dot"></div>
                                                <div className="p-3 bg-gradient-to-br from-cyan-600 to-green-600 rounded-full text-white shadow-xl border-3 border-white relative">
                                                    <User className="w-6 h-6" />
                                                </div>
                                            </div>
                                        </Marker>
                                    )}

                                    {/* Other Participants */}
                                    {participants.length > 0 &&
                                        participants.map((p) => (
                                            <Marker
                                                key={p.userId}
                                                longitude={p.coords[0]}
                                                latitude={p.coords[1]}
                                            >
                                                <div className="p-2 bg-orange-500 rounded-full text-white shadow-lg border-2 border-white">
                                                    <User className="w-4 h-4" />
                                                </div>
                                            </Marker>
                                        ))}
                                </Map>
                            </div>

                            {/* Map Legend */}
                            <div className="px-6 py-4 bg-gray-50 border-t-2 border-gray-200">
                                <div className="flex items-center justify-around text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-green-600 rounded-full border-2 border-white shadow"></div>
                                        <span className="font-body text-zinc-700">
                                            Start
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-cyan-600 rounded-full"></div>
                                        <span className="font-body text-zinc-700">
                                            You
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                        <span className="font-body text-zinc-700">
                                            Others
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow"></div>
                                        <span className="font-body text-zinc-700">
                                            Finish
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Primary Stats */}
                        <div className="bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm">
                            <h2 className="font-heading text-2xl text-zinc-900 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-6 h-6 text-cyan-600" />
                                YOUR STATS
                            </h2>

                            <div className="space-y-4">
                                {/* Distance */}
                                <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 border-2 border-cyan-200 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-body text-xs text-zinc-600 uppercase tracking-wider font-semibold">
                                            Distance
                                        </span>
                                        <Target className="w-4 h-4 text-cyan-600" />
                                    </div>
                                    <div className="font-display text-4xl text-zinc-900">
                                        {totalDistance.toFixed(2)}
                                    </div>
                                    <div className="font-body text-sm text-zinc-600">
                                        kilometers
                                    </div>
                                </div>

                                {/* Time */}
                                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-body text-xs text-zinc-600 uppercase tracking-wider font-semibold">
                                            Time
                                        </span>
                                        <Clock className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div className="font-display text-4xl text-zinc-900">
                                        {formatTime(elapsedTime)}
                                    </div>
                                    <div className="font-body text-sm text-zinc-600">
                                        elapsed
                                    </div>
                                </div>

                                {/* Speed */}
                                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-body text-xs text-zinc-600 uppercase tracking-wider font-semibold">
                                            Current Speed
                                        </span>
                                        <Zap className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div className="font-display text-4xl text-zinc-900">
                                        {myState?.speed.toFixed(1) || "0.0"}
                                    </div>
                                    <div className="font-body text-sm text-zinc-600">
                                        km/h
                                    </div>
                                </div>

                                {/* Pace */}
                                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-body text-xs text-zinc-600 uppercase tracking-wider font-semibold">
                                            Average Pace
                                        </span>
                                        <TrendingUp className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div className="font-display text-4xl text-zinc-900">
                                        {avgPace > 0 ? avgPace.toFixed(1) : "—"}
                                    </div>
                                    <div className="font-body text-sm text-zinc-600">
                                        min/km
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress */}
                        {race?.routes?.distance && (
                            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm">
                                <h2 className="font-heading text-2xl text-zinc-900 mb-4">
                                    RACE PROGRESS
                                </h2>

                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-body text-sm text-zinc-600 font-semibold">
                                            Completion
                                        </span>
                                        <span className="font-heading text-2xl text-cyan-600">
                                            {progressPercentage.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-cyan-600 to-green-600 rounded-full transition-all duration-500"
                                            style={{
                                                width: `${progressPercentage}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-4 border-t-2 border-gray-200">
                                    <div className="text-center">
                                        <div className="font-display text-2xl text-zinc-900">
                                            {totalDistance.toFixed(2)}
                                        </div>
                                        <div className="font-body text-xs text-zinc-600 uppercase">
                                            Covered
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-display text-2xl text-zinc-900">
                                            {(
                                                race.routes.distance -
                                                totalDistance
                                            ).toFixed(2)}
                                        </div>
                                        <div className="font-body text-xs text-zinc-600 uppercase">
                                            Remaining
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Participants */}
                        <div className="bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm">
                            <h2 className="font-heading text-2xl text-zinc-900 mb-4 flex items-center gap-2">
                                <Users className="w-6 h-6 text-orange-600" />
                                ACTIVE RUNNERS
                            </h2>

                            <div className="space-y-3">
                                {/* You */}
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-50 to-green-50 border-2 border-cyan-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-600 to-green-600 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-body text-sm font-bold text-zinc-900">
                                                You
                                            </div>
                                            <div className="font-body text-xs text-zinc-600">
                                                {myState?.speed.toFixed(1) ||
                                                    "0.0"}{" "}
                                                km/h
                                            </div>
                                        </div>
                                    </div>
                                    <div className="font-heading text-base text-cyan-600">
                                        LIVE
                                    </div>
                                </div>

                                {/* Other Participants */}
                                {participants.length > 0 ? (
                                    participants.map((p, idx) => (
                                        <div
                                            key={p.userId}
                                            className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <div className="font-body text-sm font-semibold text-zinc-900">
                                                        Runner {idx + 1}
                                                    </div>
                                                    <div className="font-body text-xs text-zinc-600">
                                                        {(
                                                            p.speed * 3.6
                                                        ).toFixed(1)}{" "}
                                                        km/h
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-zinc-500">
                                        <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                        <p className="font-body text-sm">
                                            No other runners yet
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t-2 border-gray-200 text-center">
                                <div className="font-display text-3xl text-zinc-900">
                                    {participants.length + 1}
                                </div>
                                <div className="font-body text-sm text-zinc-600 uppercase tracking-wider">
                                    Total Active
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
